import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { SideArt, type ArtVariant } from "@/components/haven/SideArt";

export function HelpPage({
  title,
  art = "cloth",
  children,
}: {
  title: string;
  art?: ArtVariant;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container-app grid gap-12 py-6 md:py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight text-primary md:text-5xl">
            {title}
          </h1>
          <div className="mt-8 space-y-8 text-lg leading-relaxed">{children}</div>
        </div>
        <SideArt variant={art} />
      </main>
    </div>
  );
}
