import React from "react";
import Header from "@/components/Header";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";

export default function NousContacter() {
  return (
    <div className="min-h-screen bg-transparent text-gray-200">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      <Header />
      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        <h1 className="text-4xl font-jost font-bold mb-12 text-center text-white">Contactez-nous</h1>
        {/* Section infos de contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {/* Mail address */}
          <div className="flex flex-col items-center text-center p-6 glass-panel border-white/10 rounded-xl shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <Mail size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1 text-white">Adresse mail</h2>
            <p className="text-gray-400 text-sm">magazinedumali@gmail.com</p>
            <p className="text-gray-400 text-sm">+223 96 40 41 52</p>
          </div>
          {/* Office Location */}
          <div className="flex flex-col items-center text-center p-6 glass-panel border-white/10 rounded-xl shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <MapPin size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1 text-white">Adresse du bureau</h2>
            <p className="text-gray-400 text-sm">Bamako Coura, Bamako/Mali</p>
          </div>
          {/* Phone Number */}
          <div className="flex flex-col items-center text-center p-6 glass-panel border-[#ff184e]/50 rounded-xl shadow-xl shadow-[#ff184e]/10 transition-transform hover:-translate-y-2 duration-300">
            <Phone size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1 text-white">Numéros de téléphone</h2>
            <p className="text-gray-400 text-sm">+223 67 72 09 48</p>
            <p className="text-gray-400 text-sm">+223 73 15 00 47</p>
          </div>
          {/* Connect Us */}
          <div className="flex flex-col items-center text-center p-6 glass-panel border-white/10 rounded-xl shadow-xl transition-transform hover:-translate-y-2 duration-300">
            <Instagram size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1 text-white">Nous contacter</h2>
            <p className="text-gray-400 text-sm">magazinedumali@gmail.com</p>
            <p className="text-gray-400 text-sm">contact@lemagazinedumali.com</p>
          </div>
        </div>
        {/* Nouveau formulaire de contact style "side image" */}
        <div className="glass-panel border-white/10 rounded-2xl shadow-2xl p-0 md:p-8 flex flex-col md:flex-row gap-0 md:gap-8 items-stretch overflow-hidden">
          {/* Image à gauche */}
          <div className="relative md:w-1/2 w-full min-h-[350px] flex items-center justify-center overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
            <img
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=600&h=600&q=80"
              alt="Contact side"
              className="object-cover w-full h-full min-h-[350px]"
            />
            {/* Carte utilisateur en overlay */}
            <div className="absolute top-6 left-6 glass-panel border-white/10 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] p-4 flex flex-col items-center w-32 backdrop-blur-md bg-black/60">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
                className="w-12 h-12 rounded-full mb-2 border-2 border-[#ff184e] shadow-[0_0_10px_rgba(255,24,78,0.5)]"
              />
              <div className="h-3 w-16 bg-white/20 rounded mb-2" />
              <div className="h-3 w-12 bg-[#ff184e]/40 rounded" />
            </div>
          </div>
          {/* Formulaire à droite */}
          <form className="md:w-1/2 w-full p-6 md:p-8 flex flex-col justify-center relative z-10" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <input type="text" className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm" placeholder="Votre nom*" required />
              <input type="email" className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm" placeholder="Votre email*" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <input type="text" className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm" placeholder="Votre numéro*" required />
              <input type="text" className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm" placeholder="Lien du site web" />
            </div>
            <div className="mb-5">
              <textarea className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 w-full min-h-[140px] transition-all text-sm resize-none" placeholder="Votre message*" required />
            </div>
            <div className="flex items-center mb-8">
              <input type="checkbox" id="saveinfo" className="mr-3 accent-[#ff184e] w-4 h-4 rounded" />
              <label htmlFor="saveinfo" className="text-gray-400 text-sm cursor-pointer hover:text-gray-300 transition-colors">Enregistrer mon nom, email et site web dans ce navigateur pour la prochaine fois.</label>
            </div>
            <button type="submit" className="bg-[#ff184e] text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(255,24,78,0.4)] hover:shadow-[0_0_25px_rgba(255,24,78,0.6)] hover:bg-[#ff184e]/90 transition-all mx-auto block text-base w-full md:w-auto min-w-[200px]">
              Envoyer le message
            </button>
          </form>
        </div>
        <div className="text-center text-gray-500 text-sm mt-12 py-6 border-t border-white/10">
          © {new Date().getFullYear()} Magezix. Tous droits réservés.
        </div>
      </div>
    </div>
  );
} 