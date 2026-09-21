import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { business } from "@/config/business";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EmployeeFacts } from "@/components/EmployeeFacts";
import { formatEmployeeBase, genderLabel, hasPublicReviews } from "@/lib/employees";
import { isPlaceholderName, isPlaceholderPhone } from "@/lib/placeholders";
import { getConfig } from "@/lib/runtime-config";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return business.employees.filter((employee) => employee.active).map((employee) => ({
    slug: employee.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = await getConfig();
  const employee = config.employees.find((item) => item.id === slug && item.active);
  if (!employee) return {};
  const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
  const gender = genderLabel(employee.gender);
  const title = `${name} – udekørende frisør`;
  const description = [
    `${name} er ${employee.role.toLowerCase()} hos ${config.name}.`,
    gender ? `${gender}.` : "",
    `Kører op til ${config.travel.maxServiceRadiusKm} km fra ${employee.base.city}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    title: { absolute: `${title} | ${config.name}` },
    description,
    alternates: { canonical: `/frisorer/${employee.id}` },
    openGraph: {
      title: `${title} | ${config.name}`,
      description,
      images: [{ url: employee.image }],
    },
  };
}

export default async function FrisorProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const config = await getConfig();
  const employee = config.employees.find((item) => item.id === slug && item.active);
  if (!employee) notFound();

  const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
  const gender = genderLabel(employee.gender);
  const showPhone = !isPlaceholderPhone(config.phone);
  const reviews = employee.reviews ?? [];
  const showReviews = hasPublicReviews(employee) && reviews.length > 0;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: employee.role,
    image: employee.image,
    worksFor: {
      "@type": "HairSalon",
      name: config.name,
      url: config.siteUrl,
    },
    ...(gender === "Mand" ? { gender: "Male" } : gender === "Kvinde" ? { gender: "Female" } : {}),
    areaServed: config.areas.map((area) => area.name),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { href: "/frisorer", label: "Frisører" },
          { label: name },
        ]}
      />

      <section className="mt-6 overflow-hidden rounded-[1.5rem] bg-brand-dark text-white md:grid md:grid-cols-[minmax(0,18rem)_1fr] md:items-center">
        <Image
          src={employee.image}
          alt={employee.imageAlt}
          width={800}
          height={800}
          priority
          sizes="(min-width: 768px) 18rem, 92vw"
          className="aspect-square w-full object-cover"
        />
        <div className="p-8 pb-28 sm:p-10 md:pb-10">
          <p className="text-lg font-semibold text-white/80">{employee.role}</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{name}</h1>
          <p className="mt-4 text-xl text-white/90">
            Kører fra {formatEmployeeBase(employee.base)}.
          </p>
          {employee.bio && <p className="mt-4 text-lg">{employee.bio}</p>}
          <p className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/book"
              data-btn
              className="inline-flex items-center whitespace-nowrap rounded-lg bg-accent px-8 py-4 text-xl font-semibold text-white hover:bg-accent-dark"
            >
              Book {name}
            </Link>
            {showPhone && (
              <a
                href={`tel:${config.phone.replace(/\s/g, "")}`}
                data-btn
                className="inline-flex items-center rounded-lg border-2 border-white px-8 py-4 text-xl font-semibold text-white hover:bg-brand"
              >
                Ring {config.phone}
              </a>
            )}
          </p>
        </div>
      </section>

      <EmployeeFacts
        employee={employee}
        travel={config.travel}
        areaNames={config.areas.map((area) => area.name)}
        services={config.services}
      />

      {employee.qualifications && employee.qualifications.length > 0 && (
        <>
          <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Hvad {name} er god til</h2>
          <ul className="mt-4 space-y-2 text-lg">
            {employee.qualifications.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-14 text-2xl font-bold sm:text-3xl">Anmeldelser</h2>
      {showReviews ? (
        <ul className="mt-6 grid gap-5">
          {reviews.map((review) => (
            <li
              key={`${review.name}-${review.quote}`}
              className="rounded-card border border-line bg-surface p-6"
            >
              <p className="text-lg">“{review.quote}”</p>
              <p className="mt-3 font-semibold">
                {review.name}
                {review.area ? `, ${review.area}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-card border border-line bg-surface p-6">
          <p className="text-lg text-ink-soft">
            Der er ikke lagt anmeldelser ind endnu. Vi viser kun rigtige anmeldelser, når de
            er der.
          </p>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </div>
  );
}
