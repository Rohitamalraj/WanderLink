import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'WanderLink - Web3 Social Travel',
  description: 'Find your travel tribe — powered by AI, secured by Web3',
  keywords: ['travel', 'web3', 'blockchain', 'ai', 'social', 'trips'],
  authors: [{ name: 'WanderLink Team' }],
  openGraph: {
    title: 'WanderLink',
    description: 'Find your travel tribe — powered by AI, secured by Web3',
    type: 'website',
    locale: 'en_US',
    siteName: 'WanderLink',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
