"use client";

import { useState, useEffect } from "react";
import { BentoGridSolutions } from "@/components/bento-grid-solutions";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export type SolutionsProps = {
  initialInfo?: {
    eyebrow: string
    headline: string
    headlineDestaque: string
    subtitulo: string
  }
  initialMarqueeEvents?: any[]
  initialBentoData?: any[]
}

export function Solutions({ initialInfo, initialMarqueeEvents, initialBentoData }: SolutionsProps = {}) {
  const [info, setInfo] = useState(initialInfo ?? {
    eyebrow: "Soluções",
    headline: "Um portfólio completo para a sua operação crítica",
    headlineDestaque: "portfólio completo",
    subtitulo: "",
  });

  useEffect(() => {
    if (initialInfo) return;

    api.secaoHome("solucoes")
      .then((data) => {
        if (data) {
          setInfo({
            eyebrow: data.eyebrow || "Soluções",
            headline: data.headline || "Um portfólio completo para a sua operação crítica",
            headlineDestaque: data.headlineDestaque || "portfólio completo",
            subtitulo: data.subtitulo || "",
          });
        }
      })
      .catch(() => { /* fallback */ });
  }, [initialInfo]);

  return (
    <section id="solutions" className="relative bg-white py-20 md:py-28">
      <div className="container-default">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow text-sm">{info.eyebrow}</p>
          <h2 className="text-ink-950 max-w-4xl text-balance text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]">
            {info.headlineDestaque && info.headline.includes(info.headlineDestaque) ? (
              (() => {
                const parts = info.headline.split(info.headlineDestaque);
                return (
                  <>
                    {parts[0]}
                    <span className="text-[var(--brand-light)]">
                      {info.headlineDestaque}
                    </span>
                    {parts.slice(1).join(info.headlineDestaque)}
                  </>
                );
              })()
            ) : info.headline.includes("portfólio completo") ? (
              <>
                {info.headline.split("portfólio completo")[0]}
                <span className="text-[var(--brand-light)]">
                  portfólio completo
                </span>
                {info.headline.split("portfólio completo")[1]}
              </>
            ) : (
              info.headline
            )}
          </h2>
          <Link
            href="/solucoes"
            className="focus:outline-none w-full sm:w-auto flex justify-center"
            tabIndex={-1}
          >
            <Button
              variant="primary"
              className="mt-2 w-full sm:w-auto text-sm font-bold py-3.5 sm:px-6 sm:py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(14,102,255,0.25)]"
            >
              Ver todas as soluções
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <BentoGridSolutions
            initialMarqueeEvents={initialMarqueeEvents}
            initialBentoData={initialBentoData}
          />
        </Reveal>
      </div>
    </section>
  );
}
