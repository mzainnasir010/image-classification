import { Hero } from '../components/landing/Hero';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ClassGrid } from '../components/landing/ClassGrid';
import { ModelSnapshot } from '../components/landing/ModelSnapshot';
import { Limitations } from '../components/landing/Limitations';
import { Faq } from '../components/landing/Faq';
import { CtaBand } from '../components/landing/CtaBand';

export function LandingPage() {
  return (
    <>
      {/* Dividers between sections use top border on ModelSnapshot and border-y on Faq */}
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <ClassGrid />
      <ModelSnapshot />
      <Limitations />
      <Faq />
      <CtaBand />
    </>
  );
}
