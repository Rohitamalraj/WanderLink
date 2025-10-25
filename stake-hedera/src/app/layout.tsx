import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hedera A2A Staking",
  description: "Multi-agent staking application with A2A communication on Hedera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
