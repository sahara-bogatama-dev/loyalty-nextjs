import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
import MuiXLicense from "./muiXLicense";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "logistics Sahara Bogatama indonesia",
  description: "Pencatatan dan distribusi kebab.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const sessionKey = new Date().valueOf();

  return (
    <html lang="en">
      <SessionProvider session={session} key={sessionKey}>
        <body className={inter.className}>
          {children}
          <MuiXLicense />
        </body>
      </SessionProvider>
    </html>
  );
}
