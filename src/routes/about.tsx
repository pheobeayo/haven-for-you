import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/HelpPage";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Haven" },
      {
        name: "description",
        content:
          "Haven helps caregivers, teachers and community workers in Nigeria respond safely when they are worried about a child.",
      },
    ],
  }),
  component: About,
});

function About() {
  const pcm = useLang().lang === "pcm";
  const heading = "text-xl font-bold text-primary";
  return (
    <HelpPage title="About Haven">
      <section>
        <h2 className={heading}>{pcm ? "Who Haven dey for" : "Who Haven is for"}</h2>
        <p className="mt-2">
          {pcm
            ? "Mothers, caregivers, teachers, youth leaders and community health workers wey dey worry about pikin, especially girls. Pikin no need phone or internet for dis one to help am."
            : "Mothers, caregivers, teachers, youth leaders and community health workers who are worried about a child, especially a girl. A child does not need a phone or internet access for Haven to help."}
        </p>
      </section>
      <section>
        <h2 className={heading}>{pcm ? "How e dey work" : "How it works"}</h2>
        <p className="mt-2">
          {pcm
            ? "You talk wetin you notice or choose di one wey near am. Haven ask small questions, show how urgent e be, then show approved guidance and who fit help."
            : "You say what you noticed or choose the closest option. Haven asks a few questions, shows how urgent it is, then shows guidance and people who can help."}
        </p>
      </section>
      <section>
        <h2 className={heading}>{pcm ? "Wetin AI dey do" : "What the AI does"}</h2>
        <p className="mt-2">
          {pcm
            ? "AI only dey choose which guidance fit wetin you write. E no dey write advice. If AI no work, Haven still dey work with questions."
            : "AI only chooses which guidance fits what you wrote. It never writes advice. If the AI is unavailable, Haven still works through its questions."}
        </p>
      </section>
      <p className="border-l-4 border-soon pl-4">
        {pcm
          ? "Haven na test version. E no be diagnosis or legal advice. Professionals never review di guidance, so no use am for real case yet."
          : "Haven is a test version. It is not a diagnosis or legal advice. Its guidance is pending professional review, so do not use it for a real case yet."}
      </p>
    </HelpPage>
  );
}
