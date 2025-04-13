import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundPaths } from '../components/ui/background-paths';
import Features from '../components/Features';
import Process from '../components/Process';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import AboutUs from '../components/AboutUs';
import PlatformPreview from '../components/PlatformPreview';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { FloatingNav } from '../components/ui/floating-navbar';
import { Building2, Users, BookOpen, PiggyBank, HelpCircle, Info, Monitor } from 'lucide-react';

function LandingPage() {
  const navItems = [
    {
      name: "O nas",
      link: "#about",
      icon: <Info className="h-4 w-4 text-gray-400" />,
    },
    {
      name: "Oferta",
      link: "#features",
      icon: <BookOpen className="h-4 w-4 text-gray-400" />,
    },
    {
      name: "Platforma",
      link: "#platform-preview",
      icon: <Monitor className="h-4 w-4 text-gray-400" />,
    },
    {
      name: "Proces",
      link: "#process",
      icon: <Users className="h-4 w-4 text-gray-400" />,
    },
    {
      name: "Cennik",
      link: "#pricing",
      icon: <PiggyBank className="h-4 w-4 text-gray-400" />,
    },
    {
      name: "FAQ",
      link: "#faq",
      icon: <HelpCircle className="h-4 w-4 text-gray-400" />,
    },
  ];

  // Function to handle smooth scrolling
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 100; // Offset to account for fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Add click handlers to all hash links
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', scrollToSection as any);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', scrollToSection as any);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative landing-page">
      <FloatingNav navItems={navItems} />
      <BackgroundPaths 
        title="The Estate Academy"
        subtitle="Twój klucz do sukcesu w nieruchomościach"
        buttonText="Dołącz do The Estate Academy"
        buttonLink="#pricing"
      />
      <AboutUs />
      <Features />
      <PlatformPreview />
      <Process />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

export default LandingPage