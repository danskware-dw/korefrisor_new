"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fieldClass } from "@/components/booking-ui";

type Slot = { time: string };

export function RescheduleForm({
  token,
  durationMinutes,
  employeeId,
  lat,
  lon,
}: {
  token: string;
  durationMinutes: number;
  employeeId?: string;
  lat: number;
  lon: number;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!date) return;
    const loc = `&lat=${lat}&lon=${lon}`;
    const frisor = employeeId ? `&frisor=${encodeURIComponent(employeeId)}` : "";
    fetch(`/api/ledige-tider?dato=${date}&varighed=${durationMinutes}${frisor}${loc}`)
      .then((r) => r.json())
      .then((data: { slots?: Slot[] }) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]));
  }, [date, durationMinutes, employeeId, lat, lon]);

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/aftale/flyt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, date, time }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Kunne ikke flytte tiden.");
        return;
      }
      router.refresh();
    } catch {
      setError("Netværksfejl.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 rounded-card border-2 border-line p-6">
      <h2 className="text-xl font-bold">Flyt tid</h2>
      <label className="mt-4 block font-semibold">
        Ny dag
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setTime("");
          }}
          className={`mt-1 ${fieldClass}`}
        />
      </label>
      {slots.length > 0 && (
        <label className="mt-4 block font-semibold">
          Tid
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`mt-1 ${fieldClass}`}
          >
            <option value="">Vælg tid</option>
            {slots.map((slot) => (
              <option key={slot.time} value={slot.time}>
                {slot.time}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        disabled={busy || !date || !time}
        onClick={submit}
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-brand px-8 py-4 text-xl font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Flytter …" : "Gem ny tid"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-semibold text-[#991B1B]">
          {error}
        </p>
      )}
    </div>
  );
}
