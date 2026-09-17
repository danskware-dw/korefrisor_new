/** Viser medarbejderens udgangspunkt som én linje. */
export function formatEmployeeBase(base: {
  street: string;
  postalCode: string;
  city: string;
}): string {
  const street = base.street.includes("[RET DETTE]") ? "" : base.street.trim();
  const place = [base.postalCode, base.city].filter(Boolean).join(" ").trim();
  if (street && place) return `${street}, ${place}`;
  if (street) return street;
  return place || "Område ikke angivet";
}
