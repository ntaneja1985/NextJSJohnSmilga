import './globals.css'
import Navbar from "@/components/Navbar";
import {Inconsolata} from "next/font/google";
import type {Metadata} from "next";

//const inter = Inter({subsets:['latin']});
const inconsolata  = Inconsolata({subsets:['latin']});
//const roboto = Roboto({subsets:['latin'],weight:['400']})

export const metadata:Metadata = {
    title: 'Next.js Project',
    description: 'A Next.js project with TypeScript and TailwindCSS.',
    keywords: 'Next.js, Typescript, TailwindCSS',
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
      <html lang="en">
      <body className={inconsolata.className}>
      <Navbar />
      <main className='max-w-3xl mx-auto py-10'>{children}</main>

      </body>
      </html>
  )
}