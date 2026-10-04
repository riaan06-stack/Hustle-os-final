import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "./globals.css";
import { DemoSeeder } from "@/components/DemoSeeder";

export const metadata: Metadata = {
  title: "HustleOS — Build. Work. Earn. Grow.",
  description:
    "HustleOS connects ambitious freelancers with the businesses that need them.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#faf5e9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-main text-text-primary font-body">
        <DemoSeeder />
        {children}
      </body>
    </html>
  );
}
