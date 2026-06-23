import { Suspense } from "react";

import UserBar from "@/components/shared/UserBar";

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.55))] px-4 py-8 font-sans sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex justify-end">
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Loading...</p>
            }
          >
            <UserBar />
          </Suspense>
        </div>
        {children}
      </main>
    </div>
  );
}
