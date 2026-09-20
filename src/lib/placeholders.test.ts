import { describe, expect, it } from "vitest";
import {
  isPlaceholderEmail,
  isPlaceholderName,
  isPlaceholderPhone,
} from "./placeholders";

describe("placeholders", () => {
  it("detects example phone numbers", () => {
    expect(isPlaceholderPhone("+45 00 00 00 00")).toBe(true);
    expect(isPlaceholderPhone("00000000")).toBe(true);
    expect(isPlaceholderPhone("+45 12 34 56 78")).toBe(false);
  });

  it("detects example emails and names", () => {
    expect(isPlaceholderEmail("kontakt@example.dk")).toBe(true);
    expect(isPlaceholderEmail("hej@korefrisoren.dk")).toBe(false);
    expect(isPlaceholderName("[RET DETTE: dit navn]")).toBe(true);
    expect(isPlaceholderName("Anna Jensen")).toBe(false);
  });
});
