import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/context/AppContext'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0e1322',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://office.softty.net'),
  title: {
    default: 'Softty Office — Bộ Ứng Dụng Văn Phòng Thế Hệ Mới',
    template: '%s | Softty Office',
  },
  description:
    'Bộ ứng dụng văn phòng thế hệ mới cho máy tính và điện thoại. Soạn thảo văn bản, bảng tính, trình chiếu, đọc PDF mượt mà, lưu trên máy tính cá nhân và chuyển file tức thì.',
  keywords: [
    'Softty Office',
    'Bộ ứng dụng văn phòng',
    'Soạn thảo văn bản',
    'Bảng tính mượt mà',
    'Trình chiếu bài thuyết trình',
    'Đọc và ký file PDF',
    'Chuyển file không dây',
    'Quét tài liệu bằng điện thoại',
    'Văn phòng bảo mật',
  ],
  authors: [{ name: 'CÔNG TY TNHH SOFTTY.NET', url: 'https://www.softty.net' }],
  creator: 'CÔNG TY TNHH SOFTTY.NET',
  publisher: 'CÔNG TY TNHH SOFTTY.NET',
  applicationName: 'Softty Office',
  alternates: {
    canonical: 'https://office.softty.net',
  },
  openGraph: {
    title: 'Softty Office — Bộ Ứng Dụng Văn Phòng Thế Hệ Mới',
    description:
      'Bộ ứng dụng văn phòng thế hệ mới cho máy tính và điện thoại. Soạn thảo văn bản, bảng tính, trình chiếu, đọc PDF mượt mà, lưu trên máy tính cá nhân và chuyển file tức thì.',
    url: 'https://office.softty.net',
    siteName: 'Softty Office',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Softty Office',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Softty Office — Bộ Ứng Dụng Văn Phòng Thế Hệ Mới',
    description:
      'Bộ ứng dụng văn phòng thế hệ mới cho máy tính và điện thoại. Soạn thảo văn bản, bảng tính, trình chiếu, đọc PDF mượt mà, lưu trên máy tính cá nhân và chuyển file tức thì.',
    images: ['/og-image.png'],
    creator: '@softtynet',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Productivity',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Softty Office',
  operatingSystem: 'macOS, Windows, Linux, iOS, Android',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'VND',
  },
  description:
    'Bộ ứng dụng văn phòng thế hệ mới cho máy tính và điện thoại. Soạn thảo văn bản, bảng tính, trình chiếu, đọc PDF mượt mà, lưu trên máy tính cá nhân và chuyển file tức thì.',
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'CÔNG TY TNHH SOFTTY.NET',
    alternateName: 'SOFTTY.NET CO., LTD',
    taxID: '0110979941',
    duns: '665555612',
    url: 'https://www.softty.net',
    telephone: '+84-978-085-495',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tầng 10, Tòa nhà CEO, HH2-1, Đô thị mới Mễ Trì Hạ, Đường Phạm Hùng',
      addressLocality: 'Phường Từ Liêm',
      addressRegion: 'Thành phố Hà Nội',
      addressCountry: 'VN',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('softty_office_landing_theme');
                var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'dark' || (!saved && supportDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] antialiased selection:bg-[#2563eb] selection:text-white transition-colors duration-200">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
