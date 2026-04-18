import FeaturedProducts from "./components/home/FeaturedProducts";
import HeroSection from "./components/home/HeroSection";
import AboutTeaser from "./components/home/AboutTeaser";
import EventTeaser from "./components/home/EventTeaser";
import GalleryTeaser from "./components/home/GalleryTeaser";
import NewsletterBanner from "./components/home/NewsletterBanner";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutTeaser />
      <FeaturedProducts />
      <EventTeaser />
      <GalleryTeaser />
      <NewsletterBanner />
    </main>
  );
}
