import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { SimulatorPreview } from "@/components/landing/SimulatorPreview";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <SimulatorPreview />
      <FeatureGrid />
      <SiteFooter />
    </main>
  );
}
