import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="xpo-card block overflow-hidden"
    >
      {project.thumbnail && (
        <img
          src={project.thumbnail}
          alt=""
          className="h-64 w-full object-cover"
        />
      )}
      <div className="p-6">
        <p className="mb-2 text-xs uppercase tracking-[.2em] text-slate-400">
          {project.category}
        </p>
        <h3 className="text-2xl font-semibold">{project.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {project.description}
        </p>
      </div>
    </Link>
  );
}
