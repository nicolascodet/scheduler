'use client'

import { useEffect } from 'react'
import { Workbox } from 'workbox-window'

declare global {
  interface Window {
    workbox: any
  }
}

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = new Workbox('/sw.js')

      // Add event listeners
      wb.addEventListener('installed', (event) => {
        console.log('Service Worker installed:', event)
      })

      wb.addEventListener('activated', (event) => {
        console.log('Service Worker activated:', event)
      })

      wb.addEventListener('waiting', (event) => {
        // Show a prompt to the user to refresh the page
        if (
          confirm(
            'A new version of the app is available. Would you like to update?'
          )
        ) {
          wb.messageSkipWaiting()
          window.location.reload()
        }
      })

      // Register the service worker
      wb.register()
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Request notification permission
          if ('Notification' in window) {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') {
                console.log('Notification permission granted')
              }
            })
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return children
} 