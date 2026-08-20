import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { FeedbackBot } from "@/components/FeedbackBot";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusVoice | Student Feedback",
  description:
    "Share course feedback anonymously and help improve the learning experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          CampusVoice — student voices shaping better courses
        </footer>
        <FeedbackBot />
      </body>
    </html>
  );
}
