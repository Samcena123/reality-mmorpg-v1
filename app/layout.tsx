import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "現實 MMORPG",
  description: "以現實地點任務驅動的 MMORPG 指揮介面。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
