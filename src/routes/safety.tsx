import { createFileRoute, Link } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useT } from "@/lib/lang";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Our safety approach: Haven" },
      {
        name: "description",
        content: "How Haven handles AI, emergencies, privacy and safeguarding.",
      },
    ],
  }),
  component: Safety,
});

function Safety() {
  const t = useT();
  const heading = "text-2xl font-extrabold text-primary";
  return (
    <HelpPage art="weave" title={t("Our safety approach", "How we dey handle safety")}>
      <p>
        {t(
          "Haven deals with sensitive situations, so safety rules shape every part of it. Haven is still a test version and its guidance is pending professional review.",
          "Haven dey touch sensitive matter, so safety rules dey shape everything. Haven still be test version, and professionals never review di guidance.",
        )}
      </p>
      <section>
        <h2 className={heading}>{t("How AI is used", "How we dey use AI")}</h2>
        <p className="mt-2">
          {t(
            "AI reads what an adult writes and picks a category or an emergency label. It can only pick from fixed labels, and anything else it returns is thrown away. It never writes advice.",
            "AI dey read wetin adult write and pick category or emergency label. E fit only pick from fixed labels, and we dey throw away anything else. E no dey write advice.",
          )}
        </p>
        <p className="mt-2">
          {t(
            "If AI is unavailable or unsure, Haven's rules and scripted questions take over.",
            "If AI no dey or e no sure, Haven rules and questions go take over.",
          )}
        </p>
      </section>
      <section>
        <h2 className={heading}>{t("Emergencies", "Emergency")}</h2>
        <p className="mt-2">
          {t(
            "Danger signs skip the questions and show urgent help. AI can raise a concern to an emergency, but it cannot clear one that Haven's rules found.",
            "Danger signs dey skip questions and show urgent help. AI fit raise concern to emergency, but e no fit clear di one wey Haven rules find.",
          )}
        </p>
      </section>
      <section>
        <h2 className={heading}>
          {t("Protecting children and adults", "How we dey protect pikin and adults")}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            {t(
              "Haven is for adults. Children should not create accounts.",
              "Haven na for adults. Pikin no suppose open account.",
            )}
          </li>
          <li>{t("Haven never accepts images.", "Haven no dey accept picture.")}</li>
          <li>
            {t(
              "Concerns are not saved, and are never linked to an account.",
              "We no dey save concerns, and dem no dey join any account.",
            )}
          </li>
        </ul>
      </section>
      <section>
        <h2 className={heading}>{t("Before real use", "Before real use")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li>
            {t(
              "A child protection professional reviews all guidance.",
              "Child protection professional go review all guidance.",
            )}
          </li>
          <li>
            {t(
              "We confirm every referral contact by phone.",
              "We go confirm every referral contact by phone.",
            )}
          </li>
          <li>
            {t(
              "We run a small, supervised pilot.",
              "We go run small pilot wey people go supervise.",
            )}
          </li>
        </ol>
      </section>
      <p className="border-l-4 border-urgent pl-4 font-bold">
        {t(
          "If a child is in danger now, call 112. Report a problem with Haven through our ",
          "If pikin dey for danger now, call 112. Report problem with Haven through our ",
        )}
        <Link to="/contact" className="underline underline-offset-2">
          {t("contact page", "contact page")}
        </Link>
        .
      </p>
    </HelpPage>
  );
}
