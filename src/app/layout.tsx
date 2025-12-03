import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/component/auth/AuthProvider";
import { Web3Provider } from "@/component/web3/Web3Provider";
import Navbar from "@/component/UserNavbar";

export const metadata: Metadata = {
  title: {
    default: "JURYX | YASH DHIMAN",
    template: "%s | Yash Dhiman",
  },
  description:
    "BLOCKCHAIN-POWERED JURY MANAGEMENT SYSTEM BY YASH DHIMAN. Streamline jury selection, enhance transparency, and ensure fair trials with our decentralized platform.",
  keywords: [
    "Yash Dhiman",
    "Yash Dhiman Portfolio",
    "Full Stack Developer India",
    "AI Developer Portfolio",
    "Next.js Developer",
    "React Expert",
    "3D Web Developer",
    "Machine Learning Engineer",
    "Web Development Freelancer",
    "JavaScript Specialist",
  ],
  authors: [{ name: "Yash Dhiman", url: "https://yashdhiman.in" }],
  metadataBase: new URL("https://yashdhiman.in"),
  openGraph: {
    title: "Yash Dhiman - Full Stack & AI Developer",
    description:
      "Creator of JuryX - Blockchain powered hackathon management platform. Explore Yash's projects and skills in AI and full-stack development.",
    url: "https://yashdhiman.in",
    siteName: "Yash Dhiman Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://yashdhiman.in/yash.jpg",
        width: 1200,
        height: 630,
        alt: "JURYX | YASH DHIMAN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@YashDhiman001",
    creator: "@YashDhiman001",
    title: "Yash Dhiman - Full Stack AI Developer",
    description: "Full Stack AI projects, 3D web, and professional portfolio.",
    images: ["https://yashdhiman.in/yash.jpg"],
  },
  alternates: {
    canonical: "https://yashdhiman.in",
  },
  manifest: "/site.webmanifest",
};

// Moved cookies access inside the component
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const cookieStore = await cookies();
  // const userId = cookieStore.get('user_id')?.value;
  // // const emailId = cookieStore.get('user_email')?.value;
  // // console.log("userId:",userId,"e:",emailId)
  // const isAuthenticated = !!userId;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Yash Dhiman",
    jobTitle: "Full Stack & AI Developer",
    url: "https://yashdhiman.in",
    sameAs: [
      "https://github.com/theyashdhiman04",
      "https://www.linkedin.com/in/theyashdhiman04",
      "https://x.com/yashdhiman001",
    ],
    image: "https://yashdhiman.in/yash.jpg",
    description:
      "Full Stack Developer specializing in AI and modern web technologies",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "India",
    },
    knowsAbout: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Artificial Intelligence",
      "Machine Learning",
      "Web Development",
    ],
  };
  return (
    <html lang="en">
      {/* ${geistSans.variable} ${geistMono.variable} */}
      <head>
        <link rel="icon" href="data:," />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={` antialiased`}>
        <AuthProvider>
          <Web3Provider>
            <div className="">
              <Navbar />
            </div>
            {children}{" "}
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
