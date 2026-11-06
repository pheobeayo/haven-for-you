import type { ContactTopic } from "./contacts";

/**
 * Haven's response library. This is the only safety advice the app ever shows.
 * AI may choose a category. It can never write or change the words in this file.
 *
 * Every block is seeded from published guidance and is pending professional
 * review. See docs/content-review.md before changing or approving anything here.
 */
export type Localised = { en: string; pcm: string };

export type CategoryId = "sexual" | "physical" | "grooming" | "online" | "behaviour" | "unsure";
export type EmergencyKind = "danger" | "assault" | "self_harm";
export type Urgency = "today" | "this_week";
export type Answer = "yes" | "no" | "unsure";

export type Question = {
  id: string;
  text: Localised;
  /** A "yes" jumps straight to this emergency response. */
  emergency?: EmergencyKind;
  /** A "yes" or "not sure" raises the urgency to today. */
  raisesToToday?: boolean;
};

export type Guidance = {
  title: Localised;
  doNow: Localised[];
  say: Localised[];
  avoid: Localised[];
  contactTopics: ContactTopic[];
  sources: SourceId[];
};

export type Category = Guidance & {
  id: CategoryId;
  label: Localised;
  example: Localised;
  baseUrgency: Urgency;
  questions: Question[];
};

export type SourceId = "caring" | "who" | "who_suicide" | "iwf" | "ncmec";

export const SOURCES: Record<SourceId, { name: string; url: string }> = {
  caring: {
    name: "Caring for Child Survivors of Sexual Abuse (IRC and UNICEF)",
    url: "https://themimu.info/sites/themimu.info/files/cp_aor/Caring_for_Child_Survivors_Guidelines_ENG.pdf",
  },
  who: {
    name: "Responding to children and adolescents who have been sexually abused (WHO)",
    url: "https://www.who.int/news/item/19-10-2017-responding-to-children-and-adolescents-who-have-been-sexually-abused",
  },
  who_suicide: {
    name: "What you should know if you are worried about someone (WHO)",
    url: "https://ssc.manipal.edu/docs/WHO%204%20-suicide.pdf",
  },
  iwf: {
    name: "Advice for parents and carers on sextortion (Internet Watch Foundation)",
    url: "https://iwf.org.uk/resources/sextortion/parents-and-carers/",
  },
  ncmec: {
    name: "Sextortion: what parents should know (NCMEC)",
    url: "https://www.missingkids.org/blog/2023/sextortion-parents-should-know",
  },
};

const IN_DANGER: Question = {
  id: "danger",
  text: {
    en: "Could the child be in danger right now?",
    pcm: "Di pikin fit dey for danger right now?",
  },
  emergency: "danger",
};

const SAY_TO_CHILD: Localised[] = [
  { en: "“I believe you.”", pcm: "“I believe you.”" },
  { en: "“I am glad you told me.”", pcm: "“I happy say you tell me.”" },
  { en: "“This is not your fault.”", pcm: "“No be your fault.”" },
  {
    en: "“You are very brave to talk to me, and we will try to help you.”",
    pcm: "“You get liver as you talk to me, and we go try help you.”",
  },
];

const AVOID_WITH_CHILD: Localised[] = [
  {
    en: "Do not show shock, anger or disbelief. The child may stop talking.",
    pcm: "No show shock, vex or say you no believe. Di pikin fit stop to talk.",
  },
  {
    en: "Do not ask “why” questions or suggest what happened. Let the child use their own words.",
    pcm: "No ask “why” or put words for di pikin mouth. Make e talk am for im own way.",
  },
  {
    en: "Do not make the child repeat the story to many people.",
    pcm: "No make di pikin repeat di story give plenty people.",
  },
  {
    en: "Do not promise to keep it secret. Say you will only tell people who can help.",
    pcm: "No promise say you go hide am. Tell di pikin say na only people wey fit help you go tell.",
  },
  {
    en: "Do not confront the person you are worried about. It can put the child in more danger.",
    pcm: "No face di person wey you dey suspect. E fit put di pikin for more danger.",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "sexual",
    label: { en: "Sexual harm", pcm: "Sexual harm" },
    example: {
      en: "A child told me, or I think someone touched or hurt them sexually.",
      pcm: "Pikin tell me, or I think say person touch or hurt am for sexual way.",
    },
    title: {
      en: "If you are worried about sexual harm",
      pcm: "If you dey worry about sexual harm",
    },
    baseUrgency: "today",
    questions: [
      IN_DANGER,
      {
        id: "recent",
        text: {
          en: "Could it have happened in the last 5 days?",
          pcm: "E fit don happen inside di last 5 days?",
        },
        emergency: "assault",
      },
      {
        id: "contact",
        text: {
          en: "Can the person you are worried about still reach the child?",
          pcm: "Di person wey you dey suspect still fit reach di pikin?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Find a quiet, private place and listen calmly.",
        pcm: "Find quiet place wey private, and listen with calm mind.",
      },
      {
        en: "Keep the child away from the person you are worried about.",
        pcm: "Keep di pikin far from di person wey you dey suspect.",
      },
      {
        en: "Call a child helpline or sexual assault referral centre today for advice on what to do next.",
        pcm: "Call child helpline or sexual assault referral centre today make dem advise you wetin to do next.",
      },
      {
        en: "Take the child for a health check, even if the harm was some time ago.",
        pcm: "Carry di pikin go for health check, even if di thing don tey small.",
      },
    ],
    say: SAY_TO_CHILD,
    avoid: AVOID_WITH_CHILD,
    contactTopics: ["child", "sexual_violence"],
    sources: ["caring", "who"],
  },
  {
    id: "physical",
    label: { en: "Physical harm", pcm: "Physical harm" },
    example: {
      en: "I have seen injuries or marks, or a child is afraid of being beaten.",
      pcm: "I see wound or mark, or pikin dey fear say dem go beat am.",
    },
    title: {
      en: "If you are worried about physical harm",
      pcm: "If you dey worry about physical harm",
    },
    baseUrgency: "today",
    questions: [
      IN_DANGER,
      {
        id: "injury",
        text: {
          en: "Is the child badly hurt, bleeding, or in serious pain?",
          pcm: "Di pikin wound well, e dey bleed, or e dey feel serious pain?",
        },
        emergency: "danger",
      },
      {
        id: "lives-with",
        text: {
          en: "Does the child live with or see this person often?",
          pcm: "Di pikin dey live with dis person or e dey see am well well?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Check that the child is safe. Get medical care for any injury.",
        pcm: "Make sure say di pikin dey safe. Find medical care for any wound.",
      },
      {
        en: "Talk with the child alone in a quiet place, away from the person you are worried about.",
        pcm: "Talk with di pikin alone for quiet place, far from di person wey you dey suspect.",
      },
      {
        en: "Write down what you saw, when you saw it, and what the child said in their own words.",
        pcm: "Write wetin you see, when you see am, and wetin di pikin talk for im own words.",
      },
      {
        en: "Call a child helpline today and ask how to keep the child safe.",
        pcm: "Call child helpline today and ask how to keep di pikin safe.",
      },
    ],
    say: SAY_TO_CHILD,
    avoid: AVOID_WITH_CHILD,
    contactTopics: ["child"],
    sources: ["caring"],
  },
  {
    id: "grooming",
    label: { en: "Someone too close to a child", pcm: "Person wey too close to pikin" },
    example: {
      en: "An adult or older person gives gifts, keeps secrets, or wants time alone with a child.",
      pcm: "Adult or person wey senior dey give gift, keep secret, or want stay alone with pikin.",
    },
    title: {
      en: "If someone is getting too close to a child",
      pcm: "If person dey too close to pikin",
    },
    baseUrgency: "this_week",
    questions: [
      IN_DANGER,
      {
        id: "alone",
        text: {
          en: "Is this person planning to meet the child alone or take them somewhere?",
          pcm: "Dis person dey plan to meet di pikin alone or carry am go somewhere?",
        },
        raisesToToday: true,
      },
      {
        id: "secret",
        text: {
          en: "Has the child been told to keep secrets from you or other adults?",
          pcm: "Dem don tell di pikin make e hide tins from you or other adults?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Make sure the child is not left alone with this person.",
        pcm: "Make sure say di pikin no dey stay alone with dis person.",
      },
      {
        en: "Ask open questions, such as “Tell me about the time you spend with them.”",
        pcm: "Ask open question, like “Tell me about di time wey una dey spend together.”",
      },
      {
        en: "Write down what you have noticed, with dates.",
        pcm: "Write wetin you don notice, with di dates.",
      },
      {
        en: "Call a child helpline for advice on what to do next.",
        pcm: "Call child helpline make dem advise you wetin to do next.",
      },
    ],
    say: [
      {
        en: "“You are not in trouble. I just want to make sure you are safe.”",
        pcm: "“You no do anything wrong. I just wan make sure say you dey safe.”",
      },
      ...SAY_TO_CHILD.slice(1, 3),
    ],
    avoid: AVOID_WITH_CHILD,
    contactTopics: ["child"],
    sources: ["caring"],
  },
  {
    id: "online",
    label: { en: "Something online", pcm: "Something for online" },
    example: {
      en: "A stranger is messaging a child, asking for pictures, or threatening to share them.",
      pcm: "Stranger dey message pikin, dey ask for picture, or dey threaten to share am.",
    },
    title: { en: "If something is happening online", pcm: "If something dey happen for online" },
    baseUrgency: "this_week",
    questions: [
      IN_DANGER,
      {
        id: "threat",
        text: {
          en: "Is someone threatening to share pictures or asking for money?",
          pcm: "Person dey threaten to share picture or dey ask for money?",
        },
        raisesToToday: true,
      },
      {
        id: "meet",
        text: {
          en: "Has this person asked to meet the child?",
          pcm: "Dis person don ask to meet di pikin?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Stay calm. Tell the child they will not be punished and that you will sort this out together.",
        pcm: "Calm down. Tell di pikin say you no go punish am, and say una go solve am together.",
      },
      {
        en: "Stop all contact with the person. Block them, but do not delete the account or messages.",
        pcm: "Stop all contact with di person. Block am, but no delete di account or message.",
      },
      {
        en: "Do not pay. Do not forward, save or share any sexual picture of a child, even as proof.",
        pcm: "No pay. No forward, save or share any sexual picture of pikin, even as proof.",
      },
      {
        en: "Report the account on the app, and call a child helpline for advice on reporting it.",
        pcm: "Report di account for di app, and call child helpline make dem advise you how to report am.",
      },
    ],
    say: [
      { en: "“This is not your fault.”", pcm: "“No be your fault.”" },
      {
        en: "“You are not in trouble. We will work through this together.”",
        pcm: "“You no do anything wrong. We go solve am together.”",
      },
      { en: "“Thank you for telling me.”", pcm: "“Thank you say you tell me.”" },
    ],
    avoid: [
      {
        en: "Do not take away the phone as punishment. Children often hide problems because they fear this.",
        pcm: "No seize di phone as punishment. Pikin dey hide problem because dem dey fear dis one.",
      },
      {
        en: "Do not reply to or bargain with the person making threats.",
        pcm: "No reply or bargain with di person wey dey threaten.",
      },
      {
        en: "Do not blame the child. These people use clever tricks on young people.",
        pcm: "No blame di pikin. Dis people sabi use wayo on young people.",
      },
    ],
    contactTopics: ["online", "child"],
    sources: ["iwf", "ncmec"],
  },
  {
    id: "behaviour",
    label: { en: "A child has changed", pcm: "Pikin don change" },
    example: {
      en: "A child has become withdrawn, frightened, or is not themselves.",
      pcm: "Pikin don dey quiet too much, dey fear, or e no be imself again.",
    },
    title: { en: "If a child has changed", pcm: "If pikin don change" },
    baseUrgency: "this_week",
    questions: [
      IN_DANGER,
      {
        id: "dying",
        text: {
          en: "Has the child talked about dying or hurting themselves?",
          pcm: "Di pikin don talk about to die or to hurt imself?",
        },
        emergency: "self_harm",
      },
      {
        id: "afraid",
        text: {
          en: "Does the child seem afraid of a certain person or place?",
          pcm: "E be like say di pikin dey fear one person or one place?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Find a quiet time to sit with the child, at their eye level.",
        pcm: "Find quiet time to sit with di pikin, for im eye level.",
      },
      {
        en: "Start with easy topics, such as school or friends, then gently ask how they are doing.",
        pcm: "Start with easy tori, like school or friends, then softly ask how e dey.",
      },
      {
        en: "Write down what has changed and when you first noticed it.",
        pcm: "Write wetin don change and when you first notice am.",
      },
      {
        en: "Speak with a child helpline or health worker if the change continues.",
        pcm: "Talk to child helpline or health worker if di change continue.",
      },
    ],
    say: [
      {
        en: "“I have noticed you seem sad. I am here if you want to talk.”",
        pcm: "“I don notice say your mind no dey settle. I dey here if you wan talk.”",
      },
      { en: "“Tell me more about that.”", pcm: "“Tell me more about am.”" },
      { en: "“You can talk to me at any time.”", pcm: "“You fit talk to me anytime.”" },
    ],
    avoid: [
      {
        en: "Do not force the child to talk before they are ready.",
        pcm: "No force di pikin to talk before e ready.",
      },
      ...AVOID_WITH_CHILD.slice(0, 2),
    ],
    contactTopics: ["child"],
    sources: ["caring"],
  },
  {
    id: "unsure",
    label: { en: "I am not sure", pcm: "I no too sure" },
    example: {
      en: "Something feels wrong, but I cannot name it.",
      pcm: "Something no right, but I no fit talk wetin e be.",
    },
    title: { en: "If something feels wrong", pcm: "If something no feel right" },
    baseUrgency: "this_week",
    questions: [
      IN_DANGER,
      {
        id: "afraid",
        text: {
          en: "Does the child seem afraid of a certain person or place?",
          pcm: "E be like say di pikin dey fear one person or one place?",
        },
        raisesToToday: true,
      },
    ],
    doNow: [
      {
        en: "Trust what you noticed. You do not need proof to ask for advice.",
        pcm: "Trust wetin you notice. You no need proof before you ask for advice.",
      },
      {
        en: "Find a quiet time to ask the child how they are doing.",
        pcm: "Find quiet time to ask di pikin how e dey.",
      },
      {
        en: "Write down what you noticed, with dates.",
        pcm: "Write wetin you notice, with di dates.",
      },
      {
        en: "Call a child helpline and describe what worries you.",
        pcm: "Call child helpline and tell dem wetin dey worry you.",
      },
    ],
    say: [
      { en: "“Tell me more about that.”", pcm: "“Tell me more about am.”" },
      { en: "“You can talk to me at any time.”", pcm: "“You fit talk to me anytime.”" },
    ],
    avoid: AVOID_WITH_CHILD,
    contactTopics: ["child"],
    sources: ["caring"],
  },
];

export const EMERGENCIES: Record<EmergencyKind, Guidance> = {
  danger: {
    title: { en: "Get help now", pcm: "Find help now now" },
    doNow: [
      { en: "Call 112 now if you can do so safely.", pcm: "Call 112 now now if e safe for you." },
      {
        en: "Move the child to a safe place, and stay with them if it is safe for you.",
        pcm: "Carry di pikin go safe place, and stay with am if e safe for you.",
      },
      {
        en: "If the child is hurt, go to the nearest hospital.",
        pcm: "If di pikin wound, go di nearest hospital.",
      },
    ],
    say: [
      {
        en: "“You are not in trouble. I am here, and we are getting help.”",
        pcm: "“You no do anything wrong. I dey here, and we dey find help.”",
      },
    ],
    avoid: [
      {
        en: "Do not confront the person alone. Put safety first, for the child and for you.",
        pcm: "No face di person alone. Safety first, for di pikin and for you.",
      },
    ],
    contactTopics: ["emergency", "child"],
    sources: ["caring"],
  },
  assault: {
    title: { en: "Get medical care today", pcm: "Find medical care today" },
    doNow: [
      {
        en: "Take the child to a hospital or sexual assault referral centre today. Do not wait until tomorrow.",
        pcm: "Carry di pikin go hospital or sexual assault referral centre today. No wait till tomorrow.",
      },
      {
        en: "Tell the health worker when it happened. Medicine that helps prevent HIV should be given within 72 hours.",
        pcm: "Tell di health worker when e happen. Medicine wey dey help prevent HIV suppose start inside 72 hours.",
      },
      {
        en: "For a girl, ask about emergency contraception. It can be given up to 120 hours (5 days) afterwards.",
        pcm: "If na girl, ask about emergency contraception. Dem fit give am reach 120 hours (5 days) after.",
      },
      {
        en: "If you can, bring the clothes the child was wearing. Never delay care to do this.",
        pcm: "If you fit, carry di cloth wey di pikin wear. No delay care because of dis one.",
      },
    ],
    say: SAY_TO_CHILD,
    avoid: AVOID_WITH_CHILD,
    contactTopics: ["sexual_violence", "child"],
    sources: ["who", "caring"],
  },
  self_harm: {
    title: { en: "Stay with the child", pcm: "Stay with di pikin" },
    doNow: [
      {
        en: "Do not leave the child alone.",
        pcm: "No leave di pikin alone.",
      },
      {
        en: "Move anything that could be used for self-harm out of reach.",
        pcm: "Move anything wey fit hurt am far from im reach.",
      },
      {
        en: "Call the SURPIN helpline now, or 112 if the child has already hurt themselves.",
        pcm: "Call SURPIN helpline now, or 112 if di pikin don already hurt imself.",
      },
      {
        en: "If you are the one feeling this way, these lines are for you too.",
        pcm: "If na you dey feel like dis, dis lines dey for you too.",
      },
    ],
    say: [
      {
        en: "“I am glad you told me. I am staying with you.”",
        pcm: "“I happy say you tell me. I go stay with you.”",
      },
      { en: "“We will get help together.”", pcm: "“We go find help together.”" },
    ],
    avoid: [
      {
        en: "Do not shout, shame the child, or tell them it is a sin.",
        pcm: "No shout, shame di pikin, or tell am say na sin.",
      },
    ],
    contactTopics: ["self_harm", "emergency"],
    sources: ["who_suicide"],
  },
};

export function categoryById(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}
