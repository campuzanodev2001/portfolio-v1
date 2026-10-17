import SideNav from "@/components/SideNav";
import TopHeader from "@/components/TopHeader";
import BottomNav from "@/components/BottomNav";
import HeroSection from "@/components/HeroSection";
import BioSection from "@/components/BioSection";
import ProjectsSection from "@/components/ProjectsSection";
import StackSection from "@/components/StackSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <SideNav />
      <TopHeader />
      <main className="lg:ml-72">
        <HeroSection />
        <BioSection />
        <ProjectsSection />
        <StackSection />
        <ContactSection />
        <RevealOnScroll direction="none">
          <Footer />
        </RevealOnScroll>
      </main>
      <BottomNav />
    </div>
  );
}
