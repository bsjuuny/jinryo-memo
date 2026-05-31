import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "진료메모",
  description: "병원 방문 전 증상 정리 메모 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
