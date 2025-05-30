import React from "react";
import { Link } from "react-router-dom";

const featuredMovie = {
  title: "Avengers : Endgame",
  description:
    "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face... Avenge the fallen.",
  image:
    "https://static1.srcdn.com/wordpress/wp-content/uploads/2019/04/Avengers-Endgame-Poster-Cropped.jpg",
};

export default function Streaming() {
  return (
    <div className="min-h-screen bg-[#18181b] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="StreamVibe" className="h-10" />
          <span className="text-2xl font-bold text-white">StreamVibe</span>
        </div>
        <nav className="flex gap-2 bg-[#232329] rounded-xl px-4 py-2">
          <Link to="/" className="px-4 py-2 rounded text-gray-300 hover:bg-[#232329] hover:text-white transition">Home</Link>
          <Link to="/streaming" className="px-4 py-2 rounded bg-[#232329] text-white font-semibold">Movies & Shows</Link>
          <Link to="/support" className="px-4 py-2 rounded text-gray-300 hover:bg-[#232329] hover:text-white transition">Support</Link>
          <Link to="/subscriptions" className="px-4 py-2 rounded text-gray-300 hover:bg-[#232329] hover:text-white transition">Subscriptions</Link>
        </nav>
        <div className="flex gap-4">
          <button className="text-gray-300 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <button className="text-gray-300 hover:text-white">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center mt-8">
        <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-lg">
          <img
            src={featuredMovie.image}
            alt={featuredMovie.title}
            className="w-full h-[420px] object-cover"
            style={{ filter: "brightness(0.7)" }}
          />
          {/* Overlay content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{featuredMovie.title}</h1>
            <p className="mb-6 text-gray-200 max-w-2xl">{featuredMovie.description}</p>
            <div className="flex gap-4">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded flex items-center gap-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play Now
              </button>
              <button className="bg-[#232329] hover:bg-[#2c2c31] text-white px-4 py-2 rounded flex items-center gap-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button className="bg-[#232329] hover:bg-[#2c2c31] text-white px-4 py-2 rounded flex items-center gap-2">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-1.414 1.414A9 9 0 1 0 12 21v-2a7 7 0 1 1 7-7h2a9 9 0 0 0-2.636-6.364z"/></svg>
              </button>
            </div>
          </div>
          {/* Left/Right arrows */}
          <button className="absolute left-4 bottom-4 bg-[#232329] bg-opacity-80 rounded p-2 text-white hover:bg-opacity-100">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="absolute right-4 bottom-4 bg-[#232329] bg-opacity-80 rounded p-2 text-white hover:bg-opacity-100">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="w-3 h-1 rounded bg-red-600"></span>
            <span className="w-3 h-1 rounded bg-gray-500"></span>
            <span className="w-3 h-1 rounded bg-gray-500"></span>
          </div>
        </div>
      </main>
    </div>
  );
} 