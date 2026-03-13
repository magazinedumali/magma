import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function NousContacter() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0, opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    },
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-200 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff184e]/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>
      
      <Header />
      
      <main className="max-w-6xl mx-auto py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-[#ff184e]/30 bg-[#ff184e]/10 text-[#ff184e] text-xs font-bold uppercase tracking-widest">
            {t("Contact")}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
            {t("Parlons de votre")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff184e] to-[#ff5d84] font-extrabold">{t("Projet")}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium">
            {t("Une question ? Un partenariat ? Notre équipe est à votre écoute pour vous accompagner.")}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20"
        >
          {[
            {
              icon: "solar:letter-bold-duotone",
              label: t("Email"),
              value: "magazinedumali@gmail.com",
              sub: "+223 96 40 41 52"
            },
            {
              icon: "solar:map-point-bold-duotone",
              label: t("Adresse"),
              value: "Bamako Coura",
              sub: "Bamako, Mali"
            },
            {
              icon: "solar:phone-calling-bold-duotone",
              label: t("Téléphone"),
              value: "+223 67 72 09 48",
              sub: "+223 73 15 00 47"
            },
            {
              icon: "solar:share-circle-bold-duotone",
              label: t("Social"),
              value: "@magazinedumali",
              sub: "Suivez-nous"
            }
          ].map((info, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              className="flex flex-col items-center text-center p-8 glass-panel border-white/10 rounded-3xl transition-all"
            >
              <div className="w-14 h-14 bg-[#ff184e]/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,24,78,0.15)] group-hover:scale-110 transition-transform">
                <Icon icon={info.icon} className="text-[#ff184e] text-3xl" />
              </div>
              <h2 className="font-bold text-white mb-2">{info.label}</h2>
              <p className="text-gray-300 font-medium text-sm break-all">{info.value}</p>
              <p className="text-gray-500 text-xs mt-1">{info.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="glass-panel border-white/10 rounded-[2.5rem] shadow-2xl p-4 md:p-4 flex flex-col md:flex-row gap-4 items-stretch overflow-hidden min-h-[600px]"
        >
          <div className="md:w-5/12 relative rounded-[2rem] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=1200"
              alt="Contact"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-8 left-8 right-8 p-6 glass-panel border-white/10 rounded-2xl backdrop-blur-xl bg-black/40">
              <h3 className="text-white font-bold text-xl mb-2">{t("Support 24/7")}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {t("Notre équipe technique est disponible pour répondre à toutes vos interrogations.")}
              </p>
            </div>
          </div>

          <form className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center space-y-6" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Nom Complet")}</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff184e]/50 focus:border-[#ff184e] placeholder-gray-600 transition-all" placeholder={t("John Doe")} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Email")}</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff184e]/50 focus:border-[#ff184e] placeholder-gray-600 transition-all" placeholder="john@example.com" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Téléphone")}</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff184e]/50 focus:border-[#ff184e] placeholder-gray-600 transition-all" placeholder="+223 ..." required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Sujet")}</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff184e]/50 focus:border-[#ff184e] placeholder-gray-600 transition-all" placeholder={t("Partenariat, Question...")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Message")}</label>
              <textarea className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#ff184e]/50 focus:border-[#ff184e] placeholder-gray-600 min-h-[150px] transition-all resize-none" placeholder={t("Votre message ici...")} required />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 24, 78, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#ff184e] to-[#ff5d84] text-white font-extrabold py-5 rounded-2xl shadow-xl transition-all text-lg uppercase tracking-widest"
            >
              {t("Envoyer le message")}
            </motion.button>
          </form>
        </motion.div>

        <div className="text-center text-gray-500 text-sm mt-20 py-8 border-t border-white/10 font-medium">
          <p>© {new Date().getFullYear()} Le Magazine du Mali. {t("Tous droits réservés.")}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
 