import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff184e]/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>
      <Header />
      <main className="max-w-4xl mx-auto py-16 px-4 relative z-10 font-syne">
        <h1 className="text-4xl font-bold text-white mb-8">
          {t("Politique de confidentialité")}
        </h1>
        <div className="glass-panel border-white/10 rounded-2xl p-8 md:p-10 article-body text-gray-300 space-y-6">
          <p className="leading-relaxed">
            {t("Le Magazine du Mali s'engage à protéger la vie privée de ses utilisateurs. Les données collectées (email, nom lorsque vous commentez ou vous abonnez) sont utilisées uniquement pour le fonctionnement du service et ne sont pas vendues à des tiers.")}
          </p>
          <p className="leading-relaxed">
            {t("Nous utilisons des cookies pour améliorer l'expérience de navigation et les statistiques de lecture. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur.")}
          </p>
          <p className="leading-relaxed">
            {t("Pour exercer vos droits d'accès, de rectification ou de suppression de vos données, contactez-nous via la page Contact.")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
