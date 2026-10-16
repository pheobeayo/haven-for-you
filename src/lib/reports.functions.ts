import { createServerFn } from "@tanstack/react-start";
import { parseSingle, type Identifier, type ReportType } from "./identifiers";
import { hashDevice, lookupReports, saveReport } from "./reports.server";

const TYPES: ReportType[] = ["phone_number", "bank_account", "link", "wallet", "message_pattern"];

// "report-scam": accepts {items:[{kind,value}], scam_type, device_id} and the older UI shape.
export const reportScam = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId?: string; device_id?: string; scamType?: string; scam_type?: string; items: ({ kind?: string; type?: string; value: string })[] }) => {
    const deviceId = String(input.device_id ?? input.deviceId ?? "").slice(0, 100);
    const scamType = String(input.scam_type ?? input.scamType ?? "").slice(0, 200);
    const items = (Array.isArray(input.items) ? input.items : [])
      .filter((i) => i && typeof i.value === "string" && i.value.trim())
      .slice(0, 10)
      .map((i) => ({ kind: String(i.kind ?? i.type ?? ""), value: i.value.trim().slice(0, 200) }));
    return { deviceId, scamType, items };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; code?: string; saved: number }> => {
    if (data.deviceId.length < 16) return { ok: false, code: "bad_input", saved: 0 };
    try {
      const r = await saveReport(await hashDevice(data.deviceId), data.scamType, data.items);
      return r.ok ? { ok: true, saved: r.saved } : { ok: false, code: r.code ?? "error", saved: 0 };
    } catch (e) {
      console.error("reportScam failed", e);
      return { ok: false, code: "error", saved: 0 };
    }
  });

export const checkValue = createServerFn({ method: "POST" })
  .inputValidator((input: { value: string }) => ({ value: String(input.value ?? "").slice(0, 300) }))
  .handler(async ({ data }): Promise<{ ok: true; item: Identifier; reports: number } | { ok: false }> => {
    const item = parseSingle(data.value);
    if (!item) return { ok: false };
    const m = await lookupReports([item]);
    return { ok: true, item, reports: m[0]?.reports ?? 0 };
  });
