import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Share Your Review - Fynd',
  description: 'Share your experience and help us improve our service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
