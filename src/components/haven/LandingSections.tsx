import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/lang";

const FACTS = [
  {
    en: "52 sexual assault referral centres now serve 25 states and the FCT, but stigma, underreporting and cost still keep many survivors away.",
    pcm: "52 sexual assault referral centres dey serve 25 states and FCT, but shame, fear to report and money still dey stop plenty survivors.",
    source: "UNICEF-supported study, reported by The Gazette",
    url: "https://gazettengr.com/unicef-study-warns-of-rising-online-sexual-abuse-risks-for-nigerian-children/",
  },
  {
    en: "84% of the 345 cases at one Abuja centre from 2020 to 2024 involved children under 18.",
    pcm: "84% of di 345 cases for one Abuja centre from 2020 to 2024 na pikin wey never reach 18.",
    source: "Awyetu SARC figures, Children Information Bank",
    url: "https://childreninfobank.com/?p=37339",
  },
  {
    en: "93% of 11 to 16-year-olds in a Nigerian Communications Commission study went online by mobile phone, so risks follow children home.",
    pcm: "93% of pikin wey be 11 to 16 for one NCC study dey enter internet with phone, so danger fit follow dem reach house.",
    source: "NCC study, reported by Leadership",
    url: "https://leadership.ng/protecting-nigerian-children-from-cyber-risks-pandemic",
  },
];

export function LandingSections() {
  const t = useT();
  const steps = [
    [
      t("Say what you noticed", "Talk wetin you notice"),
      t(
        "Write it in your own words, or choose the closest option.",
        "Write am for your own way, or choose di one wey near am.",
      ),
    ],
    [
      t("Answer a few questions", "Answer small questions"),
      t(
        "Scripted questions check for danger and show how urgent it is.",
        "Di questions go check for danger and show how urgent e be.",
      ),
    ],
    [
      t("Take the next step", "Take di next step"),
      t(
        "See what to do, what to say, what to avoid and who can help.",
        "See wetin to do, wetin to talk, wetin to avoid and who fit help.",
      ),
    ],
  ];
  const people = [
    [
      t("Mothers and caregivers", "Mothers and caregivers"),
      t(
        "When something at home or nearby feels wrong.",
        "When something for house or nearby no feel right.",
      ),
    ],
    [
      t("Teachers and youth leaders", "Teachers and youth leaders"),
      t(
        "When a child changes or tells you something hard.",
        "When pikin change or tell you hard tori.",
      ),
    ],
    [
      t("Community health workers", "Community health workers"),
      t(
        "When you need a clear next step and a referral.",
        "When you need clear next step and referral.",
      ),
    ],
  ];
  const safety = [
    [
      t("AI never writes the advice", "AI no dey write di advice"),
      t(
        "It only chooses from guidance written and checked by people.",
        "E only dey choose from guidance wey people write and check.",
      ),
    ],
    [
      t("It works when AI does not", "E dey work when AI no work"),
      t(
        "Scripted questions keep the route to help open.",
        "Di questions dey keep di road to help open.",
      ),
    ],
    [
      t("Emergencies come first", "Emergency dey first"),
      t(
        "Danger signs skip the questions and show urgent help.",
        "Danger signs dey skip questions and show urgent help.",
      ),
    ],
    [
      t("No pictures, ever", "No picture at all"),
      t("Haven has no way to upload an image.", "Haven no get way to upload picture."),
    ],
    [
      t("Nothing kept", "We no dey keep am"),
      t(
        "Concerns are not saved, and are never linked to an account.",
        "We no dey save wetin you write, and e no dey join any account.",
      ),
    ],
    [
      t("Open source", "Open source"),
      t(
        "The code is MIT licensed, so others can inspect and adapt it.",
        "Di code get MIT licence, so others fit check and adapt am.",
      ),
    ],
  ];

  return (
    <>
      <section className="bg-card py-12 md:py-16">
        <div className="container-app grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <h2 className="text-3xl font-extrabold leading-tight text-primary md:text-4xl">
            {t(
              "The first person to notice is often a mother, a teacher or a neighbour.",
              "Di first person wey go notice fit be mother, teacher or neighbour.",
            )}
          </h2>
          <div>
            <p className="text-lg leading-relaxed">
              {t(
                "Help exists, but it can be hard to know how to respond, who to call, and what not to do. Haven gives that adult a calm, private first step.",
                "Help dey, but e fit hard to know how to respond, who to call and wetin not to do. Haven dey give dat adult one calm, private first step.",
              )}
            </p>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {FACTS.map((fact) => (
                <li key={fact.url} className="py-4">
                  <p className="text-lg leading-snug">{t(fact.en, fact.pcm)}</p>
                  <a
                    href={fact.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-muted-foreground underline underline-offset-2"
                  >
                    {fact.source}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 py-12 md:py-16">
        <div className="container-app">
          <h2 className="text-3xl font-extrabold text-primary md:text-4xl">
            {t("From worry to next step", "From worry reach next step")}
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map(([title, body], i) => (
              <li key={title} className="border-t-4 border-primary pt-4">
                <p className="text-5xl font-extrabold text-primary">{i + 1}</p>
                <h3 className="mt-3 text-xl font-extrabold">{title}</h3>
                <p className="mt-1 text-lg leading-snug text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-prose text-lg leading-relaxed">
            {t(
              "A child does not need a phone or internet access for Haven to help. It supports the adults already around them.",
              "Pikin no need phone or internet for Haven to help. E dey support di adults wey dey around dem.",
            )}
          </p>
        </div>
      </section>

      <section className="bg-card py-12 md:py-16">
        <div className="container-app">
          <h2 className="text-3xl font-extrabold text-primary md:text-4xl">
            {t("Built for the adults around a child", "We build am for adults around pikin")}
          </h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {people.map(([who, when]) => (
              <div key={who} className="grid gap-1 py-4 md:grid-cols-[1fr_1.5fr] md:gap-8">
                <dt className="text-xl font-extrabold text-primary">{who}</dt>
                <dd className="text-lg leading-snug">{when}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="safety"
        className="on-indigo scroll-mt-28 bg-primary py-12 text-primary-foreground md:py-16"
      >
        <div className="container-app">
          <h2 className="max-w-3xl text-3xl font-extrabold leading-tight md:text-4xl">
            {t("Safety decides how Haven is built.", "Safety dey decide how we build Haven.")}
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {safety.map(([title, body]) => (
              <div key={title} className="border-l-4 border-accent pl-4">
                <dt className="text-xl font-extrabold">{title}</dt>
                <dd className="mt-1 text-lg leading-snug">{body}</dd>
              </div>
            ))}
          </dl>
          <Link
            to="/safety"
            className="tap mt-8 inline-flex items-center rounded-md border-2 border-white px-5 text-lg font-bold"
          >
            {t("Read our safety approach", "Read how we dey handle safety")}
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-app grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-primary md:text-4xl">
              {t(
                "Help us make Haven ready for real use.",
                "Help us make Haven ready for real use.",
              )}
            </h2>
            <p className="mt-4 max-w-prose text-lg leading-relaxed">
              {t(
                "We are looking for child protection professionals, referral centres, schools and health programmes to review our guidance and shape a pilot.",
                "We dey find child protection professionals, referral centres, schools and health programmes to review di guidance and shape pilot.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/organisations"
                className="tap inline-flex items-center rounded-md bg-primary px-5 text-lg font-bold text-primary-foreground"
              >
                {t("Work with us", "Work with us")}
              </Link>
              <Link
                to="/signup"
                className="tap inline-flex items-center rounded-md border-2 border-primary px-5 text-lg font-bold text-primary"
              >
                {t("Create a frontline account", "Open frontline account")}
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-primary">
              {t("Where we are now", "Where we dey now")}
            </h3>
            <ol className="mt-3 space-y-3 text-lg leading-snug">
              <li>
                {t(
                  "Working test version in English and Pidgin",
                  "Test version dey work for English and Pidgin",
                )}
              </li>
              <li>
                {t(
                  "Next: professional review of all guidance",
                  "Next: professionals go review all di guidance",
                )}
              </li>
              <li>
                {t("Then: a small, supervised pilot", "Then: small pilot wey people go supervise")}
              </li>
              <li>{t("Later: Yoruba, Hausa and voice", "Later: Yoruba, Hausa and voice")}</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
