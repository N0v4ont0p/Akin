import React from "react";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { PrivacyModeProvider } from "@/providers/PrivacyModeProvider";

export const metadata = {
  title: "Akin — One pick. Mutual truth.",
  description: "The scarcity-first social discovery app for your class.",
};

function BackgroundOrbs() {
  return (
    <>
      <div
        className="orb"
        aria-hidden="true"
        style={{
          width: 500,
          height: 500,
          background: "rgba(100,60,220,0.18)",
          top: "-100px",
          left: "-100px",
        }}
      />
      <div
        className="orb"
        aria-hidden="true"
        style={{
          width: 400,
          height: 400,
          background: "rgba(0,200,140,0.12)",
          bottom: "-80px",
          right: "-80px",
          animationDelay: "-3s",
        }}
      />
      <div
        className="orb"
        aria-hidden="true"
        style={{
          width: 350,
          height: 350,
          background: "rgba(220,60,100,0.10)",
          top: "30%",
          right: "15%",
          animationDelay: "-6s",
        }}
      />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Akin — One pick. Mutual truth.</title>
        <meta name="description" content="The scarcity-first social discovery app for your class." />
      </head>
      <body>
        <PrivacyModeProvider>
          <UserProvider>
            <BackgroundOrbs />
            <main style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
              {children}
            </main>
          </UserProvider>
        </PrivacyModeProvider>
      </body>
    </html>
  );
}
