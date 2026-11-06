import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches every page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of [
      "/",
      "/contacts",
      "/about",
      "/privacy",
      "/safety",
      "/organisations",
      "/contact",
      "/terms",
      "/signup",
      "/signin",
      "/forgot-password",
      "/reset-password",
      "/account",
    ]) {
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});
