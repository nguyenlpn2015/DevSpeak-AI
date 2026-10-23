import React from "react";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { DevSpeakApp } from "@/components/DevSpeakApp";

export default function Page() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DevSpeakApp />
        <AuthModal />
      </AuthProvider>
    </LanguageProvider>
  );
}
