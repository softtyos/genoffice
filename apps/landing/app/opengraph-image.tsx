import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const alt = 'Softty Office'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logoPath = path.join(process.cwd(), 'public/logo.png')
  const logoData = fs.readFileSync(logoPath)
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0e1322',
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(37, 99, 235, 0.35) 0%, rgba(6, 182, 212, 0.12) 35%, rgba(14, 19, 34, 1) 75%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Subtle decorative glow ring */}
        <div
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '210px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0) 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Center Brand Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={160}
            height={160}
            alt="Softty Office"
            style={{
              borderRadius: '40px',
              boxShadow: '0 20px 60px rgba(37, 99, 235, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)',
            }}
          />
        </div>

        {/* Brand Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '68px',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          <span>Softty</span>
          <span style={{ color: '#06b6d4', marginLeft: '16px' }}>Office</span>
        </div>

        {/* Minimal Sub-tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            fontWeight: 600,
            letterSpacing: '1px',
          }}
        >
          Bộ Ứng Dụng Văn Phòng Thế Hệ Mới
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
