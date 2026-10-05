import HeroSlider from '@/components/home/HeroSlider';
import ProductionVideo from '@/components/home/ProductionVideo';
import CategoryGrid from '@/components/home/CategoryGrid';
import Footer from '@/components/layout/Footer';
import StatsSection from '@/components/home/StatsSection';
import TrustBadges from '@/components/home/TrustBadges';
import ContactForm from '@/components/home/ContactForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-white font-body selection:bg-brand-gold selection:text-brand-black">

      {/* Hero Slider */}
      <HeroSlider />

      {/* Production Setup & Quality Video */}
      <ProductionVideo />

      {/* Category Grid */}
      <CategoryGrid />
      {/* Stats Counter Section */}
      <StatsSection />

      {/* Trust Badges Bar */}
      <TrustBadges />

      {/* Contact Form Section */}
      <ContactForm />

      <Footer />
    </div>
  );
}
