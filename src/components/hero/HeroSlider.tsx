import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

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

const HeroSlider = () => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [slides, setSlides] = useState<SlideProps[]>([]);

  useEffect(() => {
    // Charger dynamiquement les 3 derniers articles publiés
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, titre, image_url, categorie, auteur, date_publication')
        .eq('statut', 'publie')
        .order('date_publication', { ascending: false })
        .limit(3);
      if (data) {
        setSlides(data.map((a: any) => ({
          id: a.id,
          slug: a.slug,
          title: a.titre,
          image: a.image_url,
          category: a.categorie,
          author: a.auteur,
          date: a.date_publication ? new Date(a.date_publication).toLocaleDateString() : '',
          authorAvatar: a.authorAvatar,
        })));
      }
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
    const autoSlideInterval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(autoSlideInterval);
  }, [api]);

  const getAuthorAvatar = (author: string, authorAvatar?: string) => {
    if (authorAvatar) return authorAvatar;
    return '/logo.png';
  };

  return (
    <Carousel setApi={setApi} className="relative">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative h-[400px] md:h-[500px]">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg" />
              
              <div className="absolute top-4 left-4">
                <span className="article-category">
                  {slide.category}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-3xl">
                  <Link to={`/article/${slide.slug}`} className="hover:text-[#ff184e] transition-colors">
                    {slide.title}
                  </Link>
                </h2>
                
                {slide.author && slide.date && (
                  <div className="flex items-center text-white">
                    <img 
                      src={getAuthorAvatar(slide.author, slide.authorAvatar)}
                      alt={slide.author}
                      className="w-10 h-10 rounded-full mr-3"
                      onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                    />
                    <span className="mr-3">{slide.author}</span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {slide.date}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              current - 1 === index ? "bg-[#ff184e] w-6" : "bg-white/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <Button
        variant="ghost"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        onClick={() => api?.scrollPrev()}
      >
        <ChevronLeft size={24} />
      </Button>
      
      <Button
        variant="ghost"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        onClick={() => api?.scrollNext()}
      >
        <ChevronRight size={24} />
      </Button>
    </Carousel>
  );
};

export default HeroSlider;
