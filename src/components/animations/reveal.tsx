"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

const MOTION = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
  article: motion.article,
} as const

type RevealProps = {
  /** Elemento renderizado (mantém a semântica: li dentro de ul, etc.). */
  as?: keyof typeof MOTION
  /** Atraso para escalonar irmãos (ex.: index * 0.08). */
  delay?: number
  /** Intensidade do blur inicial em px. */
  blur?: number
  /** Deslocamento vertical inicial em px. */
  y?: number
  /** Fração do bloco visível para disparar (framer viewport.amount). */
  amount?: number
  className?: string
  children: ReactNode
}

/**
 * Blur-reveal por viewport — mesma linguagem da hero (filter blur + opacity + y,
 * ease [0.25,1,0.5,1]), mas disparado quando o bloco entra na tela ao scrollar.
 * Cada Reveal tem seu próprio gatilho (once), então os blocos revelam "camada por
 * camada" conforme cruzam a viewport; use `delay` para escalonar grids/clusters.
 */
export function Reveal({
  as = "div",
  delay = 0,
  blur = 8,
  y = 14,
  amount = 0.05,
  className,
  children,
}: RevealProps) {
  const reduce = useReducedMotion()
  const M = MOTION[as] as typeof motion.div

  if (reduce) {
    return (
      <M className={className} style={{ opacity: 1, filter: "none", transform: "none" }}>
        {children}
      </M>
    )
  }

  return (
    <M
      className={className}
      initial={{ opacity: 0, filter: `blur(${blur}px)`, y }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1], delay }}
    >
      {children}
    </M>
  )
}

export default Reveal
