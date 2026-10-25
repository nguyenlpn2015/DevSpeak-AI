import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevSpeak AI — AI English Interview Coach for IT & DevOps Professionals",
  description:
    "Master technical communication, incident explanations, and behavioral interviews in professional English. Tailored for DevOps, SRE, Cloud, and Software Engineers.",
  keywords: [
    "DevOps interview",
    "English for IT",
    "Technical English coach",
    "Kubernetes interview practice",
    "STAR method IT",
    "Mock interview AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeApiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <html lang="en" className="dark">
      <head>
        {runtimeApiUrl !== undefined ? (
          <script
            id="devspeak-runtime-config"
            dangerouslySetInnerHTML={{
              __html: `window.__NEXT_PUBLIC_API_URL = ${JSON.stringify(runtimeApiUrl)};`,
            }}
          />
        ) : null}
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

