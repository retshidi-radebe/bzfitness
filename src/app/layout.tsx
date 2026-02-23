import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BZ Fitness and Wellness - Transform Your Body in Tseki",
  description: "Affordable community fitness in Tseki. Group training, body transformation plans, and lifestyle coaching for all ages. Join BZ Fitness today!",
  keywords: ["BZ Fitness", "Tseki fitness", "group training", "body transformation", "personal training", "wellness coaching"],
  authors: [{ name: "BZ Fitness and Wellness" }],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "BZ Fitness and Wellness - Transform Your Body",
    description: "Affordable community fitness in Tseki. Join us for group training, body transformation plans, and lifestyle coaching.",
    siteName: "BZ Fitness",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BZ Fitness and Wellness",
    description: "Transform your body, Elevate your mind — affordable community fitness in Tseki.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
