import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { ShowcaseSection } from '@/components/ShowcaseSection'
import { SofttyDropSection } from '@/components/SofttyDropSection'
import { ScannerSection } from '@/components/ScannerSection'
import { ComparisonSection } from '@/components/ComparisonSection'
import { PrivacySecurity } from '@/components/PrivacySecurity'
import { FaqSection } from '@/components/FaqSection'
import { DownloadSection } from '@/components/DownloadSection'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-200">
      <Navbar />
      <Hero />
      <ShowcaseSection />
      <SofttyDropSection />
      <ScannerSection />
      <ComparisonSection />
      <PrivacySecurity />
      <FaqSection />
      <DownloadSection />
      <Footer />
      <ScrollToTop />
    </main>
  )
}
