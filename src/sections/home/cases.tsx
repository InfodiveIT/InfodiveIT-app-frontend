"use client"

import CasesCarousel from "@/components/cases-carousel"
import { Reveal } from "@/components/animations/reveal"

export function Cases() {
  // Temporariamente oculto até que os cases sejam populados
  return null;

  return (
    <section
      id="cases"
      className="relative border-t border-white/5 bg-ink-950 pb-24 pt-20 md:pb-28 md:pt-24"
    >
      <div className="container-default">
        <Reveal>
          <CasesCarousel />
        </Reveal>
      </div>
    </section>
  )
}

export default Cases
