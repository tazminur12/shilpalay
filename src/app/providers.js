"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./components/ui/Toast";

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
