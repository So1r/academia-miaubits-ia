import { supabaseServer } from "@/lib/supabase";

type PreferenceInput = { title: string; price_cents: number };

export async function createCheckoutPreference(input: PreferenceInput) {
  const url = "https://api.mercadopago.com/checkout/preferences";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: [{ title: input.title, quantity: 1, currency_id: "MXN", unit_price: input.price_cents / 100 }],
      notification_url: `${process.env.SITE_URL}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${process.env.SITE_URL}/suscripciones/success`,
        failure: `${process.env.SITE_URL}/suscripciones/failure`,
        pending: `${process.env.SITE_URL}/suscripciones/pending`
      },
      auto_return: "approved",
      external_reference: `plan_${Date.now()}`,
      statement_descriptor: "MIAUBITS" // (puede tener límite ~13 chars; si tu cuenta no lo permite, MP lo ignora)
    })
  });
  if (!res.ok) throw new Error("Mercado Pago error");
  return res.json(); // contiene init_point
}

export async function upsertWebhookEvent(args: {
  provider: string; event_type: string; dedupe_key: string; payload: any; signature_valid: boolean;
}) {
  const sb = supabaseServer();
  const { data, error } = await sb.from("webhook_events")
    .upsert({
      provider: args.provider,
      event_type: args.event_type,
      dedupe_key: args.dedupe_key,
      payload: args.payload,
      signature_valid: args.signature_valid,
      processed_at: null
    }, { onConflict: "dedupe_key" }).select().single();
  if (error) throw error;
  return data;
}
