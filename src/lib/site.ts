/** Replace these with the registered company name and a shared team inbox. */
export const COMPANY_NAME = "Haven";
/** Haven's privacy notice, a public Google Doc that the team can edit. */
export const PRIVACY_NOTICE_URL =
  "https://docs.google.com/document/d/1Jkdt7rfC2bO1h-DHmiKHYJHt04hko6l7Rx0yKkbtOtI/edit?usp=sharing";
export const CONTACT_EMAIL = "pheobeayo@gmail.com";

export const WORK_ROLES = [
  "Teacher or school staff",
  "Community health worker",
  "Nurse, midwife or doctor",
  "Social worker",
  "Youth or faith leader",
  "Parent or caregiver",
  "Other",
] as const;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

export function coverageForState(state: unknown): "fct" | "lagos" | "nationwide" {
  if (state === "FCT Abuja") return "fct";
  if (state === "Lagos") return "lagos";
  return "nationwide";
}
