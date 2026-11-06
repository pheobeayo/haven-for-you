import type { Localised } from "./guidance";

export type Coverage = "nationwide" | "fct" | "lagos";
export type ContactTopic =
  "emergency" | "child" | "sexual_violence" | "self_harm" | "trafficking" | "online";

export type Contact = {
  id: string;
  name: string;
  coverage: Coverage;
  topics: ContactTopic[];
  what: Localised;
  phone?: { display: string; dial: string };
  url?: string;
  address?: string;
  /** Where the detail was published. Every contact must have one. */
  source: string;
  /**
   * The date a Haven team member called this contact and confirmed the details.
   * Keep null until someone has really done that. The app shows a warning for null.
   */
  confirmedOn: string | null;
};

export const COVERAGE_LABEL: Record<Coverage, Localised> = {
  nationwide: { en: "All Nigeria", pcm: "All Nigeria" },
  fct: { en: "Abuja (FCT)", pcm: "Abuja (FCT)" },
  lagos: { en: "Lagos", pcm: "Lagos" },
};

export const CONTACTS: Contact[] = [
  {
    id: "emergency-112",
    name: "National emergency line",
    coverage: "nationwide",
    topics: ["emergency"],
    what: {
      en: "Free emergency number for police, ambulance and other urgent help.",
      pcm: "Free emergency number for police, ambulance and other urgent help.",
    },
    phone: { display: "112", dial: "112" },
    source: "https://ncc.gov.ng/node/1397",
    confirmedOn: null,
  },
  {
    id: "cece-yara",
    name: "Cece Yara Child Helpline",
    coverage: "nationwide",
    topics: ["child", "sexual_violence", "online"],
    what: {
      en: "Free 24-hour child helpline for children and adults worried about them.",
      pcm: "Free 24-hour child helpline for pikin and adult wey dey worry about dem.",
    },
    phone: { display: "0800 800 8001", dial: "08008008001" },
    source: "https://childhelplineinternational.org/nigeria-cece-yara-child-helpline/",
    confirmedOn: null,
  },
  {
    id: "warif",
    name: "WARIF Helpline",
    coverage: "nationwide",
    topics: ["sexual_violence"],
    what: {
      en: "Free 24-hour helpline for rape and sexual violence.",
      pcm: "Free 24-hour helpline for rape and sexual violence.",
    },
    phone: { display: "0800 9210 0009", dial: "080092100009" },
    source: "https://warifng.org/?p=1031",
    confirmedOn: null,
  },
  {
    id: "surpin",
    name: "SURPIN Helpline",
    coverage: "nationwide",
    topics: ["self_harm"],
    what: {
      en: "Free 24-hour support for suicide and self-harm crises.",
      pcm: "Free 24-hour support when person dey think of suicide or to hurt imself.",
    },
    phone: { display: "0800 078 7746", dial: "08000787746" },
    source: "https://lifeline-international.com/member/nigeria-surpin/",
    confirmedOn: null,
  },
  {
    id: "naptip",
    name: "NAPTIP",
    coverage: "nationwide",
    topics: ["trafficking", "child"],
    what: {
      en: "Federal agency for trafficking and related violence.",
      pcm: "Federal agency for trafficking and violence wey join am.",
    },
    phone: { display: "0703 000 0203", dial: "07030000203" },
    address: "No. 2028 Dalaba Street, Wuse Zone 5, Abuja",
    source:
      "https://www.rapeisacrime.org/portal/location-based-help-support/name/national-agency-for-the-prohibition-of-trafficking-in-persons/",
    confirmedOn: null,
  },
  {
    id: "take-it-down",
    name: "Take It Down",
    coverage: "nationwide",
    topics: ["online"],
    what: {
      en: "Free service that helps remove sexual images taken of someone under 18 from taking part platforms. The images are not sent to anyone.",
      pcm: "Free service wey dey help remove sexual picture of person wey never reach 18 from platform wey join am. You no go send di picture to anybody.",
    },
    url: "https://takeitdown.ncmec.org",
    source: "https://www.missingkids.org/blog/2023/sextortion-parents-should-know",
    confirmedOn: null,
  },
  {
    id: "awyetu",
    name: "Awyetu Sexual Assault Referral Centre",
    coverage: "fct",
    topics: ["sexual_violence", "child"],
    what: {
      en: "Medical care, evidence collection, legal aid, counselling and referral.",
      pcm: "Medical care, evidence, legal aid, counselling and referral.",
    },
    address: "Bwari General Hospital, Abuja",
    source: "https://childreninfobank.com/?p=37339",
    confirmedOn: null,
  },
  {
    id: "ster",
    name: "Stand to End Rape",
    coverage: "fct",
    topics: ["sexual_violence"],
    what: {
      en: "Support for people affected by sexual violence.",
      pcm: "Support for people wey sexual violence touch.",
    },
    phone: { display: "0809 596 7000", dial: "08095967000" },
    address: "2 Gwani Street, opposite IGI House, Zone 4, Wuse, Abuja",
    source: "https://rapeisacrime.org/help-directory/pg/2",
    confirmedOn: null,
  },
  {
    id: "mirabel",
    name: "Mirabel Centre",
    coverage: "lagos",
    topics: ["sexual_violence", "child"],
    what: {
      en: "Free medical and counselling support for survivors of sexual violence.",
      pcm: "Free medical and counselling support for people wey survive sexual violence.",
    },
    phone: { display: "0815 577 0000", dial: "08155770000" },
    address: "Lagos State University Teaching Hospital, Ikeja",
    source: "https://findahelpline.com/countries/ng/la/topics/sexual-abuse",
    confirmedOn: null,
  },
  {
    id: "lagos-dsva",
    name: "Lagos Domestic and Sexual Violence Agency",
    coverage: "lagos",
    topics: ["sexual_violence", "child"],
    what: {
      en: "Lagos State line for domestic and sexual violence.",
      pcm: "Lagos State line for domestic and sexual violence.",
    },
    phone: { display: "0800 033 3333", dial: "08000333333" },
    source: "https://findahelpline.com/countries/ng/la/topics/sexual-abuse",
    confirmedOn: null,
  },
];

export function contactsFor(topics: ContactTopic[], place: Coverage): Contact[] {
  const fits = (c: Contact) => c.topics.some((t) => topics.includes(t));
  const local = CONTACTS.filter((c) => c.coverage === place && place !== "nationwide" && fits(c));
  const national = CONTACTS.filter((c) => c.coverage === "nationwide" && fits(c));
  return [...local, ...national];
}
