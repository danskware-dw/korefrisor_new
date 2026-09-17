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

export type AddressSuggestion = {
  id: string;
  text: string;
  postalCode: string;
  city: string;
  lat: number;
  lon: number;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
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
