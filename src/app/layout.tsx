import type { Metadata } from "next"
import { Geist_Mono, Montserrat, Noto_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { config } from "@/config"
import { cn } from "@/lib/utils"
import "./globals.css"

const montserratHeading = Montserrat({
  subsets: ["latin"],
  variable: "--font-heading",
})

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: `${config.site.name} - ${config.site.description}`,
    template: `%s · ${config.site.name}`,
  },
  description: config.site.description,
  metadataBase: new URL(config.site.url),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
        montserratHeading.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
