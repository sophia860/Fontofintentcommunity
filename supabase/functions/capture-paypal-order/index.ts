// supabase/functions/capture-paypal-order/index.ts
// Captures a PayPal order, marks the DB order as paid, and decrements stock.

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
    const { paypalOrderId } = await req.json() as { paypalOrderId: string };

    if (!paypalOrderId) {
      return new Response(JSON.stringify({ error: "paypalOrderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch pending order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, variant_id, quantity, status")
      .eq("paypal_order_id", paypalOrderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "paid") {
      return new Response(
        JSON.stringify({ message: "Already captured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Capture with PayPal
    const accessToken = await getPayPalAccessToken();
    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": `capture-${paypalOrderId}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({}),
      },
    );

    if (!captureRes.ok) {
      const text = await captureRes.text();
      throw new Error(`PayPal capture error ${captureRes.status}: ${text}`);
    }

    const captureData = await captureRes.json();
    const capture =
      captureData.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id ?? null;
    const buyerEmail =
      captureData.payer?.email_address ?? null;
    const buyerName =
      captureData.payer?.name
        ? `${captureData.payer.name.given_name ?? ""} ${captureData.payer.name.surname ?? ""}`.trim()
        : null;

    // Mark order as paid
    await supabase
      .from("orders")
      .update({
        status: "paid",
        paypal_capture_id: captureId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
      })
      .eq("id", order.id);

    // Decrement stock
    await supabase.rpc("decrement_stock", {
      variant_id: order.variant_id,
      qty: order.quantity,
    });

    return new Response(
      JSON.stringify({ captureId, buyerEmail }),
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
