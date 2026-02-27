
import { motion } from 'framer-motion';
import Marquee from "@/components/ui/marquee";
import { CustomBadge } from '@/components/custom/badge';
import { CustomTitle } from '@/components/custom/title';
import { CustomSubtitle } from '@/components/custom/subtitle';
import Image from 'next/image';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Budi Santoso',
      role: 'Pemilik Warung Sederhana',
      content: 'Penjualan lebih cepat, laporan langsung otomatis! Saya bisa pantau omzet harian tanpa ribet.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Siti Aminah',
      role: 'Owner Laundry Express',
      content: 'Stok selalu terpantau, tidak pernah kehabisan barang. DWAN POS sangat membantu bisnis laundry saya.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Andi Wijaya',
      role: 'Pemilik Kedai Kopi',
      content: 'Transaksi kasir jadi super cepat, pelanggan tidak perlu antri lama. Sangat recommended!',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      name: 'Maria Ulfa',
      role: 'Toko Sembako Makmur',
      content: 'Laporan keuangan otomatis, bisa diakses dari HP kapan saja. Support DWAN POS juga responsif.',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      name: 'Rizal Pratama',
      role: 'Owner Martabak 88',
      content: 'Fitur promo & diskon sangat membantu menarik pelanggan baru. Training gratisnya juga jelas!',
      avatar: 'https://randomuser.me/api/portraits/men/77.jpg'
    },
    {
      name: 'Linda Hartati',
      role: 'Pemilik Toko Buku',
      content: 'Integrasi pembayaran digital bikin transaksi makin praktis. Tidak perlu repot rekap manual.',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      name: 'Dewi Lestari',
      role: 'Cafe Kopi Kita',
      content: 'Aplikasi mudah digunakan, laporan lengkap, dan tim support selalu siap membantu.',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    {
      name: 'Hendra Gunawan',
      role: 'Owner Resto Padang',
      content: 'DWAN POS bikin manajemen cabang jadi gampang. Semua outlet bisa dipantau dari satu dashboard.',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg'
    },
    {
      name: 'Yuni Safitri',
      role: 'Pemilik Toko Kue',
      content: 'Fitur stok otomatis dan laporan harian sangat membantu. Tidak pernah kehabisan bahan baku.',
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
    },
    {
      name: 'Agus Salim',
      role: 'Owner Minimarket',
      content: 'DWAN POS solusi terbaik untuk bisnis retail. Semua data aman dan bisa diakses kapan saja.',
      avatar: 'https://randomuser.me/api/portraits/men/99.jpg'
    }
  ];

  const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
    <div className="flex-shrink-0 w-[350px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/15 dark:to-indigo-900/15 rounded-xl p-6 border border-border/50 shadow-sm mx-1.5">
      <p className="text-muted-foreground mb-4 font-medium">{testimonial.content}</p>
      <div className="flex items-center gap-3">
        <Image 
          src={testimonial.avatar} 
          alt={testimonial.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <div className="font-semibold text-foreground">{testimonial.name}</div>
          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );

  const firstColumn = testimonials.slice(0, 5);
  const secondColumn = testimonials.slice(5, 10);

  return (
    <section className="py-24 bg-background overflow-hidden border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12 mb-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }} className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge>
            Testimoni Pengguna
          </CustomBadge>

          <CustomTitle>
            Dipercaya Ribuan Pebisnis di Indonesia
          </CustomTitle>
          
          <CustomSubtitle>
            DWAN POS sudah membantu berbagai usaha dari warung, cafe, laundry, hingga retail modern. Yuk, gabung dan rasakan manfaatnya!
          </CustomSubtitle>
        </motion.div>
      </div>

      <div className="w-full mx-auto px-6">
        <motion.div 
          className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-1.5 mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
         >
          <Marquee pauseOnHover className="[--duration:40s] grow">
            {firstColumn.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s] grow">
            {secondColumn.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 start-0 w-1/12 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 end-0 w-1/12 bg-gradient-to-l from-background"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
