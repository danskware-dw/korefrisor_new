import { NextResponse } from "next/server";

/**
 * Adresseopslag via DAWA (Danmarks Adresseregister, api.dataforsyningen.dk).
 * Gratis og kræver ingen nøgle. Kaldet går gennem vores egen server, så vi kan
 * begrænse svaret til det vi har brug for.
 */

type DawaAddress = {
  tekst: string;
  adresse: {
    id: string;
    postnr: string;
    postnrnavn: string;
    x: number; // længdegrad
    y: number; // breddegrad
  };
};

type DawaReverse = {
  id?: string;
  adressebetegnelse?: string;
  postnummer?: { nr?: string; navn?: string };
  adgangspunkt?: { koordinater?: [number, number] };
};

export type AddressSuggestion = {
  id: string;
  text: string;
  postalCode: string;
  city: string;
  lat: number;
  lon: number;
};

  // ponytail: nearest access address (building), not floor/door — user can correct
export function suggestionFromReverse(data: DawaReverse): AddressSuggestion | null {
  const coords = data.adgangspunkt?.koordinater;
  const postal = data.postnummer;
  if (!data.id || !data.adressebetegnelse || !coords || !postal?.nr || !postal.navn) {
    return null;
  }
  return {
    id: data.id,
    text: data.adressebetegnelse,
    postalCode: postal.nr,
    city: postal.navn,
    lat: coords[1],
    lon: coords[0],
  };
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return reverseLookup(lat, lon);
  }

  const query = params.get("q")?.trim() ?? "";
  if (query.length < 3) return NextResponse.json({ suggestions: [] });

  const url = new URL("https://api.dataforsyningen.dk/adresser/autocomplete");
  url.searchParams.set("q", query);
  url.searchParams.set("per_side", "8");
  url.searchParams.set("type", "adresse");

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`DAWA svarede ${response.status}`);

    const data = (await response.json()) as DawaAddress[];
    const suggestions: AddressSuggestion[] = data
      .filter((item) => item.adresse?.y && item.adresse?.x)
      .map((item) => ({
        id: item.adresse.id,
        text: item.tekst,
        postalCode: item.adresse.postnr,
        city: item.adresse.postnrnavn,
        lat: item.adresse.y,
        lon: item.adresse.x,
      }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { suggestions: [], error: "Adresseopslaget kunne ikke nås. Prøv igen." },
      { status: 502 },
    );
  }
}

async function reverseLookup(lat: number, lon: number) {
  const url = new URL("https://api.dataforsyningen.dk/adgangsadresser/reverse");
  url.searchParams.set("x", String(lon));
  url.searchParams.set("y", String(lat));

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`DAWA svarede ${response.status}`);
    const suggestion = suggestionFromReverse((await response.json()) as DawaReverse);
    return NextResponse.json({ suggestions: suggestion ? [suggestion] : [] });
  } catch {
    return NextResponse.json(
      { suggestions: [], error: "Adresseopslaget kunne ikke nås. Prøv igen." },
      { status: 502 },
    );
  }
}
