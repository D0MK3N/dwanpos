import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

export default function SectionSatset() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        {/* Left: Image */}
        <div className="flex-1 flex justify-center">
          <Image
            src="/images/pos-satset-mockup.png"
            alt="DWAN POS Sat-set"
            width={400}
            height={350}
            className="rounded-2xl shadow-xl border-2 border-blue-100"
            style={{objectFit: 'contain'}}
          />
        </div>
        {/* Right: Content */}
        <div className="flex-1">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white"
          >
            Pantau Usaha dengan Sat-set!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-zinc-600 dark:text-zinc-300 mb-6"
          >
            Bisnis yang menggunakan DWAN POS 70% lebih sehat secara operasional dan finansial.
          </motion.p>
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <span className="mt-1"><CheckCircle className="text-blue-500" size={22} /></span>
              <span className="text-zinc-700 dark:text-zinc-200 text-base">Kelola pesanan dine-in, takeaway, atau online? Semua bisa.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><CheckCircle className="text-purple-500" size={22} /></span>
              <span className="text-zinc-700 dark:text-zinc-200 text-base">Mudahnya atur operasional bisnis langsung dari dashboard.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1"><CheckCircle className="text-cyan-500" size={22} /></span>
              <span className="text-zinc-700 dark:text-zinc-200 text-base">Dapatkan insight dari data penjualan secara real-time.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
