import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import hero1 from "@/assets/hero5.jpg";
import hero2 from "@/assets/hero6.jpg";
import hero3 from "@/assets/hero7.jpg";
import hero4 from "@/assets/hero8.jpg";

const slides = [
  { src: hero1, alt: "Ivory silk wrap dress by Zoe Essence" },
  { src: hero2, alt: "Espresso tailored ensemble with gold accents" },
  { src: hero3, alt: "Soft blush evening gown styled with leather bag" },
  { src: hero4, alt: "Muted gold satin slip dress" },
];

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-accent/40 -z-10 translate-x-6 translate-y-6" />
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 4500, stopOnInteraction: false })]}
        className="overflow-hidden"
      >
        <CarouselContent className="ml-0">
          {slides.map((s, i) => (
            <CarouselItem key={i} className="pl-0">
              <img
                src={s.src}
                alt={s.alt}
                width={1280}
                height={1600}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full h-[60vh] lg:h-[78vh] object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 transition-all duration-500 ${
              current === i ? "w-8 bg-background" : "w-4 bg-background/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
