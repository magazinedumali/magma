import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

export default function Terms() {
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
          {t("Conditions d'utilisation")}
        </h1>
        <div className="glass-panel border-white/10 rounded-2xl p-8 md:p-10 article-body text-gray-300 space-y-6">
          <p className="leading-relaxed">
            {t("En utilisant Le Magazine du Mali, vous acceptez les présentes conditions. Le contenu du site est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite.")}
          </p>
          <p className="leading-relaxed">
            {t("Les commentaires et contributions des utilisateurs doivent respecter les lois en vigueur et l'éthique. Nous nous réservons le droit de modérer ou supprimer tout contenu inapproprié.")}
          </p>
          <p className="leading-relaxed">
            {t("Pour toute question concernant ces conditions, contactez-nous via la page Contact.")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
