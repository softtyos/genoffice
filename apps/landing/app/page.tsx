import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { ShowcaseSection } from '@/components/ShowcaseSection'
import { SofttyDropSection } from '@/components/SofttyDropSection'
import { ScannerSection } from '@/components/ScannerSection'
import { PrivacySecurity } from '@/components/PrivacySecurity'
import { DownloadSection } from '@/components/DownloadSection'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0e1322]">
      <Navbar />
      <Hero />
      <ShowcaseSection />
      <SofttyDropSection />
      <ScannerSection />
      <PrivacySecurity />
      <DownloadSection />
      <Footer />
    </main>
  )
}
