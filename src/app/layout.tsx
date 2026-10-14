import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Papertrail — Invoice Studio",
  description: "A calm, simple invoice workspace for independent freelancers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
