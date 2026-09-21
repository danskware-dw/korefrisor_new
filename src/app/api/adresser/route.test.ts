import { describe, expect, it } from "vitest";
import { suggestionFromReverse } from "./route";

describe("suggestionFromReverse", () => {
  it("maps a DAWA reverse hit to an address suggestion", () => {
    expect(
      suggestionFromReverse({
        id: "abc",
        adressebetegnelse: "Kastrupvej 12, 2770 Kastrup",
        adgangspunkt: { koordinater: [12.6453, 55.6306] },
        postnummer: { nr: "2770", navn: "Kastrup" },
      }),
    ).toEqual({
      id: "abc",
      text: "Kastrupvej 12, 2770 Kastrup",
      postalCode: "2770",
      city: "Kastrup",
      lat: 55.6306,
      lon: 12.6453,
    });
  });

  it("returns null when DAWA omits coordinates", () => {
    expect(
      suggestionFromReverse({
        id: "abc",
        adressebetegnelse: "Kastrupvej 12, 2770 Kastrup",
        adgangspunkt: undefined,
        postnummer: { nr: "2770", navn: "Kastrup" },
      }),
    ).toBeNull();
  });
});
