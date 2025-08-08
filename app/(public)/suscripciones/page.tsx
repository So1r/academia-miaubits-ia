import { createCheckoutPreference } from "@/lib/payments/mercadopago";

export default async function SuscripcionesPage() {
  // Placeholder de server action simple: creamos preferencias al vuelo (demo)
  async function getLink(price: number, title: string) {
    "use server";
    const pref = await createCheckoutPreference({ title, price_cents: price * 100 });
    return pref.init_point;
  }

  const aprendiz = await getLink(50, "Plan Aprendiz (Mensual)");
  const legendario = await getLink(200, "Plan Miau Legendario (Mensual)");

  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-8">Suscripciones</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold">Aprendiz — $50 MXN/mes</h3>
          <p className="opacity-80 mb-4">Acceso a todos los cursos y retos.</p>
          <a className="px-4 py-2 rounded-xl bg-brand-accent text-black font-bold" href={aprendiz}>Suscribirme</a>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold">Miau Legendario — $200 MXN/mes</h3>
          <p className="opacity-80 mb-4">Todo + proyectos reales y figura 3D (próximo).</p>
          <a className="px-4 py-2 rounded-xl bg-brand-accent text-black font-bold" href={legendario}>Suscribirme</a>
        </div>
      </div>
    </section>
  );
}
