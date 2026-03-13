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
    <footer className="relative bg-[#0B0F19] border-t border-white/10 text-white pt-16 pb-8 overflow-hidden z-20">
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#ff184e] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,24,78,0.5)]">
                <span className="font-bold text-xl text-white">M</span>
              </div>
              <h3 className="text-2xl font-bold">MagezNews</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {t('Le Magazine du Mali vous propose les dernières actualités, météo, économie, divertissement, politique, et plus encore. Restez informé avec des informations fiables et de qualité.')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#ff184e] transition-all hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#ff184e] transition-all hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#ff184e] transition-all hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#ff184e] transition-all hover:shadow-[0_0_10px_rgba(255,24,78,0.5)]">
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
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-3 inline-block relative">
              {t('Liens rapides')}
              <div className="absolute -bottom-[1px] left-0 w-1/2 h-[2px] bg-[#ff184e]"></div>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-[#ff184e] transition-colors"></span>
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
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-3 inline-block relative">
              {t('Catégories')}
              <div className="absolute -bottom-[1px] left-0 w-1/2 h-[2px] bg-[#ff184e]"></div>
            </h3>
            {loading ? (
              <p className="text-sm text-gray-500">{t('Chargement des catégories...')}</p>
            ) : categories && categories.length > 0 ? (
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-400 font-medium">
                {categories.slice(0, 8).map((category) => (
                  <li key={category.id}>
                    <Link to={category.path} className="hover:text-[#ff184e] transition-colors flex items-center group">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-[#ff184e] transition-colors"></span>
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
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-3 inline-block relative">
              {t('Contact')}
              <div className="absolute -bottom-[1px] left-0 w-1/2 h-[2px] bg-[#ff184e]"></div>
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
                <a href="mailto:magazinedumali@gmail.com" className="hover:text-white transition-colors">magazinedumali@gmail.com</a>
              </li>
            </ul>
            
            <div className="mt-6 flex">
              <input 
                type="email" 
                placeholder={t('Votre adresse e-mail')} 
                className="py-2 px-4 rounded-l-lg text-sm w-full bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e]"
              />
              <button className="bg-[#ff184e] hover:bg-[#ff184e]/80 transition-colors text-white py-2 px-4 rounded-r-lg text-sm font-bold shadow-[0_0_10px_rgba(255,24,78,0.3)]">
                {t('Go')}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} MagezNews. {t('Tous droits réservés.')}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
