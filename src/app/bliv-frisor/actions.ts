"use server";

import { redirect } from "next/navigation";
import { insertApplication, parseApplication } from "@/lib/applications";
import { sendJobApplicationNotice } from "@/lib/notify";

export async function submitApplication(formData: FormData): Promise<void> {
  const parsed = parseApplication({
    name: String(formData.get("navn") ?? ""),
    phone: String(formData.get("telefon") ?? ""),
    city: String(formData.get("by") ?? ""),
    message: String(formData.get("besked") ?? ""),
    honeypot: String(formData.get("hjemmeside") ?? ""),
  });

  if (!parsed.ok) {
    redirect(`/bliv-frisor?fejl=${encodeURIComponent(parsed.error)}#ansoeg`);
  }
  if (!("value" in parsed)) {
    redirect("/bliv-frisor?sendt=1#ansoeg");
  }

  try {
    const saved = await insertApplication(parsed.value);
    await sendJobApplicationNotice(saved).catch(() => undefined);
  } catch {
    redirect(
      `/bliv-frisor?fejl=${encodeURIComponent("Kunne ikke gemme. Ring i stedet.")}#ansoeg`,
    );
  }
  redirect("/bliv-frisor?sendt=1#ansoeg");
}
