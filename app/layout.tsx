import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "sweetalert2/dist/sweetalert2.min.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amigo Secreto Online",
  description: "Gerencie seus sorteios de amigo secreto de forma fácil e prática",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
