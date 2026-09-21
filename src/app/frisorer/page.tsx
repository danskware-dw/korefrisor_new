import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { business } from "@/config/business";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatEmployeeBase, genderLabel } from "@/lib/employees";
import { isPlaceholderName } from "@/lib/placeholders";
import { getConfig } from "@/lib/runtime-config";

export const metadata: Metadata = {
  title: { absolute: `Frisører | ${business.name}` },
  description: `Mød frisørerne hos ${business.name}. Se køn, kørselsområde, behandlinger og anmeldelser, og book et hjemmeklip.`,
  alternates: { canonical: "/frisorer" },
};

export default async function FrisorerPage() {
  const config = await getConfig();
  const people = config.employees.filter((employee) => employee.active);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <Breadcrumbs
        items={[
          { href: "/", label: "Forside" },
          { label: "Frisører" },
        ]}
      />
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Frisører</h1>
      <p className="mt-4 max-w-3xl text-xl text-ink-soft">
        Her kan du se, hvem der kan komme hjem til dig, hvor de kører, og hvilke
        behandlinger de laver.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((employee) => {
          const gender = genderLabel(employee.gender);
          const name = isPlaceholderName(employee.name) ? employee.role : employee.name;
          return (
            <li key={employee.id}>
              <Link
                href={`/frisorer/${employee.id}`}
                className="flex h-full flex-col items-center rounded-card border-2 border-line bg-surface px-5 py-8 text-center hover:border-brand"
              >
                <Image
                  src={employee.image}
                  alt={employee.imageAlt}
                  width={160}
                  height={160}
                  className="size-28 rounded-full border border-line object-cover"
                />
                <span className="mt-4 text-xl font-bold">{name}</span>
                <span className="text-ink-soft">{employee.role}</span>
                {gender && <span className="mt-1 text-ink-soft">{gender}</span>}
                <span className="mt-2 text-ink-soft">
                  Kører fra {formatEmployeeBase(employee.base)}
                </span>
                <span className="mt-4 font-semibold text-brand underline">Se profil</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-12 text-lg">
        Selv frisør?{" "}
        <Link href="/bliv-frisor" className="font-semibold text-brand underline">
          Bliv udekørende frisør
        </Link>
        .
      </p>
    </div>
  );
}
