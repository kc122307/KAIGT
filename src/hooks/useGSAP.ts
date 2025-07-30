
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useGSAP = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in animation for cards
      gsap.from(".goal-card", {
        duration: 0.6,
        y: 50,
        opacity: 0,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Stats animation
      gsap.from(".stats-card", {
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        stagger: 0.2,
        ease: "back.out(1.7)"
      });

      // Scroll-triggered animations
      gsap.utils.toArray(".scroll-fade").forEach((element: any) => {
        gsap.fromTo(element, 
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Parallax effect for sidebar
      gsap.to(".parallax-sidebar", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-sidebar",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return { containerRef };
};
