import { createServerFn } from "@tanstack/react-start";
import { routeConcernText } from "./route-concern.server";
import { MAX_CONCERN_LENGTH, type RoutedConcern } from "./triage";

/**
 * Takes text only. Nothing here reads files or images, and nothing is written
 * to a database or a log.
 */
export const routeConcern = createServerFn({ method: "POST" })
  .validator((input: { text?: unknown }) => {
    const text = typeof input?.text === "string" ? input.text.slice(0, MAX_CONCERN_LENGTH) : "";
    return { text };
  })
  .handler(async ({ data }): Promise<RoutedConcern> => {
    return routeConcernText(data.text, process.env["LOVABLE_API_KEY"]);
  });
