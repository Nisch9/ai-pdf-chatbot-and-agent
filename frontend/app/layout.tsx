import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider-context"
import { NotificationProvider } from "@/components/notification-provider"

import "./globals.css"

export const metadata: Metadata = {
  title: "Learning LangChain Book Chatbot Demo",
  description: "A chatbot demo based on Learning LangChain (O'Reilly)",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} min-h-screen transition-colors duration-300`}>
        <ThemeProvider>
          <NotificationProvider>
            {/* Background layer - styled via CSS for both themes */}
            <div className="fixed inset-0 -z-10 overflow-hidden theme-background">
              {/* Starfield layers - hidden in light mode via CSS */}
              <div className="stars-layer stars-small"></div>
              <div className="stars-layer stars-medium"></div>
              <div className="stars-layer stars-large"></div>
              <div className="shooting-star"></div>
              <div className="shooting-star"></div>
              {/* Light theme floating clouds - hidden in dark mode via CSS */}
              <div className="light-clouds-layer">
                <div className="light-cloud light-cloud-1"></div>
                <div className="light-cloud light-cloud-2"></div>
                <div className="light-cloud light-cloud-3"></div>
                <div className="light-cloud light-cloud-4"></div>
              </div>
              {/* Animated orbs - only visible in dark mode via CSS */}
              <div className="theme-orb absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
              <div className="theme-orb absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/8 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
              <div className="theme-orb absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-900/8 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
            </div>
            {children}
            <Toaster />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}