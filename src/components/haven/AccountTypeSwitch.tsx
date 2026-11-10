import { Building2, User } from "lucide-react";
import { useT } from "@/lib/lang";
import type { AccountType } from "@/lib/site";

/** Two large choices, so it is clear who the account is for. */
export function AccountTypeSwitch({
  value,
  onChange,
}: {
  value: AccountType;
  onChange: (value: AccountType) => void;
}) {
  const t = useT();
  const options: { value: AccountType; label: string; hint: string; Icon: typeof User }[] = [
    {
      value: "individual",
      label: t("Individual", "Individual"),
      hint: t("Teacher, health worker, carer", "Teacher, health worker, carer"),
      Icon: User,
    },
    {
      value: "organisation",
      label: t("Organisation", "Organisation"),
      hint: t("School, clinic, NGO, agency", "School, clinic, NGO, agency"),
      Icon: Building2,
    },
  ];
  return (
    <fieldset>
      <legend className="font-bold">
        {t("Who is this account for?", "Who dis account dey for?")}
      </legend>
      <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        {options.map(({ value: v, label, hint, Icon }) => (
          <label
            key={v}
            className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-md border-2 p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring ${value === v ? "border-primary bg-secondary" : "border-input bg-card"}`}
          >
            <input
              type="radio"
              name="account-type"
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              className="sr-only"
            />
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block font-bold leading-snug">{label}</span>
              <span className="block text-sm leading-snug text-muted-foreground">{hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
