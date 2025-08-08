import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Miau&Bits Academy",
  description: "Aprende programación con profesores IA (gatos) — divertido e inclusivo."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-800">
          <nav className="container h-14 flex items-center justify-between">
            <a href="/" className="font-extrabold text-xl gradient-text">Miau&Bits</a>
            <div className="space-x-4 text-sm">
              <a href="/cursos">Cursos</a>
              <a href="/retos">Retos</a>
              <a href="/suscripciones">Suscripciones</a>
              <a href="/about">¿Quiénes somos?</a>
              <a href="/dashboard" className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">Dashboard</a>
            </div>
          </nav>
        </header>
        <main className="container py-10">{children}</main>
        <footer className="mt-16 py-10 text-center opacity-70">Hecho con 🐾 por Rios & Karen</footer>
      </body>
    </html>
  );
}
