import { motion } from 'framer-motion';
import { Github, X, Linkedin, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/logo';

const Footer = () => {
  const links = {
      produk: ['Fitur', 'Harga', 'Demo', 'Integrasi Pembayaran'],
      perusahaan: ['Tentang Kami', 'Blog', 'Karir', 'Kontak'],
      bantuan: ['Pusat Bantuan', 'Panduan', 'Status Layanan', 'Kebijakan Privasi']
  };

  const socialLinks = [
    { icon: X, href: '#', label: 'X (Twitter)' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' }
  ];

  return (
    <footer className="bg-blue-600 text-white relative overflow-hidden">
      <div className="container px-6 mx-auto pt-14 pb-6 border-b border-blue-700/20">
        <div className="flex flex-col lg:flex-row justify-between items-start">
          {/* Logo and description - Left side */}
          <div className="lg:w-1/3 mb-12 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-3">
                <Logo />
              </div>
              <p className="mb-6 max-w-sm text-white/80">
                DWAN POS membantu ribuan bisnis di Indonesia berjualan lebih mudah, cepat, dan aman. Solusi kasir modern untuk semua usaha.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="size-9 border border-white/30 text-white/80 rounded-md flex items-center justify-center hover:text-white hover:border-white transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="size-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 3 Column Menu - Right aligned */}
          <div className="w-full grow lg:w-auto lg:grow-0 lg:w-2/3 flex justify-end">
            <div className="w-full lg:w-auto flex justify-between flex-wrap lg:grid lg:grid-cols-3 gap-8 lg:gap-16">
              {Object.entries(links).map(([category, items], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-medium text-base mb-4 capitalize text-white/80">{category}</h3>
                  <ul className="text-base space-y-2">
                    {items.map((item, index) => (
                      <li key={index}>
                        <a
                          href="#"
                          className="text-white/80 hover:text-white transition-colors hover:underline"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-6 bg-white/20" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            © 2026 DWAN POS. All rights reserved.
          </p>
          <p className="text-white/70 text-sm mt-4 md:mt-0">
            Made with ❤️ in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
