import { describe, expect, it } from "vitest";
import { parseApplication } from "./applications";

const valid = {
  name: "Sara Nielsen",
  phone: "42 79 74 00",
  city: "Tårnby",
  message: "Jeg er uddannet frisør og vil gerne køre hjem til kunder.",
};

describe("parseApplication", () => {
  it("accepts a complete Danish application", () => {
    const result = parseApplication(valid);
    expect(result).toEqual({
      ok: true,
      value: {
        name: valid.name,
        phone: valid.phone,
        city: valid.city,
        message: valid.message,
      },
    });
  });

  it("swallows honeypot spam without error", () => {
    expect(parseApplication({ ...valid, honeypot: "http://spam.example" })).toEqual({
      ok: true,
      spam: true,
    });
  });

  it("rejects an invalid phone number", () => {
    const result = parseApplication({ ...valid, phone: "123" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/telefon/i);
  });
});
