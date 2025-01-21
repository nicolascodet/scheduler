import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import ErrorBoundary from '@/components/ErrorBoundary'
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'

export const metadata: Metadata = {
  title: 'Smart Calendar Assistant',
  description: 'AI-powered calendar management and scheduling optimization',
  applicationName: 'Smart Calendar Assistant',
  authors: [{ name: 'Nicolas Codet' }],
  keywords: [
    'calendar',
    'AI assistant',
    'training schedule',
    'project management',
    'PWA',
    'Google Calendar',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart Calendar Assistant',
    startupImage: [
      {
        url: '/splash/launch-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/splash/launch-1242x2688.png',
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)'
      }
    ]
  },
  icons: {
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', sizes: '512x512' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smart Calendar Assistant" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
        <ErrorBoundary>
          <ServiceWorkerProvider>
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            {process.env.NEXT_PUBLIC_ANALYTICS_ID && <Analytics />}
          </ServiceWorkerProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
