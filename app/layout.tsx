import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '거상 육의전 시세 조회',
  description: '거상 용병 제작 재료 실시간 시세 조회',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
