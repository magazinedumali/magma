import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const featuredMovie = {
  title: "Avengers : Endgame",
  description:
    "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face... Avenge the fallen.",
  image:
    "https://static1.srcdn.com/wordpress/wp-content/uploads/2019/04/Avengers-Endgame-Poster-Cropped.jpg",
};

export default function Streaming() {
  return (
    <div className="min-h-screen bg-transparent text-white font-jost">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 glass-panel">
          <div className="relative h-[500px] w-full">
            <img
              src={featuredMovie.image}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent"></div>
          </div>
          
          {/* Overlay content */}
          <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-block bg-[#ff184e] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,24,78,0.5)]">
                Featured Content
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white tracking-tighter leading-none">{featuredMovie.title}</h1>
              <p className="mb-8 text-gray-300 max-w-2xl text-lg leading-relaxed">{featuredMovie.description}</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#ff184e] hover:bg-[#ff184e]/80 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:shadow-[#ff184e]/30 group">
                  <Icon icon="solar:play-bold" className="text-2xl group-hover:scale-110 transition-transform" />
                  <span>Regarder maintenant</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all">
                  <Icon icon="solar:add-circle-bold-duotone" className="text-2xl text-[#ff184e]" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all">
                  <Icon icon="solar:info-circle-bold-duotone" className="text-2xl text-[#ff184e]" />
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Navigation Controls */}
          <div className="absolute right-8 bottom-8 flex gap-3">
             <button className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors backdrop-blur-sm">
               <Icon icon="solar:alt-arrow-left-line-duotone" className="text-2xl" />
             </button>
             <button className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-colors backdrop-blur-sm">
               <Icon icon="solar:alt-arrow-right-line-duotone" className="text-2xl" />
             </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 