import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONTACTS, contactsFor } from "@/content/contacts";
import {
  CATEGORIES,
  EMERGENCIES,
  SOURCES,
  type Guidance,
  type Localised,
} from "@/content/guidance";

function complete(text: Localised) {
  expect(text.en.trim()).not.toBe("");
  expect(text.pcm.trim()).not.toBe("");
}

const blocks: Guidance[] = [...CATEGORIES, ...Object.values(EMERGENCIES)];

describe("guidance library", () => {
  it("has English and Pidgin for every line", () => {
    for (const block of blocks) {
      [block.title, ...block.doNow, ...block.say, ...block.avoid].forEach(complete);
    }
    for (const category of CATEGORIES) {
      [category.label, category.example, ...category.questions.map((q) => q.text)].forEach(
        complete,
      );
    }
  });

  it("gives every block steps, a source and someone to contact in every place", () => {
    for (const block of blocks) {
      expect(block.doNow.length).toBeGreaterThan(0);
      expect(block.sources.length).toBeGreaterThan(0);
      block.sources.forEach((id) => expect(SOURCES[id]).toBeDefined());
      for (const place of ["nationwide", "fct", "lagos"] as const) {
        expect(contactsFor(block.contactTopics, place).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("self-harm response", () => {
  it("cites guidance about suicide, not sexual abuse", () => {
    expect(EMERGENCIES.self_harm.sources).toEqual(["who_suicide"]);
  });
});

describe("contacts", () => {
  it("records where every contact came from", () => {
    for (const contact of CONTACTS) {
      expect(contact.source).toMatch(/^https:\/\//);
      expect(contact.phone || contact.url || contact.address).toBeTruthy();
    }
  });

  it("puts 112 in every emergency response", () => {
    expect(contactsFor(EMERGENCIES.danger.contactTopics, "lagos").map((c) => c.id)).toContain(
      "emergency-112",
    );
  });
});

describe("no images, ever", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (!["test", "ui", "integrations"].includes(name)) walk(path);
      } else if (/\.tsx?$/.test(name)) files.push(path);
    }
  };
  walk("src");

  it("has no file input or image handling in the app", () => {
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/type="file"|FileReader|imageDataUrl|image_url|capture=/);
    }
  });
});
