"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Reveal } from "@/components/animations/reveal";
import { api } from "@/lib/api";

import financeImg from "@/assets/cases/finance.png";
import industryImg from "@/assets/cases/industry.png";
import retailImg from "@/assets/cases/retail.png";

gsap.registerPlugin(ScrollTrigger);

type Foto = {
  src: string | StaticImageData;
  alt: string;
  speed: number;
  className: string;
};

const SPEEDS = [8, -6, 12];
const CLASSES = [
  "md:col-span-5 aspect-[4/5]",
  "md:col-span-4 md:mt-16 aspect-[3/4]",
  "md:col-span-3 md:mt-28 aspect-[3/4]",
];

const FOTOS_FALLBACK: Foto[] = [
  { src: financeImg, alt: "Equipe Infodive em projeto no setor financeiro", speed: 8, className: CLASSES[0] },
  { src: industryImg, alt: "Operação de infraestrutura em ambiente industrial", speed: -6, className: CLASSES[1] },
  { src: retailImg, alt: "Time Infodive em implantação no varejo", speed: 12, className: CLASSES[2] },
];

export function SobreCultura() {
  const sectionRef = useRef<HTMLElement>(null);
  const [fotos, setFotos] = useState<Foto[]>(FOTOS_FALLBACK);
  const [eyebrow, setEyebrow] = useState("Cultura");
  const [headline, setHeadline] = useState("Gente que gosta de problema difícil.");
  const [paragrafo, setParagrafo] = useState(
    "Por trás de cada projeto há um time que estuda fabricante novo no fim de semana, atende chamado crítico de madrugada e celebra migração concluída como final de campeonato. É essa cultura que os clientes contratam junto com a tecnologia."
  );

  useEffect(() => {
    api.sobreCultura()
      .then((data) => {
        if (data.eyebrow) setEyebrow(data.eyebrow);
        if (data.headline) setHeadline(data.headline);
        if (data.paragrafo) setParagrafo(data.paragrafo);
        if (data.fotos && data.fotos.length > 0) {
          setFotos(data.fotos.map((f, i) => ({
            src: f.imagemUrl,
            alt: f.alt ?? `Foto ${i + 1} da equipe Infodive`,
            speed: SPEEDS[i % SPEEDS.length],
            className: CLASSES[i % CLASSES.length],
          })));
        }
      })
      .catch(() => { /* mantém fallback */ });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const fotosEls = gsap.utils.toArray<HTMLElement>("[data-parallax]", section);
      fotosEls.forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0;
        gsap.fromTo(
          el,
          { yPercent: speed },
          {
            yPercent: -speed,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-ink-200/60 bg-ink-50 py-20 md:py-28"
    >
      <div className="container-default">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow">{eyebrow}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-balance">
                {headline}
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={0.2}>
              <p className="text-pretty leading-relaxed text-ink-500 lg:mt-2">
                {paragrafo}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-12 md:gap-6">
          {fotos.map((foto, index) => (
            <div
              key={typeof foto.src === "string" ? foto.src : foto.alt}
              data-parallax={foto.speed}
              className={foto.className}
            >
              <div className="h-full w-full overflow-hidden">
                <motion.div
                  initial={{ scale: 1.12 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.2, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={foto.src}
                    alt={foto.alt}
                    className="h-full w-full object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    {...(typeof foto.src !== "string" ? { placeholder: "blur" } : {})}
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
