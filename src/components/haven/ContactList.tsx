import { useState } from "react";
import { BadgeCheck, CircleDashed, ExternalLink, MapPin, Phone } from "lucide-react";
import {
  COVERAGE_LABEL,
  contactsFor,
  type Contact,
  type ContactTopic,
  type Coverage,
} from "@/content/contacts";
import { useLang } from "@/lib/lang";

const PLACES: Coverage[] = ["nationwide", "fct", "lagos"];

function ContactCard({ contact }: { contact: Contact }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  // The national emergency line gets the dark card, so it stands apart from the rest.
  const emergency = contact.phone?.dial === "112";

  return (
    <li
      className={`flex flex-col rounded-[22px] p-6 sm:p-7 ${emergency ? "bg-(--hv-forest) text-(--hv-mist) md:col-span-2" : "border-[1.5px] border-(--hv-line) bg-white text-(--hv-forest)"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 className="min-w-0 text-lg font-semibold leading-snug">{contact.name}</h3>
        {contact.confirmedOn ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${emergency ? "bg-white/10 text-[var(--hv-apricot)]" : "bg-[var(--hv-sage)] text-[var(--hv-eucalyptus-deep)]"}`}
          >
            <BadgeCheck className="h-4 w-4" aria-hidden />
            {pcm ? "Haven don confirm am" : "Confirmed by Haven"}
          </span>
        ) : (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${emergency ? "bg-white/10 text-[var(--hv-on-dark)]" : "bg-[var(--soon-soft)] text-[var(--soon)]"}`}
          >
            <CircleDashed className="h-4 w-4" aria-hidden />
            {pcm ? "Haven never confirm am" : "Not yet confirmed"}
          </span>
        )}
      </div>

      <p
        className={`mt-2 max-w-prose leading-snug ${emergency ? "text-[var(--hv-on-dark)]" : "text-[var(--hv-ink-soft)]"}`}
      >
        {contact.what[lang]}
      </p>

      {contact.address && (
        <p className="mt-3 flex gap-2 text-[15px] leading-snug">
          <MapPin
            className={`mt-0.5 h-4 w-4 shrink-0 ${emergency ? "text-[var(--hv-apricot)]" : "text-[var(--hv-eucalyptus)]"}`}
            aria-hidden
          />
          {contact.address}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        {contact.phone && (
          <a
            href={`tel:${contact.phone.dial}`}
            className={`inline-flex min-h-12 items-center gap-2.5 rounded-full px-5 text-lg font-semibold tabular-nums transition-transform hover:-translate-y-px ${emergency ? "bg-[var(--hv-apricot)] text-[var(--hv-forest)]" : "bg-[var(--hv-eucalyptus)] text-white"}`}
          >
            <Phone className="h-5 w-5" aria-hidden />
            {contact.phone.display}
          </a>
        )}
        {contact.url && (
          <a
            href={contact.url}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] px-5 font-semibold transition-colors ${emergency ? "border-white/30 text-[var(--hv-mist)] hover:border-white" : "border-[var(--hv-line)] text-[var(--hv-forest)] hover:border-[var(--hv-eucalyptus)]"}`}
          >
            {pcm ? "Open website" : "Open website"}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </li>
  );
}

export function ContactList({
  topics,
  initialPlace = "nationwide",
}: {
  topics: ContactTopic[];
  initialPlace?: Coverage;
}) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  const [place, setPlace] = useState<Coverage>(initialPlace);
  const contacts = contactsFor(topics, place);

  return (
    <div className="hv-body">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p id="place-label" className="font-semibold text-[var(--hv-forest)]">
          {pcm ? "Where you dey?" : "Where are you?"}
        </p>
        <div
          role="group"
          aria-labelledby="place-label"
          className="inline-flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-[inset_0_0_0_1.5px_var(--hv-line)]"
        >
          {PLACES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={place === p}
              onClick={() => setPlace(p)}
              className={`min-h-10 rounded-full px-4 text-[15px] font-semibold transition-colors ${place === p ? "bg-[var(--hv-forest)] text-white" : "text-[var(--hv-forest)] hover:bg-[var(--hv-sage)]"}`}
            >
              {COVERAGE_LABEL[p][lang]}
            </button>
          ))}
        </div>
      </div>

      <ul aria-live="polite" className="mt-6 grid gap-4 md:grid-cols-2">
        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} />
        ))}
      </ul>
    </div>
  );
}
