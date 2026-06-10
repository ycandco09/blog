import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "安全技术博客",
    template: "%s | 安全技术博客",
  },
  description: "网络安全研究者的技术笔记、研究素材归档与专业能力展示",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
