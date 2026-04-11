/**
 * PayPalCheckout
 *
 * Wraps @paypal/react-paypal-js to:
 *  1. Call the create-paypal-order edge function to get a PayPal order ID.
 *  2. On approval, call the capture-paypal-order edge function.
 *  3. Invoke onSuccess with the capture details.
 */
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '../lib/supabase';

interface Props {
  variantId: string;
  priceCents: number;
  title: string;
  onSuccess: (details: { captureId: string | null; buyerEmail: string | null }) => void;
  onError?: (err: Error) => void;
}

const SUPABASE_URL = 'https://snulcgtnlurperqqkaps.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudWxjZ3RubHVycGVycXFrYXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjU4NTgsImV4cCI6MjA4NjE0MTg1OH0.eeR66DGAzaD0rvSnyXOmLQJCLCOXA_dzvYr1JX6kEfk';

async function callEdgeFunction(
  path: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json() as Record<string, unknown>;
  if (!res.ok) throw new Error((data.error as string) ?? `HTTP ${res.status}`);
  return data;
}

export default function PayPalCheckout({ variantId, priceCents, title, onSuccess, onError }: Props) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;

  if (!clientId) {
    return (
      <p style={{ fontSize: '0.82rem', color: '#b0a89e', fontStyle: 'italic' }}>
        PayPal checkout not configured (VITE_PAYPAL_CLIENT_ID missing).
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'GBP',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
        createOrder={async () => {
          const data = await callEdgeFunction('create-paypal-order', {
            variantId,
            quantity: 1,
          });
          return data.id as string;
        }}
        onApprove={async (approveData) => {
          try {
            const data = await callEdgeFunction('capture-paypal-order', {
              paypalOrderId: approveData.orderID,
            });
            onSuccess({
              captureId: (data.captureId as string) ?? null,
              buyerEmail: (data.buyerEmail as string) ?? null,
            });
          } catch (err) {
            onError?.(err as Error);
          }
        }}
        onError={(err) => {
          onError?.(new Error(String(err)));
        }}
      />
    </PayPalScriptProvider>
  );
}
