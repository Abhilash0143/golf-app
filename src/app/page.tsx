import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import PrizesSection from '@/components/home/PrizesSection'
import CharitySection from '@/components/home/CharitySection'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <PrizesSection />
      <CharitySection />
      <Footer />
    </main>
  )
}
