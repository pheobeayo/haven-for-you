import {
  CATEGORIES,
  type Answer,
  type Category,
  type CategoryId,
  type EmergencyKind,
  type Urgency,
} from "@/content/guidance";

/**
 * Safety routing that works with no AI at all. If the model is slow, down or
 * wrong, Haven falls back to these rules and the scripted questions.
 */
export const MAX_CONCERN_LENGTH = 1500;

const RECENT =
  /\b(today|tonight|yesterday|last night|this morning|this evening|just now|just happen\w*|a few days ago|few days ago|days ago|hours ago|dis morning|yesterday night)\b/;

const SEXUAL =
  /\b(rape[ds]?|raping|defile[ds]?|defilement|sexual\w*|molest\w*|private parts?|touched her|touched him|touch am|sleep with|forced (her|him)|sex)\b/;

const EMERGENCY_RULES: { kind: EmergencyKind; pattern: RegExp }[] = [
  {
    kind: "self_harm",
    pattern:
      /\b(suicid\w*|kill (her|him|my|them)sel[fv]\w*|take (her|his|my) (own )?life|end (her|his|my|their) life|(want|wants|wan|wanted) to (die|end it)|wan die|hurt(ing)? (her|him|my|them)sel[fv]\w*|cut(ting)? (her|him|my|them)sel[fv]\w*|take poison|drink poison|hurt imself|kill imself)\b/,
  },
  {
    kind: "danger",
    pattern:
      /\b(in danger|immediate danger|danger now|kidnap\w*|abduct\w*|is missing|has gone missing|don miss|locked (her|him|them|the child) (up|in)|lock am|has a (gun|knife)|holding a (gun|knife)|threaten\w* to kill|will kill|wan kill|bleeding|not breathing|no dey breathe|unconscious|beating (her|him|them|the child) now|dey beat am now|taken (her|him|the child) away|carry am go now)\b/,
  },
];

export function normaliseConcern(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
}

export function detectEmergency(text: string): EmergencyKind | null {
  const t = normaliseConcern(text);
  for (const rule of EMERGENCY_RULES) if (rule.pattern.test(t)) return rule.kind;
  if (SEXUAL.test(t) && RECENT.test(t)) return "assault";
  return null;
}

const CATEGORY_RULES: { id: CategoryId; pattern: RegExp }[] = [
  { id: "sexual", pattern: SEXUAL },
  {
    id: "online",
    pattern:
      /\b(online|whatsapp|facebook|instagram|tiktok|snapchat|telegram|internet|nude\w*|naked|send (her|him|me)? ?pictures?|sextort\w*|blackmail\w*|messag\w*|chat\w*|dm|dms|video call|share (her|his|the) pictures?)\b/,
  },
  {
    id: "physical",
    pattern:
      /\b(beat\w*|hit|hits|hitting|slap\w*|flog\w*|bruis\w*|burn\w*|wound\w*|injur\w*|marks?|scars?|swollen|wound am|dey beat|cane\w*)\b/,
  },
  {
    id: "grooming",
    pattern:
      /\b(gifts?|secrets?|alone with|time alone|buys? (her|him)|gives? (her|him) money|too close|following (her|him)|special friend|dey give am money|boyfriend|older man|uncle|teacher|pastor|driver|neighbou?r)\b/,
  },
  {
    id: "behaviour",
    pattern:
      /\b(withdrawn|quiet|sad|crying|cries|afraid|scared|fear\w*|nightmares?|not eating|won't eat|stopped (eating|talking|going)|changed|acting differently|bed ?wetting|no dey talk|dey fear|dey cry|refuses to go)\b/,
  },
];

export function classifyConcern(text: string): CategoryId | null {
  const t = normaliseConcern(text);
  for (const rule of CATEGORY_RULES) if (rule.pattern.test(t)) return rule.id;
  return null;
}

/** Removes contact details before text leaves the device for the AI service. */
export function redactConcern(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email removed]")
    .replace(/(\+?\d[\s()-]?){7,}/g, "[number removed]")
    .slice(0, MAX_CONCERN_LENGTH);
}

export type RoutedConcern = {
  category: CategoryId | null;
  emergency: EmergencyKind | null;
  source: "ai" | "rules";
};

const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as string[];
const EMERGENCY_IDS: EmergencyKind[] = ["danger", "assault", "self_harm"];

export type AIRouting = {
  category: CategoryId | null;
  emergency: EmergencyKind | null;
  confident: boolean;
};

/** Accepts only fixed labels. Any other text from the model is thrown away. */
export function parseAIRouting(raw: string): AIRouting | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const o = JSON.parse(cleaned) as {
      category?: unknown;
      emergency?: unknown;
      confidence?: unknown;
    } | null;
    if (o === null || typeof o !== "object") return null;
    const category =
      typeof o.category === "string" && CATEGORY_IDS.includes(o.category)
        ? (o.category as CategoryId)
        : null;
    if (o.category !== null && category === null) return null;
    const emergency =
      typeof o.emergency === "string" && EMERGENCY_IDS.includes(o.emergency as EmergencyKind)
        ? (o.emergency as EmergencyKind)
        : null;
    if (o.emergency !== "none" && o.emergency !== null && emergency === null) return null;
    if (o.confidence !== "high" && o.confidence !== "medium" && o.confidence !== "low") return null;
    return { category, emergency, confident: o.confidence !== "low" };
  } catch {
    return null;
  }
}

/** AI can raise concern to an emergency. It can never clear one the rules found. */
export function mergeRouting(text: string, ai: AIRouting | null): RoutedConcern {
  const emergency = detectEmergency(text);
  const ruleCategory = classifyConcern(text);
  if (!ai) return { category: ruleCategory, emergency, source: "rules" };
  return {
    category: ai.confident && ai.category ? ai.category : ruleCategory,
    emergency: emergency ?? ai.emergency,
    source: "ai",
  };
}

export type QuestionOutcome =
  { kind: "emergency"; emergency: EmergencyKind } | { kind: "continue"; urgency: Urgency };

export function applyAnswers(category: Category, answers: Record<string, Answer>): QuestionOutcome {
  let urgency = category.baseUrgency;
  for (const q of category.questions) {
    const a = answers[q.id];
    if (q.emergency && a === "yes") return { kind: "emergency", emergency: q.emergency };
    if (q.raisesToToday && (a === "yes" || a === "unsure")) urgency = "today";
  }
  return { kind: "continue", urgency };
}
