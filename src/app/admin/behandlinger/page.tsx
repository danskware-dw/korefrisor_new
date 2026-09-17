import type { Metadata } from "next";
import type { Service } from "@/config/types";
import { getConfig } from "@/lib/runtime-config";
import { requireAdmin, addService, removeService, updateService } from "../actions";

export const metadata: Metadata = { title: "Behandlinger" };

const images = [
  { value: "/behandlinger/klip.png", label: "Klip" },
  { value: "/behandlinger/pensionistklip.png", label: "Pensionist" },
  { value: "/behandlinger/boerneklip.png", label: "Barn" },
  { value: "/behandlinger/plejehjem.png", label: "Plejehjem" },
  { value: "/behandlinger/hjemmebesoeg.png", label: "Hjemmebesøg" },
];

const field =
  "w-full rounded-lg border-2 border-line bg-surface px-4 py-3 text-lg";

export default async function BehandlingerAdminPage() {
  await requireAdmin();
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Behandlinger</h1>
      <p className="mt-2 text-ink-soft">
        Ret navn, pris og tid — eller slet en behandling. Ændringer vises med det samme
        på hjemmesiden og i bookingen.
      </p>

      <ul className="mt-8 space-y-8">
        {config.services.map((service) => (
          <li key={service.id} className="rounded-card border border-line bg-surface p-5">
            <ServiceForm service={service} canDelete={config.services.length > 1} />
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-card border border-line bg-surface p-5">
        <h2 className="text-2xl font-bold">Tilføj behandling</h2>
        <form action={addService} className="mt-4 grid gap-4">
          <ServiceFields />
          <button
            type="submit"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Tilføj
          </button>
        </form>
      </section>
    </div>
  );
}

function ServiceForm({ service, canDelete }: { service: Service; canDelete: boolean }) {
  return (
    <form action={updateService} className="grid gap-4">
      <input type="hidden" name="id" value={service.id} />
      <ServiceFields service={service} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Gem
        </button>
        {canDelete && (
          <button
            formAction={removeService}
            className="rounded-lg border-2 border-line px-6 py-3 font-semibold hover:border-brand"
          >
            Slet
          </button>
        )}
      </div>
    </form>
  );
}

function ServiceFields({ service }: { service?: Service }) {
  return (
    <>
      <label className="block">
        <span className="font-semibold">Navn</span>
        <input name="name" required defaultValue={service?.name ?? ""} className={`mt-1 ${field}`} />
      </label>
      <label className="block">
        <span className="font-semibold">Beskrivelse</span>
        <textarea
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
          className={`mt-1 ${field}`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-semibold">Pris (kr.)</span>
          <input
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={service?.price ?? 300}
            className={`mt-1 ${field}`}
          />
        </label>
        <label className="block">
          <span className="font-semibold">Varighed (minutter)</span>
          <input
            name="durationMinutes"
            type="number"
            min={10}
            step={5}
            defaultValue={service?.durationMinutes ?? 45}
            className={`mt-1 ${field}`}
          />
        </label>
      </div>
      <label className="block">
        <span className="font-semibold">Billede</span>
        <select name="image" defaultValue={service?.image ?? images[0].value} className={`mt-1 ${field}`}>
          {images.map((image) => (
            <option key={image.value} value={image.value}>
              {image.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-semibold">Billedtekst</span>
        <input name="imageAlt" defaultValue={service?.imageAlt ?? ""} className={`mt-1 ${field}`} />
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="contactOnly"
          defaultChecked={service?.contactOnly}
          className="size-6"
        />
        <span>Kun efter telefon (vises ikke i bookingen)</span>
      </label>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="addon"
          defaultChecked={service?.addon}
          className="size-6"
        />
        <span>Tillæg (kan ikke bookes uden et klip)</span>
      </label>
    </>
  );
}
