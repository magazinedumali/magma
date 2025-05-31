import React from "react";
import Header from "@/components/Header";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";

export default function NousContacter() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-12 text-center">Contactez-nous</h1>
        {/* Section infos de contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {/* Mail address */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow">
            <Mail size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1">Adresse mail</h2>
            <p className="text-gray-700 text-sm">magazinedumali@gmail.com</p>
            <p className="text-gray-700 text-sm">+223 96 40 41 52</p>
          </div>
          {/* Office Location */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow">
            <MapPin size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1">Adresse du bureau</h2>
            <p className="text-gray-700 text-sm">Bamako Coura, Bamako/Mali</p>
          </div>
          {/* Phone Number */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow border-2 border-[#ff184e]">
            <Phone size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1">Numéros de téléphone</h2>
            <p className="text-gray-700 text-sm">+223 67 72 09 48</p>
            <p className="text-gray-700 text-sm">+223 73 15 00 47</p>
          </div>
          {/* Connect Us */}
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow">
            <Instagram size={40} className="text-[#ff184e] mb-3" />
            <h2 className="font-bold text-lg mb-1">Nous contacter</h2>
            <p className="text-gray-700 text-sm">magazinedumali@gmail.com</p>
            <p className="text-gray-700 text-sm">contact@lemagazinedumali.com</p>
          </div>
        </div>
        {/* Nouveau formulaire de contact style "side image" */}
        <div className="bg-white rounded-xl shadow p-0 md:p-8 flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
          {/* Image à gauche */}
          <div className="relative md:w-1/2 w-full min-h-[350px] flex items-center justify-center overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
            <img
              src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=600&h=600&q=80"
              alt="Contact side"
              className="object-cover w-full h-full min-h-[350px]"
            />
            {/* Carte utilisateur en overlay */}
            <div className="absolute top-6 left-6 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center w-32">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="User"
                className="w-12 h-12 rounded-full mb-2 border-2 border-[#ff184e]"
              />
              <div className="h-3 w-16 bg-pink-100 rounded mb-1" />
              <div className="h-3 w-12 bg-pink-100 rounded" />
            </div>
          </div>
          {/* Formulaire à droite */}
          <form className="md:w-1/2 w-full p-6 md:p-8 flex flex-col justify-center" autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" className="border rounded px-3 py-2" placeholder="Votre nom*" required />
              <input type="email" className="border rounded px-3 py-2" placeholder="Votre email*" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" className="border rounded px-3 py-2" placeholder="Votre numéro*" required />
              <input type="text" className="border rounded px-3 py-2" placeholder="Lien du site web" />
            </div>
            <div className="mb-4">
              <textarea className="border rounded px-3 py-2 w-full min-h-[120px]" placeholder="Votre message*" required />
            </div>
            <div className="flex items-center mb-6">
              <input type="checkbox" id="saveinfo" className="mr-2" />
              <label htmlFor="saveinfo" className="text-gray-700 text-sm">Enregistrer mon nom, email et site web dans ce navigateur pour la prochaine fois.</label>
            </div>
            <button type="submit" className="bg-[#ff184e] text-white font-bold py-2 px-8 rounded hover:bg-[#e6003a] transition mx-auto block text-lg">
              Envoyer le message
            </button>
          </form>
        </div>
        <div className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} Magezix. Tous droits réservés.
        </div>
      </div>
    </div>
  );
} 