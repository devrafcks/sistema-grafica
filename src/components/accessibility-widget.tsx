'use client'

import { useEffect } from 'react'

export function AccessibilityWidget() {
  useEffect(() => {
    if (document.querySelector('seeb-widget')) return

    const script = document.createElement('script')
    script.src = 'https://seeb-widget.pages.dev/widget.js'
    script.defer = true
    script.onload = () => {
      if (!document.querySelector('seeb-widget')) {
        const widget = document.createElement('seeb-widget')
        document.body.appendChild(widget)
      }
    }
    document.body.appendChild(script)
  }, [])

  return null
}
