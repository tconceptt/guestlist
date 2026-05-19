"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";
import { Sparkles } from "lucide-react";

export function Providers({ children }: PropsWithChildren) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convex = useMemo(
    () => (convexUrl ? new ConvexReactClient(convexUrl) : null),
    [convexUrl],
  );

  if (!convex) {
    return (
      <main className="setupState">
        <div className="setupPanel">
          <Sparkles size={28} />
          <h1>Connect Convex to start planning</h1>
          <p>
            Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local`, then run `npx convex dev`
            from `developer/personal`.
          </p>
        </div>
      </main>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
