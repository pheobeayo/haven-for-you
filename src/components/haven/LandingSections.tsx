import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/lang";

const CONTACT_EMAIL = "pheobeayo@gmail.com";

export function LandingSections() {
  const t = useT();
  const next = [
    t("Professional review of all guidance", "Professionals go review all di guidance"),
    t("A small, supervised pilot", "Small pilot wey people go supervise"),
    t("Yoruba, Hausa and voice", "Yoruba, Hausa and voice"),
  ];

  return (
    <section
      id="organisations"
      aria-labelledby="organisations-heading"
      className="font-hv-body scroll-mt-24 bg-(--hv-mist) px-5 py-16 text-(--hv-forest)"
    >
      <div className="mx-auto flex w-[90%] flex-wrap items-center gap-x-16 gap-y-10 rounded-[36px] bg-(--hv-sage) p-8 sm:p-12 lg:p-16">
        <div className="min-w-0 flex-[1_1_420px]">
          <h2
            id="organisations-heading"
            className="hv-display text-[30px] font-medium leading-[1.1] tracking-[-0.015em] sm:text-[44px]"
          >
            {t("Help shape Haven.", "Help us shape Haven.")}
          </h2>
          <p className="mt-4 max-w-[480px] text-lg leading-relaxed text-[#3f5550]">
            {t(
              "We need child protection professionals, referral centres, schools and health programmes to review the guidance and join a small pilot.",
              "We dey find child protection professionals, referral centres, schools and health programmes to review di guidance and join small pilot.",
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Working with Haven")}`}
              className="inline-flex min-h-[52px] items-center rounded-full bg-(--hv-forest) px-6 font-semibold text-white transition-transform hover:-translate-y-px"
            >
              {t("Work with us", "Work with us")}
            </a>
            <Link
              to="/signup"
              search={{ type: "organisation" }}
              className="inline-flex min-h-[52px] items-center rounded-full border-2 border-(--hv-forest) px-6 font-semibold text-(--hv-forest) transition-transform hover:-translate-y-px"
            >
              {t("Create an organisation account", "Open organisation account")}
            </Link>
          </div>
        </div>

        <ol
          aria-label={t("Where we are now", "Where we dey now")}
          className="min-w-0 flex-[1_1_340px] space-y-4.5"
        >
          <li className="flex items-start gap-4">
            <span
              aria-hidden
              className="mt-1.25 h-3.5 w-3.5 shrink-0 rounded-full bg-(--hv-eucalyptus) shadow-[0_0_0_5px_rgba(62,122,106,0.2)]"
            />
            <span>
              <strong className="font-semibold">{t("Now:", "Now:")}</strong>{" "}
              {t(
                "test version in English and Pidgin",
                "test version dey work for English and Pidgin",
              )}
            </span>
          </li>
          {next.map((step) => (
            <li key={step} className="flex items-start gap-4 text-[#3f5550]">
              <span
                aria-hidden
                className="mt-[5px] h-3.5 w-3.5 shrink-0 rounded-full border-2 border-(--hv-eucalyptus)"
              />
              {step}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
