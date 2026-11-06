import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { ContactList } from "@/components/haven/ContactList";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Who can help: Haven" },
      {
        name: "description",
        content: "Helplines and referral centres for child protection in Nigeria.",
      },
    ],
  }),
  component: Contacts,
});

function Contacts() {
  const pcm = useLang().lang === "pcm";
  return (
    <HelpPage title={pcm ? "Who fit help" : "Who can help"}>
      <p>
        {pcm
          ? "Choose where you dey. We dey confirm each contact, so check di label before you depend on am."
          : "Choose where you are. We are confirming each contact, so check the label before you rely on one."}
      </p>
      <ContactList
        topics={["emergency", "child", "sexual_violence", "self_harm", "trafficking", "online"]}
      />
    </HelpPage>
  );
}
