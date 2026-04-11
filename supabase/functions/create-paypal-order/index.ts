// supabase/functions/create-paypal-order/index.ts
// Creates a PayPal Orders v2 order and inserts a pending row in public.orders.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_BASE =
  Deno.env.get("PAYPAL_ENV") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
  const secret = Deno.env.get("PAYPAL_SECRET")!;
  const credentials = btoa(`${clientId}:${secret}`);

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { variantId, quantity = 1 } = await req.json() as {
      variantId: string;
      quantity?: number;
    };

    if (!variantId) {
      return new Response(JSON.stringify({ error: "variantId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch variant details from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: variant, error: variantError } = await supabase
      .from("edition_variants")
      .select("id, label, price_cents, currency, stock, edition_id, editions(title)")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return new Response(JSON.stringify({ error: "Variant not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check stock
    if (variant.stock !== null && variant.stock < quantity) {
      return new Response(JSON.stringify({ error: "Insufficient stock" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalCents = variant.price_cents * quantity;
    const totalStr = (totalCents / 100).toFixed(2);
    const currency = variant.currency ?? "GBP";

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();
    const editionTitle = (variant.editions as { title: string } | null)?.title ?? "Page Gallery Edition";

    const paypalRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${editionTitle} — ${variant.label}`,
            amount: {
              currency_code: currency,
              value: totalStr,
            },
          },
        ],
      }),
    });

    if (!paypalRes.ok) {
      const text = await paypalRes.text();
      throw new Error(`PayPal create-order error ${paypalRes.status}: ${text}`);
    }

    const paypalOrder = await paypalRes.json();

    // Insert pending order row — fatal: if this fails we can't track the capture
    const { error: insertError } = await supabase.from("orders").insert({
      variant_id: variantId,
      quantity,
      amount_cents: totalCents,
      currency,
      status: "pending",
      paypal_order_id: paypalOrder.id,
    });

    if (insertError) {
      console.error("Order insert error:", insertError);
      // Void the PayPal order so funds are not held without a DB record
      try {
        const voidToken = await getPayPalAccessToken();
        await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrder.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${voidToken}` },
        });
      } catch (voidErr) {
        console.error("PayPal order void failed:", voidErr);
      }
      throw new Error("Failed to record order — please try again.");
    }

    return new Response(
      JSON.stringify({ id: paypalOrder.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
