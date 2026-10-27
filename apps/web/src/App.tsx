// Página provisoria de la Fase 0: confirma que Vite, Tailwind, los tokens y las fuentes cargan.
// Se reemplaza por el enrutador con guardas por rol en la Fase 1.
export function App() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-md rounded-card border bg-card p-6">
        <p className="sobretitulo">ServiceMatch · MVP 1.0</p>
        <h1 className="mt-2 font-display text-titulo-1-movil text-primary-strong md:text-titulo-1">
          Estructura lista
        </h1>
        <p className="mt-2 text-text-muted">
          El monorepo está levantado. El design system llega en la Fase 2 y las pantallas de los
          mockups en la Fase 3.
        </p>
      </section>
    </main>
  );
}
