import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerAuthData } from "@/lib/server-auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Voxsonus",
  description:
    "Voxsonus is a modern, open-source, self-hosted voice assistant platform. It allows you to build and deploy custom voice applications with ease, leveraging the power of AI and natural language processing.",
};

export default async function RootLayout({ children }) {
  // Get auth data on server side for initial state
  const authData = await getServerAuthData();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__INITIAL_AUTH__ = ${JSON.stringify(authData)};
            `,
          }}
        />
        {children}
        <Toaster expand={false} richColors closeButton />
      </body>
    </html>
  );
}
