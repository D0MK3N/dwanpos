import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CustomBadge } from '@/components/custom/badge';
import { CustomTitle } from '@/components/custom/title';
import { CustomSubtitle } from '@/components/custom/subtitle';
import { ShoppingCart, BarChart3, Users, CreditCard, Store, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const Features = () => {
  const features = [
    {
      id: 'fast-sales',
      icon: ShoppingCart,
      title: 'Penjualan Cepat & Mudah',
      description: 'Transaksi kasir super cepat, antrian lebih singkat, dan proses pembayaran yang praktis untuk semua jenis usaha.',
      stats: '5 detik',
      metric: 'Rata-rata Transaksi',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    },
    {
      id: 'auto-report',
      icon: BarChart3,
      title: 'Laporan Otomatis',
      description: 'Dapatkan laporan penjualan, stok, dan keuangan secara otomatis, real-time, dan bisa diakses kapan saja.',
      stats: 'Realtime',
      metric: 'Update Data',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    },
    {
      id: 'multi-outlet',
      icon: Store,
      title: 'Multi Outlet & Multi User',
      description: 'Kelola banyak cabang dan karyawan dalam satu dashboard. Hak akses bisa diatur sesuai kebutuhan.',
      stats: 'Tak Terbatas',
      metric: 'Outlet & User',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    },
    {
      id: 'payment-integration',
      icon: CreditCard,
      title: 'Integrasi Pembayaran Digital',
      description: 'Terima pembayaran tunai, QRIS, debit, e-wallet, dan kartu kredit langsung dari aplikasi kasir.',
      stats: '6+ metode',
      metric: 'Pembayaran',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    },
    {
      id: 'secure-data',
      icon: Shield,
      title: 'Keamanan Data Terjamin',
      description: 'Data usaha Anda terenkripsi dan tersimpan aman di cloud, dengan backup otomatis setiap hari.',
      stats: '100%',
      metric: 'Aman & Backup',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    },
    {
      id: 'support',
      icon: Users,
      title: 'Support & Training 24/7',
      description: 'Tim support siap membantu Anda kapan saja, plus training gratis untuk semua pengguna baru.',
      stats: '24/7',
      metric: 'Support',
      colors: {
        bg: 'bg-blue-600/10',
        icon: 'text-blue-600',
        hover: 'hover:border-blue-500',
        shadow: 'group-hover:shadow-blue-500/30',
        gradient: 'from-blue-500 to-cyan-500',
        text: 'group-hover:text-blue-700'
      }
    }
  ];

  return (
    <section id="features" className="py-24 bg-white border-b border-blue-100">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }} className="flex items-center justify-center flex-col text-center gap-5 mb-16">
          <CustomBadge className="bg-blue-100 text-blue-700 border-blue-200">
            Fitur Unggulan DWAN POS
          </CustomBadge>

          <CustomTitle className="text-blue-900">
            Semua Fitur Kasir Modern Dalam Satu Aplikasi
          </CustomTitle>
          
          <CustomSubtitle className="text-blue-700">
            DWAN POS membantu bisnis Anda berjualan, mengelola stok, dan memantau laporan keuangan secara otomatis, mudah, dan aman.
          </CustomSubtitle>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group"
            >
              <Card className={cn('h-full bg-white border border-blue-100 transition-all duration-500 p-7 flex flex-col justify-between relative overflow-hidden hover:shadow-2xl', feature.colors.hover)}>
                <CardContent className="p-0 flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      'size-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 bg-blue-100', 
                      feature.colors.bg
                      )}
                    >
                      <feature.icon className={cn('size-6 text-blue-600')} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-900 mb-1">{feature.stats}</div>
                      <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">{feature.metric}</div>
                    </div>
                  </div>
                  {/* Content */}
                  <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-blue-700 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Hover effect gradient border */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/20 transition-all duration-500 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
