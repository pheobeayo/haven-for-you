import { useState } from "react";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import {
  COVERAGE_LABEL,
  contactsFor,
  type Contact,
  type ContactTopic,
  type Coverage,
} from "@/content/contacts";
import { useLang } from "@/lib/lang";

const PLACES: Coverage[] = ["nationwide", "fct", "lagos"];

function ContactRow({ contact }: { contact: Contact }) {
  const { lang } = useLang();
  const pcm = lang === "pcm";
  return (
    <li className="py-4">
      <h3 className="text-lg font-bold leading-snug">{contact.name}</h3>
      <p className="mt-1 max-w-prose leading-snug text-muted-foreground">{contact.what[lang]}</p>
      {contact.address && (
        <p className="mt-2 flex gap-2 leading-snug">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          {contact.address}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {contact.phone && (
          <a
            href={`tel:${contact.phone.dial}`}
            className="tap inline-flex items-center gap-2 rounded-md bg-primary px-4 text-lg font-bold text-primary-foreground"
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
            className="tap inline-flex items-center gap-2 rounded-md border-2 border-primary px-4 font-bold text-primary"
          >
            {pcm ? "Open website" : "Open website"}
            <ExternalLink className="h-5 w-5" aria-hidden />
          </a>
        )}
        {!contact.confirmedOn && (
          <span className="text-sm font-bold text-soon">
            {pcm ? "Haven never confirm dis contact" : "Not yet confirmed by Haven"}
          </span>
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
    <div>
      <div
        role="group"
        aria-label={pcm ? "Where you dey" : "Where you are"}
        className="flex flex-wrap gap-2"
      >
        {PLACES.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={place === p}
            onClick={() => setPlace(p)}
            className={`min-h-11 rounded-md border-2 px-3 font-bold ${place === p ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground"}`}
          >
            {COVERAGE_LABEL[p][lang]}
          </button>
        ))}
      </div>
      <ul className="mt-2 divide-y divide-border">
        {contacts.map((c) => (
          <ContactRow key={c.id} contact={c} />
        ))}
      </ul>
    </div>
  );
}
