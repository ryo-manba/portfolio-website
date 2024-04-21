"use client";

import {useRouter} from "next/navigation";
import {RouterProvider} from 'react-aria-components';
import { ReactNode } from "react";

export function ClientProviders({children}: {children: ReactNode}) {
  const router = useRouter();
  return (
    <RouterProvider navigate={router.push}>
      {children}
    </RouterProvider>
  );
}