
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useGSAP = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced fade in animation for cards with stagger
      gsap.from(".goal-card", {
        duration: 0.8,
        y: 60,
        opacity: 0,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "all"
      });

      // Enhanced stats animation with bounce
      gsap.from(".stats-card", {
        duration: 1,
        scale: 0.8,
        opacity: 0,
        rotation: -5,
        stagger: 0.2,
        ease: "back.out(2)",
        clearProps: "all"
      });

      // Enhanced scroll-triggered animations with more dynamic effects
      gsap.utils.toArray(".scroll-fade").forEach((element: any, index) => {
        gsap.fromTo(element, 
          { 
            opacity: 0, 
            y: 50,
            scale: 0.95,
            rotateX: -10
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
              // Add subtle parallax effect
              onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(element, {
                  y: progress * -20
                });
              }
            },
            delay: index * 0.1
          }
        );
      });

      // Enhanced parallax effect for sidebar with smooth momentum
      gsap.to(".parallax-sidebar", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-sidebar",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // Add floating animation for interactive elements
      gsap.utils.toArray(".floating-element").forEach((element: any) => {
        gsap.to(element, {
          y: -10,
          duration: 2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Add pulse animation for attention-grabbing elements
      gsap.utils.toArray(".pulse-element").forEach((element: any) => {
        gsap.to(element, {
          scale: 1.05,
          duration: 1.5,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Add slide-in animation for navigation elements
      gsap.from(".slide-in-left", {
        x: -100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });

      gsap.from(".slide-in-right", {
        x: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });

      // Add rotation animation for icons
      gsap.utils.toArray(".rotate-on-hover").forEach((element: any) => {
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            rotation: 360,
            duration: 0.6,
            ease: "power2.out"
          });
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return { containerRef };
};
