import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { ClientProviders } from "./client-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Lancerly - Professional Freelance Platform",
  description: "Connect with talented freelancers and get your projects done with confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} antialiased scroll-smooth`}>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
