import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useT } from "@/lib/lang";

export const Route = createFileRoute("/organisations")({
  head: () => ({
    meta: [
      { title: "For organisations: Haven" },
      {
        name: "description",
        content:
          "How schools, health programmes, referral centres and child protection professionals can work with Haven.",
      },
    ],
  }),
  component: Organisations,
});

function Organisations() {
  const t = useT();
  const heading = "text-2xl font-extrabold text-primary";
  return (
    <HelpPage art="routes" title={t("Work with Haven", "Work with Haven")}>
      <p>
        {t(
          "Haven is a working test version. We are looking for partners to help us make it safe for real use.",
          "Haven na test version wey dey work. We dey find partners wey go help make am safe for real use.",
        )}
      </p>
      <section>
        <h2 className={heading}>{t("Where you can help", "Where you fit help")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            {t(
              "Child protection professionals: review our guidance and emergency rules.",
              "Child protection professionals: review our guidance and emergency rules.",
            )}
          </li>
          <li>
            {t(
              "Referral centres and helplines: confirm your details and how people should reach you.",
              "Referral centres and helplines: confirm your details and how people go reach you.",
            )}
          </li>
          <li>
            {t(
              "Schools and health programmes: help shape a small, supervised pilot.",
              "Schools and health programmes: help shape small pilot wey people go supervise.",
            )}
          </li>
          <li>
            {t(
              "Speakers of Pidgin, Yoruba and Hausa: help the guidance sound natural.",
              "People wey sabi Pidgin, Yoruba and Hausa: help make di guidance sound natural.",
            )}
          </li>
        </ul>
      </section>
      <section>
        <h2 className={heading}>{t("Accounts", "Accounts")}</h2>
        <p className="mt-2">
          {t(
            "A free account saves your role and state, and shows contacts for your area. Anyone can use Haven without one, and no concern is ever saved to an account.",
            "Free account dey save your role and state, and show contacts for your area. Anybody fit use Haven without am, and no concern dey save for account.",
          )}
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/contact"
          className="tap inline-flex items-center rounded-md bg-primary px-5 font-bold text-primary-foreground"
        >
          {t("Contact us", "Contact us")}
        </Link>
        <Link
          to="/signup"
          search={{ type: "organisation" }}
          className="tap inline-flex items-center rounded-md border-2 border-primary px-5 font-bold text-primary"
        >
          {t("Create an organisation account", "Open organisation account")}
        </Link>
      </div>
    </HelpPage>
  );
}
