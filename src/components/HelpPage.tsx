import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";

export function HelpPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container-app py-6 md:py-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-tight text-primary md:text-5xl">{title}</h1>
          <div className="mt-8 space-y-8 text-lg leading-relaxed">{children}</div>
        </div>
      </main>
    </div>
  );
}