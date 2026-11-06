import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useT } from "@/lib/lang";
import { COMPANY_NAME } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use: Haven" },
      { name: "description", content: "The terms for using Haven." },
    ],
  }),
  component: Terms,
});

function Terms() {
  const t = useT();
  const items = [
    [
      t("What Haven is", "Wetin Haven be"),
      t(
        `Haven is a test version run by ${COMPANY_NAME}. It gives general information to help adults decide what to do next.`,
        `Haven na test version wey ${COMPANY_NAME} dey run. E dey give general information to help adults decide wetin to do next.`,
      ),
    ],
    [
      t("What Haven is not", "Wetin Haven no be"),
      t(
        "It is not an emergency service, and it is not medical, legal or professional advice. If a child is in danger, call 112.",
        "E no be emergency service, and e no be medical, legal or professional advice. If pikin dey for danger, call 112.",
      ),
    ],
    [
      t("Test version", "Test version"),
      t(
        "Guidance is pending professional review and contacts may not be confirmed. Do not rely on Haven for a real case.",
        "Professionals never review di guidance and we fit never confirm contacts. No depend on Haven for real case.",
      ),
    ],
    [
      t("Using Haven properly", "Use Haven well"),
      t(
        "Do not enter anyone's name, address or phone number, and do not try to misuse or disrupt the service.",
        "No enter anybody name, address or phone number, and no try misuse or disturb di service.",
      ),
    ],
    [
      t("Accounts", "Accounts"),
      t(
        "Accounts are optional and for people aged 18 or over. Keep your password private. You can delete your account at any time.",
        "Account na optional and for people wey don reach 18. Keep your password private. You fit delete your account anytime.",
      ),
    ],
    [
      t("Changes", "Changes"),
      t(
        "We may update Haven and these terms as the service develops.",
        "We fit update Haven and dis terms as di service dey grow.",
      ),
    ],
  ];
  return (
    <HelpPage title={t("Terms of use", "Terms of use")}>
      {items.map(([title, body]) => (
        <section key={title}>
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <p className="mt-2">{body}</p>
        </section>
      ))}
    </HelpPage>
  );
}
