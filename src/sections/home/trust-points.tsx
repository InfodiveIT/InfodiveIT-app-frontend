"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { NumberTicker } from "@/components/ui/number-ticker"
import { api } from "@/lib/api"
import { trustDtoToStat, type Stat } from "@/lib/converters"

const STATS_FALLBACK: Stat[] = [
  {
    eyebrow: "Tradição",
    prefix: "Desde",
    prefixClass: "text-2xl sm:text-3xl font-bold mr-2 text-ink-300",
    value: 2003,
    startValue: 1900,
    title: "História no mercado de TI",
    desc: "Consolidando infraestruturas críticas e integrando inovações tecnológicas há mais de duas décadas.",
  },
  {
    eyebrow: "Confiança",
    prefix: "+",
    prefixClass: "text-brand mr-1 font-bold",
    value: 100,
    startValue: 0,
    title: "Clientes ativos e satisfeitos",
    desc: "Parcerias sólidas com bancos, hospitais, indústrias e grandes redes varejistas em todo o país.",
  },
  {
    eyebrow: "Sucesso",
    suffix: "%",
    suffixClass: "text-brand ml-1 font-bold",
    value: 100,
    startValue: 0,
    title: "Projetos entregues com sucesso",
    desc: "Projetos de alta complexidade em nuvem, migração e segurança executados com taxa perfeita de sucesso.",
  },
]

export type TrustPointsProps = {
  initialStats?: Stat[]
}

export const TrustPoints = ({ initialStats }: TrustPointsProps = {}) => {
  const [stats, setStats] = useState<Stat[]>(
    initialStats && initialStats.length > 0 ? initialStats : STATS_FALLBACK
  )

  useEffect(() => {
    if (initialStats && initialStats.length > 0) return;

    api.homeTrustStats()
      .then((data) => { if (data.length > 0) setStats(data.map(trustDtoToStat)) })
      .catch(() => { /* mantém fallback */ })
  }, [initialStats])

  return (
    <section className="relative overflow-hidden bg-ink-50 pb-14 pt-8 md:py-16">
      <div className="container-default relative z-10">
        <div className="relative">

          {/* Divisórias verticais animadas — camada própria, só no desktop.
              Ficam FORA do grid com divide-y para não virar border-top nos stats. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
            {[1, 2].map((pos) => (
              <motion.span
                key={pos}
                initial={{ scaleY: 0, opacity: 0 }}
                whileInView={{ scaleY: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.25 + pos * 0.1, ease: [0.25, 1, 0.5, 1] }}
                style={{ left: `${(pos * 100) / 3}%` }}
                className="absolute top-1/4 bottom-1/4 w-px origin-center bg-ink-200/80"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 divide-y divide-ink-200/80 md:grid-cols-3 md:divide-y-0">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.eyebrow}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 1, 0.5, 1] }}
                className="flex flex-col items-center justify-center p-6 text-center md:px-8 md:py-7"
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                  {stat.eyebrow}
                </p>

                <div className="flex items-baseline justify-center text-5xl font-black tracking-tighter text-ink-950 sm:text-6xl">
                  {stat.prefix && <span className={stat.prefixClass}>{stat.prefix}</span>}
                  <NumberTicker
                    value={stat.value}
                    startValue={stat.startValue}
                    className="font-black text-ink-950"
                  />
                  {stat.suffix && <span className={stat.suffixClass}>{stat.suffix}</span>}
                </div>

                <h4 className="mt-4 text-base font-bold text-ink-950">{stat.title}</h4>
                <p className="mt-2 max-w-xs font-sans text-sm font-light leading-relaxed text-ink-500">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default TrustPoints
