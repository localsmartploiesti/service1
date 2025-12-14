'use client'

import { useEffect } from 'react'

export default function RegisterPWA() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Așteptăm ca pagina să se încarce complet
      window.addEventListener('load', function() {
        navigator.serviceWorker
          .register('/sw.js')
          .then(
            function (registration) {
              console.log('✅ Service Worker înregistrat cu succes: ', registration.scope)
            },
            function (err) {
              console.log('❌ Service Worker a eșuat: ', err)
            }
          )
      })
    }
  }, [])

  return null
}