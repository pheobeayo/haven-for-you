import { createFileRoute, redirect } from "@tanstack/react-router";
import { PRIVACY_NOTICE_URL } from "@/lib/site";

/** The privacy notice is a PDF, so old links to this page go straight to it. */
export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    throw redirect({ href: PRIVACY_NOTICE_URL });
  },
});
