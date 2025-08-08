import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { upsertWebhookEvent } from "@/lib/payments/mercadopago";

export async function POST(req: NextRequest) {
  // Firma (TODO: validar correctamente según MP; requerirá MP_WEBHOOK_SECRET)
  const sig = headers().get("x-signature") || "";
  const body = await req.json();

  // Dedupe básico por id del evento (MP envía 'id' o 'data.id' dependiendo del tipo)
  const eventId = body?.id || body?.data?.id || crypto.randomUUID();
  await upsertWebhookEvent({
    provider: "mercadopago",
    event_type: body?.type ?? "unknown",
    dedupe_key: String(eventId),
    payload: body,
    signature_valid: sig.length > 0 // TODO real
  });

  // TODO: encolar el procesamiento por tipo (payment_succeeded, payment_failed, etc.)
  return NextResponse.json({ ok: true });
}
