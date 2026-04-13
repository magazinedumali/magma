import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { applyStorageImageFallback, optimiseSupabaseImageUrl } from '@/lib/supabaseImageUrl';

interface SlideProps {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  author?: string;
  date?: string;
  authorAvatar?: string;
}

interface HeroSliderProps {
  /** Base path for article links, e.g. `/article` (web) or `/mobile/article` (app mobile). */
  articleBasePath?: string;
  /** Shorter slide height for narrow viewports (e.g. `/mobile` home). */
  compact?: boolean;
}

const HeroSlider = ({ articleBasePath = '/article', compact = false }: HeroSliderProps) => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [slides, setSlides] = useState<SlideProps[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [slidesLoading, setSlidesLoading] = useState(true);

  useEffect(() => {
    // Charger dynamiquement les 3 derniers articles publiés
    const fetchSlides = async () => {
      setSlidesLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, auteur, date_publication, statut')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(3);
      if (error) {
        console.error('[HeroSlider]', error);
        setSlides([]);
      } else {
        setSlides(
          (data ?? []).map((a: any) => ({
            id: a.id,
            slug: a.slug,
            title: a.titre,
            image: a.image_url ?? '',
            category: a.categorie,
            author: a.auteur,
            date: a.date_publication ? new Date(a.date_publication).toLocaleDateString() : '',
            authorAvatar: a.authorAvatar,
          }))
        );
      }
      setSlidesLoading(false);
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    
    // Auto-slide functionality
    let autoSlideInterval: NodeJS.Timeout;
    if (!isHovered) {
      autoSlideInterval = setInterval(() => {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
      }, 5000); // Change slide every 5 seconds
    }
    
    return () => clearInterval(autoSlideInterval);
  }, [api, isHovered]);

  const getAuthorAvatar = (author: string, authorAvatar?: string) => {
    if (authorAvatar) return authorAvatar;
    return '/logo.png';
  };

  return (
    <div 
      className="hero-slider relative rounded-2xl overflow-hidden glass-panel border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Carousel setApi={setApi} className="relative h-full">
        <CarouselContent className="h-full ml-0">
          {slides.map((slide, slideIndex) => (
            <CarouselItem key={slide.id} className="h-full pl-0">
              <div
                className={
                  compact
                    ? 'relative h-[280px] w-full overflow-hidden sm:h-[340px]'
                    : 'relative h-[450px] w-full overflow-hidden md:h-[550px]'
                }
              >
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: current === slideIndex + 1 ? 1 : 1.1 }}
                  transition={{ duration: 6, ease: "easeOut" }}
                  src={optimiseSupabaseImageUrl(slide.image || '/placeholder.svg', 'hero')}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => applyStorageImageFallback(e.currentTarget)}
                  loading={slideIndex === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchpriority={slideIndex === 0 ? 'high' : 'low'}
                />
                
                {/* Gradient: lighter at top, heavier only at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                
                <div className="absolute top-5 left-5 z-20">
                  <motion.span 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#ff184e]/90 backdrop-blur-md border border-[#ff184e]/50 text-white text-[10px] font-bold uppercase tracking-[0.14em] px-3 py-1 rounded-full shadow-[0_0_12px_rgba(255,24,78,0.4)]"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {slide.category}
                  </motion.span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-20">
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-4 max-w-3xl leading-snug"
                    style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
                  >
                    <Link
                      to={`${articleBasePath}/${slide.slug || slide.id}`}
                      className="hover:text-[#ff184e] transition-colors line-clamp-3"
                    >
                      {slide.title}
                    </Link>
                  </motion.h2>
                  
                  {slide.author && slide.date && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex items-center gap-3 bg-black/30 backdrop-blur-md w-max px-3 py-1.5 rounded-full border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={getAuthorAvatar(slide.author, slide.authorAvatar)}
                          alt={slide.author}
                          className="w-5 h-5 rounded-full border border-white/20"
                          onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="text-xs font-semibold text-white/90" style={{ fontFamily: "'Inter', sans-serif" }}>{slide.author}</span>
                      </div>
                      <span className="w-px h-3 bg-white/20"></span>
                      <span className="flex items-center text-xs text-gray-400" style={{ fontFamily: "'DM Mono', monospace" }}>
                        <Clock size={11} className="mr-1.5 text-[#ff184e]" />
                        {slide.date}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Dots */}
        <div className="absolute bottom-8 right-8 flex space-x-3 z-30 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                current - 1 === index ? "bg-[#ff184e] w-8 shadow-[0_0_10px_rgba(255,24,78,0.8)]" : "bg-white/40 w-2 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-30"
            >
              <Button
                variant="ghost"
                className="w-12 h-12 bg-black/40 hover:bg-[#ff184e] backdrop-blur-md border border-white/20 text-white rounded-full p-0 flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,24,78,0.6)]"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-30"
            >
              <Button
                variant="ghost"
                className="w-12 h-12 bg-black/40 hover:bg-[#ff184e] backdrop-blur-md border border-white/20 text-white rounded-full p-0 flex items-center justify-center transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(255,24,78,0.6)]"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight size={24} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Carousel>
    </div>
  );
};

export default HeroSlider;
