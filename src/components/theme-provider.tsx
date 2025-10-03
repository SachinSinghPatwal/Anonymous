// src/components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // important: matches SSR default
      enableSystem={false} // avoids SSR/client mismatch from system detection
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
