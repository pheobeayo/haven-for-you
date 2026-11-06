import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { HelpPage } from "@/components/HelpPage";
import { useT } from "@/lib/lang";
import { CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us: Haven" },
      {
        name: "description",
        content: "Contact the Haven team about partnerships, feedback or a problem with the app.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const t = useT();
  return (
    <HelpPage title={t("Contact us", "Contact us")}>
      <p className="border-l-4 border-urgent pl-4 font-bold">
        {t(
          "This inbox is not monitored for emergencies. If a child is in danger, call 112. Please do not email details of a real case.",
          "We no dey watch dis inbox for emergency. If pikin dey for danger, call 112. Abeg no email details of real case.",
        )}
      </p>
      <p>
        {t(
          "Write to us about partnerships, feedback, or a problem with Haven.",
          "Write us about partnership, feedback or problem with Haven.",
        )}
      </p>
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=Haven`}
        className="tap inline-flex items-center gap-2 rounded-md bg-primary px-5 font-bold text-primary-foreground"
      >
        <Mail className="h-5 w-5" aria-hidden />
        {CONTACT_EMAIL}
      </a>
      <p>
        {t("Need help now? See ", "You need help now? See ")}
        <Link to="/contacts" className="font-bold text-primary underline underline-offset-4">
          {t("who can help", "who fit help")}
        </Link>
        .
      </p>
    </HelpPage>
  );
}
