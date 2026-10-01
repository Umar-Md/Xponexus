import Link from "next/link";

async function getProject(slug) {
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/projects/${slug}`,
    {cache:"no-store"});
  if (!r.ok) return null;
  return r.json();
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return <main className="xpo-shell py-20">Project not found.</main>;
  return (
    <main className="xpo-shell py-16">
      <Link href="/" className="text-sm text-slate-400">← Back</Link>
      <p className="mt-14 text-xs uppercase tracking-[.25em] text-slate-500">{p.category}</p>
      <h1 className="mt-3 text-5xl font-bold">{p.title}</h1>
      <p className="mt-6 max-w-3xl leading-8 text-slate-400">{p.description}</p>
      {p.scope && <p className="mt-4 text-slate-300"><b>Scope:</b> {p.scope}</p>}
      <h2 className="mt-16 text-2xl font-semibold">Drawings</h2>
      <div className="mt-6 grid gap-4">
        {(p.drawings || []).map(d => (
          <a key={d.id} href={d.pdf_url} target="_blank" className="xpo-card p-5">
            <div className="font-semibold">{d.title}</div>
            <div className="mt-1 text-sm text-slate-500">{d.reference}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
