import Image from "next/image";

export default function AboutPage() {
  return (
    <section>
      <h1 className="text-4xl font-extrabold mb-8">¿Quiénes somos?</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <Image src="/avatars/karen.png" alt="Karen (Data/BI) con Minina" width={480} height={720} className="rounded-xl" />
          <h3 className="mt-4 text-2xl font-bold">Karen</h3>
          <p className="opacity-80">Empática, guía paso a paso. BI, calidad y gobierno de datos.</p>
        </div>
        <div className="card">
          <Image src="/avatars/rios.png" alt="Rios (Data/Dev) con Kira" width={480} height={720} className="rounded-xl" />
          <h3 className="mt-4 text-2xl font-bold">Rios</h3>
          <p className="opacity-80">Estructura, rendimiento y dev. Spark, ETL y 3D.</p>
        </div>
      </div>
    </section>
  );
}
