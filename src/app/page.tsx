import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ValueProps } from "@/components/landing/value-props";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { Audiences } from "@/components/landing/audiences";
import { DesignPartner } from "@/components/landing/design-partner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <HowItWorks />
        <Stats />
        <Audiences />
        <DesignPartner />
      </main>
      <Footer />
    </>
  );
}
