import { describe, expect, it } from "vitest";
import { accountTypeOf, coverageForState } from "@/lib/site";

describe("account types", () => {
  it("treats anything other than organisation as an individual account", () => {
    expect(accountTypeOf("organisation")).toBe("organisation");
    expect(accountTypeOf("individual")).toBe("individual");
    expect(accountTypeOf(undefined)).toBe("individual");
    expect(accountTypeOf("admin")).toBe("individual");
  });

  it("shows local contacts for Abuja and Lagos accounts", () => {
    expect(coverageForState("FCT Abuja")).toBe("fct");
    expect(coverageForState("Lagos")).toBe("lagos");
    expect(coverageForState("Kano")).toBe("nationwide");
  });
});
