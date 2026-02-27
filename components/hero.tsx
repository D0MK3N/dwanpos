import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Rocket, Shield, Zap, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { WordRotate } from '@/components/magicui/word-rotate';


import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { AnimatedTooltip } from './ui/animated-tooltip';

// Helper: generate avatar fallback (initials with color)
function getAvatarFallback(name: string, id: number) {
  const colors = ["#F59E42", "#4F46E5", "#10B981", "#F43F5E", "#6366F1"];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  const color = colors[(id-1) % colors.length];
  return (
    <div style={{background: color, color: '#fff', width: 48, height: 48, borderRadius: '50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20}}>
      {initials}
    </div>
  );
}

const Hero = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Rotating POS features for DWAN POS

  const rotatingWords = [
    "Kasir Cepat",
    "Stok Otomatis",
    "Laporan Instan",
    "Multi Cabang",
    "QRIS & E-Wallet",
    "Struk Digital",
    "Integrasi Marketplace"
  ];

  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center bg-blue-600 overflow-hidden"
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating Tech Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-6 bg-blue-500/20 rounded-lg rotate-45" />
      </motion.div>
      <motion.div
        className="absolute bottom-1/3 right-1/3"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-4 h-4 bg-cyan-400/20 rounded-full" />
      </motion.div>

      <div className="container mx-auto px-6 py-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-10 lg:gap-0 relative z-10">
        {/* Left: Headline & CTA */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight"
          >
            Satu Aplikasi POS<br />untuk Semua Kebutuhan Bisnis
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/90 text-lg md:text-xl mb-8 font-light"
          >
            Kelola penjualan, stok, dan laporan keuangan lebih mudah & cepat. Solusi kasir modern untuk semua jenis usaha.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button size="lg" className="rounded-full bg-white text-blue-700 font-bold px-8 py-4 shadow-lg hover:bg-blue-100 transition">
              Jadwalkan Demo
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white font-bold px-8 py-4 hover:bg-white/10 transition">
              WhatsApp Kami Sekarang!
            </Button>
          </div>
        </div>
        {/* Right: POS Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src="/images/pos-hero-mockup.png"
            alt="DWAN POS Mockup"
            className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-white/30 bg-white/10"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent" />
    </section>
  );
};

export default Hero;