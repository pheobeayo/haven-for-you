import { createServerFn } from "@tanstack/react-start";
import { parseSingle, type Identifier, type ReportType } from "./identifiers";
import { hashDevice, lookupReports, saveReport } from "./reports.server";

const TYPES: ReportType[] = ["phone_number", "bank_account", "link", "wallet", "message_pattern"];

export const reportScam = createServerFn({ method: "POST" })
  .inputValidator((input: { deviceId: string; scamType: string; items: Identifier[] }) => {
    const deviceId = String(input.deviceId ?? "").slice(0, 100);
    const scamType = String(input.scamType ?? "").slice(0, 200);
    const items = (Array.isArray(input.items) ? input.items : [])
      .filter((i) => TYPES.includes(i?.type) && typeof i.value === "string" && i.value.trim())
      .slice(0, 10)
      .map((i) => ({ type: i.type, value: i.value.trim().slice(0, 200) }));
    return { deviceId, scamType, items };
  })
  .handler(async ({ data }): Promise<{ ok: boolean; code?: string }> => {
    if (data.deviceId.length < 16) return { ok: false, code: "bad_input" };
    const items = data.items.length ? data.items : [{ type: "message_pattern" as const, value: (data.scamType || "unknown").toLowerCase() }];
    try {
      const r = await saveReport(await hashDevice(data.deviceId), data.scamType, items);
      return r.ok ? { ok: true } : { ok: false, code: r.code };
    } catch (e) {
      console.error("reportScam failed", e);
      return { ok: false, code: "error" };
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
