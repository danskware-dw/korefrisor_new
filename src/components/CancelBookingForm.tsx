"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelBookingForm({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/aflys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Aflysning mislykkedes.");
        return;
      }
      router.refresh();
    } catch {
      setError("Netværksfejl. Prøv igen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={busy}
        onClick={handleCancel}
        className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-8 py-5 text-xl font-bold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Aflyser …" : "Ja, aflys min tid"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-semibold text-[#991B1B]">
          {error}
        </p>
      )}
    </div>
  );
}
