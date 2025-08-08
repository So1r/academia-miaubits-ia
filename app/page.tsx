export default function Home() {
  return (
    <section className="grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-5xl font-extrabold leading-tight">
          La academia donde los <span className="gradient-text">bits ronronean</span>
        </h1>
        <p className="mt-4 opacity-80">
          Cursos, retos y profesores IA inspirados en tus gatos favoritos. Aprende Python, SQL y más.
        </p>
        <div className="mt-6 space-x-3">
          <a className="px-5 py-3 rounded-xl bg-brand-accent text-black font-bold" href="/cursos">Empezar ahora</a>
          <a className="px-5 py-3 rounded-xl border border-slate-700" href="/retos">Ver retos</a>
        </div>
      </div>
      <div className="card">
        <h3 className="text-xl font-bold mb-2">Lo que obtienes</h3>
        <ul className="list-disc ml-6 opacity-90">
          <li>Rutas guiadas y ejercicios interactivos</li>
          <li>Progreso y certificados verificables</li>
          <li>Suscripciones para todo el contenido</li>
        </ul>
      </div>
    </section>
  );
}
