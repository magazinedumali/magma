import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function About() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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

      <main className="max-w-5xl mx-auto py-16 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-[#ff184e]/30 bg-[#ff184e]/10 text-[#ff184e] text-xs font-bold uppercase tracking-widest">
            {t("Notre Histoire")}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
            {t("À propos du")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff184e] to-[#ff5d84] font-extrabold">Magazine du Mali</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-medium">
            {t("L'excellence de l'information malienne au service de la vérité et du progrès.")}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12 mb-20"
        >
          <motion.div variants={itemVariants} className="glass-panel border-white/10 rounded-[2rem] shadow-2xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff184e]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-[#ff184e]/10" />

            <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ff184e] to-blue-600 rounded-2xl blur-2xl opacity-20" />
                  <div className="aspect-square bg-gradient-to-br from-[#1a1f2e] to-[#0B0F19] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl relative p-6">
                    <img
                      src="/logo.png"
                      alt="Le Magazine du Mali"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <h2 className="text-3xl font-bold text-white mb-2">{t("Qui sommes-nous ?")}</h2>
                <div className="article-body text-gray-300 space-y-4">
                  <p className="text-lg leading-relaxed">
                    {t("Le Magazine du Mali est une plateforme d'information moderne dédiée à la couverture exhaustive de l'actualité malienne et internationale. Fondée sur des principes de rigueur et d'impartialité, notre mission est de fournir un éclairage pertinent sur les enjeux majeurs du pays.")}
                  </p>
                  <p className="text-lg leading-relaxed">
                    {t("Nous croyons en un journalisme de proximité, capable de raconter le Mali dans toute sa diversité, de l'économie à la culture, en passant par la politique et le sport.")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "solar:crown-bold-duotone",
                title: t("Qualité"),
                desc: t("Une information vérifiée et sourcée pour garantir la plus haute fiabilité.")
              },
              {
                icon: "solar:shield-check-bold-duotone",
                title: t("Indépendance"),
                desc: t("Une liberté éditoriale totale pour une information sans compromis.")
              },
              {
                icon: "solar:fire-bold-duotone",
                title: t("Direct"),
                desc: t("L'actualité en temps réel pour ne rien manquer des moments forts.")
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="glass-panel border-white/10 rounded-2xl p-8 flex flex-col items-center text-center group transition-all"
              >
                <div className="w-16 h-16 bg-[#ff184e]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#ff184e]/20 transition-colors shadow-[0_0_20px_rgba(255,24,78,0.1)]">
                  <Icon icon={feature.icon} className="text-[#ff184e] text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{t("Notre Vision")}</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              {t("Nous aspirons à devenir le média de référence au Mali en innovant constamment dans notre manière de traiter l'information et d'interagir avec notre communauté.")}
            </p>
            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 items-center">
              <div className="p-3 bg-[#ff184e] rounded-lg">
                <Icon icon="solar:global-bold-duotone" className="text-white text-2xl" />
              </div>
              <p className="text-sm font-semibold text-gray-200">
                {t("Une audience mondiale connectée au cœur du Mali.")}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">{t("Rejoignez-nous")}</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              {t("Suivez notre aventure sur les réseaux sociaux et participez au débat public pour construire ensemble le Mali de demain.")}
            </p>
            <div className="flex gap-4">
              {["solar:share-circle-bold", "solar:letter-bold", "solar:phone-calling-bold"].map((icon, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full glass-panel border-white/10 flex items-center justify-center text-gray-300 hover:text-[#ff184e] transition-colors"
                >
                  <Icon icon={icon} className="text-xl" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="text-center text-gray-500 text-sm py-8 border-t border-white/10">
          <p>© {new Date().getFullYear()} Le Magazine du Mali. {t("Tous droits réservés.")}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

