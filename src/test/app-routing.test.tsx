import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it("places every app page behind the authenticated parent", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ["/", "/history", "/trends", "/about", "/privacy", "/been-scammed"]) {
      expect(router.matchRoutes(path).some((match) => match.routeId === "/_authenticated")).toBe(true);
    }
    expect(router.matchRoutes("/auth").some((match) => match.routeId === "/_authenticated")).toBe(false);
  });
});
