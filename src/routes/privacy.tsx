import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Your privacy: Haven" },
      {
        name: "description",
        content: "Haven takes no pictures and does not save what you write. Accounts are optional.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const pcm = useLang().lang === "pcm";
  const heading = "text-xl font-bold text-primary";
  return (
    <HelpPage art="weave" title={pcm ? "Your privacy" : "Your privacy"}>
      <section>
        <h2 className={heading}>
          {pcm ? "We no dey save wetin you write" : "We do not save what you write"}
        </h2>
        <p className="mt-2">
          {pcm
            ? "Haven no get database for wetin you write. When you refresh or press Start again, e go clear from di page."
            : "Haven has no database of what you write. Refreshing the page or pressing Start again clears it from the page."}
        </p>
      </section>
      <section>
        <h2 className={heading}>{pcm ? "Where your words dey go" : "Where your words go"}</h2>
        <p className="mt-2">
          {pcm
            ? "If you write wetin you notice, Haven go first remove phone number and email, then send di rest to AI service make e choose guidance. If you choose from di list, your words no go anywhere. So no write anybody name."
            : "If you write what you noticed, Haven removes phone numbers and email addresses, then sends the rest to an AI service to choose the guidance. If you choose from the list, nothing you write is sent. Please do not write anyone's name."}
        </p>
      </section>
      <section>
        <h2 className={heading}>
          {pcm ? "We no dey collect picture" : "We never accept pictures"}
        </h2>
        <p className="mt-2">
          {pcm
            ? "Haven no dey accept picture at all. No send sexual picture of pikin to anybody, even as proof."
            : "Haven does not accept pictures of any kind. Never send a sexual picture of a child to anyone, even as proof."}
        </p>
      </section>
      <section>
        <h2 className={heading}>
          {pcm ? "If person fit check your phone" : "If someone may check your phone"}
        </h2>
        <p className="mt-2">
          {pcm
            ? "Press Comot now for di bottom of di page to leave Haven sharp sharp. Your browser fit still show say you visit Haven, so clear your history if e safe to do am."
            : "Press Leave now at the bottom of the page to go to another site straight away. Your browser may still show that you visited Haven, so clear your history if it is safe to do so."}
        </p>
      </section>
    </HelpPage>
  );
}
