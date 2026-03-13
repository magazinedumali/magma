import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

export default function Advertise() {
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
          {t("Publicité")}
        </h1>
        <div className="glass-panel border-white/10 rounded-2xl p-8 md:p-10 article-body text-gray-300 space-y-6">
          <p className="leading-relaxed">
            {t("Vous souhaitez promouvoir votre marque ou votre activité auprès de notre audience ? Le Magazine du Mali propose des espaces publicitaires et des partenariats adaptés à vos objectifs.")}
          </p>
          <p className="leading-relaxed">
            {t("Contactez notre équipe commerciale pour recevoir notre offre et nos tarifs : magazinedumali@gmail.com ou via la page Contact.")}
          </p>
          <div className="flex items-center gap-3 mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <Icon icon="solar:letter-bold-duotone" className="text-[#ff184e] text-2xl shrink-0" />
            <a href="mailto:magazinedumali@gmail.com" className="text-[#ff184e] hover:text-[#ff5d84] font-semibold transition-colors">
              magazinedumali@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
