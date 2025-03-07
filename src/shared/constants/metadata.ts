import { Metadata } from "next";

// Metadata for the site
export const metadata: Metadata = {
  title: "Global Emissions Analytics",
  description: "Interactive data visualization for global emissions data",
  keywords: [
    "emissions",
    "climate change",
    "data visualization",
    "CO2 emissions",
    "environmental data",
    "climate analysis",
  ],
  creator: "Taylor Rohrich",
  publisher: "Taylor Rohrich",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gea-six.vercel.app",
    title: "Global Emissions Analytics",
    description: "Interactive data visualization for global emissions data",
    siteName: "Global Emissions Analytics",
    images: [
      {
        url: "/public/leaf.png",
        width: 1200,
        height: 630,
        alt: "Global Emissions Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Emissions Analytics",
    description: "Interactive data visualization for global emissions data",
    images: ["/public/leaf.png"],
  },
};
