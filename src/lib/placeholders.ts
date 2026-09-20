/** Sandt når dashboard-felter stadig rummer eksempeldata. */

export function isPlaceholderName(value: string): boolean {
  return /RET DETTE/i.test(value);
}

export function isPlaceholderPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return true;
  const national = digits.startsWith("45") && digits.length >= 10 ? digits.slice(2) : digits;
  return /^0+$/.test(national);
}

export function isPlaceholderEmail(email: string): boolean {
  return /example\.(dk|com)/i.test(email);
}
