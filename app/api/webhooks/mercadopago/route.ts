import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-signature');
  const body = await req.json();

  // TODO: validar firma según MP y dedupe por event id
  // guardar en webhook_events y procesar por tipo

  return NextResponse.json({ ok: true });
}