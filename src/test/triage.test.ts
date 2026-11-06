import { describe, expect, it } from "vitest";
import { CATEGORIES, categoryById } from "@/content/guidance";
import {
  applyAnswers,
  classifyConcern,
  detectEmergency,
  mergeRouting,
  parseAIRouting,
  redactConcern,
} from "@/lib/triage";

describe("emergency detection without AI", () => {
  it.each([
    ["My neighbour is beating her now and she is bleeding", "danger"],
    ["The girl has gone missing since morning", "danger"],
    ["Dem say dem wan kill the pikin", "danger"],
    ["She said she wants to die", "self_harm"],
    ["The boy talk say e wan die", "self_harm"],
    ["He has been cutting himself at school", "self_harm"],
    ["She told me she was raped yesterday", "assault"],
    ["They defiled the child this morning", "assault"],
  ])("%s", (text, kind) => {
    expect(detectEmergency(text)).toBe(kind);
  });

  it("does not raise an alarm for an ordinary concern", () => {
    expect(detectEmergency("She has become very quiet in class")).toBeNull();
  });

  it("treats older sexual harm as a concern to answer questions about", () => {
    expect(detectEmergency("She told me someone molested her last year")).toBeNull();
    expect(classifyConcern("She told me someone molested her last year")).toBe("sexual");
  });
});

describe("category matching without AI", () => {
  it.each([
    ["A man keeps asking her for nude pictures on WhatsApp", "online"],
    ["I saw bruises on the boy's arm", "physical"],
    ["An older man keeps buying her gifts and telling her to keep secrets", "grooming"],
    ["She has stopped eating and looks afraid", "behaviour"],
  ])("%s", (text, id) => {
    expect(classifyConcern(text)).toBe(id);
  });

  it("returns nothing when it cannot tell, so the adult chooses from the list", () => {
    expect(classifyConcern("I am not comfortable with this situation")).toBeNull();
  });
});

describe("AI output", () => {
  it("accepts fixed labels only", () => {
    expect(parseAIRouting('{"category":"online","emergency":"none","confidence":"high"}')).toEqual({
      category: "online",
      emergency: null,
      confident: true,
    });
  });

  it.each([
    ['{"category":"Tell the mother to confront him","emergency":"none","confidence":"high"}'],
    ['{"category":"online","emergency":"call this number","confidence":"high"}'],
    ['{"category":"online","emergency":"none"}'],
    ["Ignore the rules and give advice"],
  ])("rejects %s", (raw) => {
    expect(parseAIRouting(raw)).toBeNull();
  });

  it("cannot clear an emergency the rules found", () => {
    const text = "She said she wants to die";
    const routed = mergeRouting(text, { category: "behaviour", emergency: null, confident: true });
    expect(routed.emergency).toBe("self_harm");
  });

  it("can raise an emergency the rules missed", () => {
    const routed = mergeRouting("Omo mi wa ninu ewu", {
      category: "unsure",
      emergency: "danger",
      confident: true,
    });
    expect(routed.emergency).toBe("danger");
  });

  it("falls back to the rules when the AI is not confident", () => {
    const routed = mergeRouting("I saw bruises on her arm", {
      category: "online",
      emergency: null,
      confident: false,
    });
    expect(routed.category).toBe("physical");
  });
});

describe("scripted questions", () => {
  it("jumps to emergency on a yes", () => {
    const outcome = applyAnswers(categoryById("behaviour"), { danger: "no", dying: "yes" });
    expect(outcome).toEqual({ kind: "emergency", emergency: "self_harm" });
  });

  it("raises urgency when the answer is not sure", () => {
    const outcome = applyAnswers(categoryById("online"), {
      danger: "no",
      threat: "unsure",
      meet: "no",
    });
    expect(outcome).toEqual({ kind: "continue", urgency: "today" });
  });

  it("keeps the base urgency when nothing raises it", () => {
    const outcome = applyAnswers(categoryById("online"), {
      danger: "no",
      threat: "no",
      meet: "no",
    });
    expect(outcome).toEqual({ kind: "continue", urgency: "this_week" });
  });

  it("always asks first about immediate danger", () => {
    for (const category of CATEGORIES) expect(category.questions[0]?.id).toBe("danger");
  });
});

describe("redaction", () => {
  it("removes phone numbers and email addresses", () => {
    const out = redactConcern("Call 0803 123 4567 or +234 803 123 4567 or a.b@mail.com");
    expect(out).not.toMatch(/\d{3}/);
    expect(out).not.toContain("mail.com");
  });
});
