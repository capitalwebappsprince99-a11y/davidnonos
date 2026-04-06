import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ConditionalNav from "@/components/ConditionalNav";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata = {
  title: "DavidNonos",
  description: "DavidNonos - Creative Director & Visual Artist",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <ConditionalNav />
        <main>{children}</main>
      </body>
    </html>
  );
}
