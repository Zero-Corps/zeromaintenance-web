import type { Metadata } from "next";
import {
  Anton,
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zero Maintenance — Mobile Auto Detailing | Wise County & DFW",
  description:
    "Mobile detailing done so well that upkeep drops to near zero. Based in Wise County, TX — serving Decatur, Bridgeport, Boyd, Rhome, Denton, and northwest Fort Worth. Get an instant estimate and request a quote. A ZeroCorps venture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} ${jetbrainsMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-fg">
        {children}
      </body>
    </html>
  );
}
