import "./globals.css";
import { ClientProviders } from "./client-providers";

export const metadata = {
  title: "Lancerly",
  description: "Freelance platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
