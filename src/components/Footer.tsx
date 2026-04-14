import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

const Footer = () => {
  const { t } = useTranslation();
  const { categories, loading } = useCategories();

  return (
    <footer className="relative z-20 overflow-hidden border-t border-white/10 bg-[#0B0F19] pb-8 pt-16 text-[#ffffff]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff184e]/50 to-transparent"></div>
      
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About Us */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="group mb-6 flex items-center gap-2 sm:gap-2.5">
              <img
                src="/logo.png"
                alt="Le Magazine du Mali"
                className="h-8 w-auto shrink-0 object-contain drop-shadow-[0_0_12px_rgba(255,24,78,0.35)] sm:h-9"
              />
              <span
                className="text-[0.9375rem] font-semibold leading-snug tracking-tight text-[#ffffff] whitespace-nowrap sm:text-base group-hover:text-[#ffffff]/90"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
              >
                Le Magazine du Mali
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Le Magazine du Mali vous propose les dernières actualités, météo, économie, divertissement, politique, et plus encore. Restez informé avec des informations fiables et de qualité.')}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#ff184e] hover:text-[#ffffff] hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#ff184e] hover:text-[#ffffff] hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]"
              >
                <Twitter size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#ff184e] hover:text-[#ffffff] hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#ff184e] hover:text-[#ffffff] hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]"
              >
                <Youtube size={16} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="relative mb-6 inline-block border-b border-white/10 pb-3 text-xl font-bold text-[#ffffff]">
              {t('Liens rapides')}
              <div className="absolute -bottom-[1px] left-0 h-[2px] w-1/2 bg-[#ff184e]" />
            </h3>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              {[
                { label: 'À propos', path: '/about' },
                { label: 'Contact', path: '/nouscontacter' },
                { label: "Conditions d'utilisation", path: '/terms' },
                { label: 'Politique de confidentialité', path: '/privacy' },
                { label: 'Publicité', path: '/advertise' }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-[#ff184e] transition-colors flex items-center group">
                    <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffffff] transition-colors group-hover:bg-[#ff184e]" />
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="relative mb-6 inline-block border-b border-white/10 pb-3 text-xl font-bold text-[#ffffff]">
              {t('Catégories')}
              <div className="absolute -bottom-[1px] left-0 h-[2px] w-1/2 bg-[#ff184e]" />
            </h3>
            {loading ? (
              <p className="text-sm text-gray-500">{t('Chargement des catégories...')}</p>
            ) : categories && categories.length > 0 ? (
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-400 font-medium">
                {categories.slice(0, 8).map((category) => (
                  <li key={category.id}>
                    <Link to={category.path} className="hover:text-[#ff184e] transition-colors flex items-center group">
                      <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffffff] transition-colors group-hover:bg-[#ff184e]" />
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{t('Aucune catégorie disponible pour le moment.')}</p>
            )}
          </motion.div>

          {/* Contact INFO */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="relative mb-6 inline-block border-b border-white/10 pb-3 text-xl font-bold text-[#ffffff]">
              {t('Contact')}
              <div className="absolute -bottom-[1px] left-0 h-[2px] w-1/2 bg-[#ff184e]" />
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="text-[#ff184e] mr-3 mt-0.5 shrink-0" size={18} />
                <span>Bamako Coura, Bamako/Mali<br/>Aci 2000 Immeuble AB</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-[#ff184e] mr-3 shrink-0" size={18} />
                <span>+223 96 40 41 52 / 67 72 09 48</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-[#ff184e] mr-3 shrink-0" size={18} />
                <a href="mailto:magazinedumali@gmail.com" className="transition-colors hover:text-[#ffffff]">
                  magazinedumali@gmail.com
                </a>
              </li>
            </ul>
            
            <div className="mt-6 flex">
              <input 
                type="email" 
                placeholder={t('Votre adresse e-mail')} 
                className="w-full rounded-l-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#ffffff] focus:border-[#ff184e] focus:outline-none focus:ring-1 focus:ring-[#ff184e]"
              />
              <button className="rounded-r-lg bg-[#ff184e] px-4 py-2 text-sm font-bold text-[#ffffff] shadow-[0_0_10px_rgba(255,24,78,0.3)] transition-colors hover:bg-[#ff184e]/80">
                {t('Go')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Le Magazine du Mali. {t('Tous droits réservés.')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="transition-colors hover:text-[#ffffff]">
              Politique de confidentialité
            </Link>
            <Link to="/terms" className="transition-colors hover:text-[#ffffff]">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
