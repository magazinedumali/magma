import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const categories = [
    { name: t('Monde'), path: '/category/world' },
    { name: t('Politique'), path: '/category/politics' },
    { name: t('Économie'), path: '/category/business' },
    { name: t('Technologie'), path: '/category/technology' },
    { name: t('Science'), path: '/category/science' },
    { name: t('Santé'), path: '/category/health' },
    { name: t('Sport'), path: '/category/sports' },
    { name: t('Divertissement'), path: '/category/entertainment' }
  ];

  return (
    <footer className="bg-news-dark text-white py-12">
      <div className="container mx-auto px-4">
        {/* Footer top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Us */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('À propos')}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('Le Magazine du Mali vous propose les dernières actualités, météo, économie, divertissement, politique, et plus encore.')}
            </p>
            <Link to="/about" className="text-news-red hover:underline text-sm">
              {t('Lire la suite')}
            </Link>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Catégories')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {categories.slice(0, 6).map((category) => (
                <li key={category.name}>
                  <Link to={category.path} className="hover:text-news-red transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Liens rapides')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-news-red transition-colors">{t('À propos')}</Link></li>
              <li><Link to="/contact" className="hover:text-news-red transition-colors">{t('Contact')}</Link></li>
              <li><Link to="/terms" className="hover:text-news-red transition-colors">{t('Conditions d\'utilisation')}</Link></li>
              <li><Link to="/privacy" className="hover:text-news-red transition-colors">{t('Politique de confidentialité')}</Link></li>
              <li><Link to="/advertise" className="hover:text-news-red transition-colors">{t('Publicité')}</Link></li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('Newsletter')}</h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('Abonnez-vous à notre newsletter pour recevoir les dernières actualités et mises à jour.')}
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder={t('Votre adresse e-mail')} 
                className="py-2 px-4 rounded-l text-sm w-full text-black focus:outline-none focus:ring-1 focus:ring-news-red"
              />
              <button className="bg-news-red hover:bg-red-700 transition-colors text-white py-2 px-4 rounded-r text-sm font-medium">
                {t('S\'abonner')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MagezNews. {t('All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
