"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { ReactNode, useCallback } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigate = useCallback(
    (href: string) => {
      if (typeof document !== "undefined" && "startViewTransition" in document) {
        (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }
    },
    [router],
  );

  return <RouterProvider navigate={navigate}>{children}</RouterProvider>;
}
