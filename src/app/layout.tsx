import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { business } from "@/config/business";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocalBusinessSchema } from "@/components/LocalBusinessSchema";
import { Chrome } from "@/components/Chrome";

export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} – udekørende frisør og hjemmeklip i Kastrup`,
    template: `%s | ${business.name}`,
  },
  description:
    "Hjemmeklip i Kastrup og omegn. Mobil frisør kører hjem til dig: klip 350 kr, pensionistklip 325 kr, børneklip 225 kr. Se prisen og book.",
  keywords: [
    "hjemmeklip Kastrup",
    "udekørende frisør",
    "mobil frisør Kastrup",
    "mobil frisør Amager",
    "frisør der kommer hjem til dig",
    "hjemmefrisør København",
    "pensionistklip hjemme",
    "børneklip hjemme",
    "frisør til ældre",
    "frisør plejehjem Amager",
    "frisør 2770 Kastrup",
    "hjemmeklip Tårnby",
    "hjemmeklip Dragør",
    "mobile hairdresser Copenhagen",
    "senior haircut at home",
    "home haircut Denmark",
  ],
  openGraph: {
    type: "website",
    locale: "da_DK",
    siteName: business.name,
    title: `${business.name} – udekørende frisør og hjemmeklip i Kastrup`,
    description:
      "Hjemmeklip i Kastrup og omegn. Mobil frisør kører hjem til dig: klip, pensionistklip og børneklip. Se prisen og book.",
    images: [
      {
        url: "/behandlinger/hjemmebesoeg.png",
        width: 1152,
        height: 864,
        alt: "Udekørende frisør klipper en ældre kunde hjemme i stuen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.name} – udekørende frisør og hjemmeklip i Kastrup`,
    description: "Hjemmeklip i Kastrup og omegn. Klip, pensionistklip og børneklip hjemme hos dig.",
    images: ["/behandlinger/hjemmebesoeg.png"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  category: "beauty",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  other: {
    "geo.region": "DK-84",
    "geo.placename": business.home.city,
    "geo.position": `${business.home.lat};${business.home.lon}`,
    ICBM: `${business.home.lat}, ${business.home.lon}`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="da" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Chrome
          header={<SiteHeader />}
          footer={<SiteFooter />}
          schema={<LocalBusinessSchema />}
        >
          {children}
        </Chrome>
      </body>
    </html>
  );
}
