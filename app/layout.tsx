import type { Metadata, Viewport } from 'next'
import './globals.css'
import RegisterPWA from '../components/registerPWA' // <--- IMPORT NOU
import {BUSINESS_NAME_FULL,DESCRIPTION} from '../lib/version'


// ... importurile tale existente ...

export const metadata: Metadata = {
  title: BUSINESS_NAME_FULL,
  description: DESCRIPTION,
  manifest: '/manifest.json', // Legătura cu fișierul creat mai sus
  icons: {
    apple: '/icon-180x180.png', // Iconița pentru iPhone
  },
}

export const viewport: Viewport = {
  themeColor: '#000000', // Culoarea barei de status (negru pentru tema ta)
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Previne zoom-ul accidental pe mobil, dă un feeling de app nativ
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <head>
        {/* Poți adăuga tag-uri specifice Apple aici dacă metadata nu e suficient */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
          <RegisterPWA/>
      <body>{children}</body>
    </html>
  )
}