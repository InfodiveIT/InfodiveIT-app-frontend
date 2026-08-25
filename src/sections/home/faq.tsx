"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal } from "@/components/animations/reveal"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"
import { api } from "@/lib/api"

export type FAQItem = {
  question: string
  answer: string
}

export type FAQProps = {
  initialItems?: FAQItem[]
}

export function FAQ({ initialItems }: FAQProps = {}) {
  const { scrollTo } = useSmoothScroll()
  const [items, setItems] = useState<FAQItem[]>(initialItems ?? [])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (initialItems && initialItems.length > 0) return;

    api.faq()
      .then((data) => {
        if (data.length > 0) {
          setItems(data.map((d) => ({ question: d.pergunta, answer: d.resposta })))
        }
      })
      .catch(() => {})
  }, [initialItems])

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const handleMouseEnter = (index: number) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setActiveIndex(index)
    }
  }

  const handleMouseLeave = (index: number) => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setActiveIndex((prev) => (prev === index ? null : prev))
    }
  }

  // Rola suavemente até a seção de contato (Lenis com fallback nativo,
  // centralizado em useSmoothScroll).
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollTo("contact")) e.preventDefault();
  };

  if (items.length === 0) return null;

  return (
    <section id="faq" className="relative bg-ink-50 py-20 md:py-28 border-t border-ink-200/40">
      <div className="container-default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (Sticky Heading & Subtext) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal className="flex flex-col text-left">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-700 mb-5">
                Perguntas Frequentes
              </p>
              
              {/* Reference Typography: Bold + Outlined Heading */}
              <h2 className="text-5xl sm:text-6xl lg:text-[4.75rem] font-extrabold uppercase leading-[0.85] tracking-tighter flex flex-col mb-8">
                <span className="text-ink-950">Tudo que</span>
                <span className="text-ink-950">você</span>
                <span className="text-transparent text-red-700" style={{ WebkitTextStroke: "1.8px #b91c1c", WebkitTextFillColor: "transparent" }}>precisa</span>
                <span className="text-transparent text-red-700" style={{ WebkitTextStroke: "1.8px #b91c1c", WebkitTextFillColor: "transparent" }}>saber</span>
              </h2>

              <p className="text-sm text-ink-500 font-medium leading-relaxed">
                Não encontrou sua resposta?{" "}
                <a 
                  href="#contact" 
                  onClick={handleContactClick}
                  className="text-red-700 hover:text-red-800 underline underline-offset-4 transition-colors font-bold"
                >
                  Fale com um especialista
                </a>
              </p>
            </Reveal>
          </div>

          {/* Right Column (Accordion List) */}
          <div className="lg:col-span-7 flex flex-col">
            {items.map((item, index) => {
              const isOpen = activeIndex === index
              const formattedIndex = String(index + 1).padStart(2, "0")

              return (
                <Reveal key={index} delay={index * 0.06} as="div">
                  <div 
                    className={`border-b py-6 transition-all duration-300 ${
                      isOpen 
                        ? "border-l-2 border-red-700 border-b-transparent pl-4 -ml-4" 
                        : "border-ink-200/40 border-l-2 border-l-transparent pl-4 -ml-4"
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={() => handleMouseLeave(index)}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      className="w-full flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none group"
                    >
                      <div className="flex items-start">
                        {/* Index Number */}
                        <span className={`text-xs font-bold w-8 shrink-0 mt-1.5 transition-colors duration-200 ${isOpen ? "text-red-700" : "text-ink-400 group-hover:text-red-700"}`}>
                          {formattedIndex}
                        </span>
                        
                        {/* Question Text */}
                        <span className={`text-base sm:text-lg font-semibold transition-colors duration-200 ${isOpen ? "text-ink-950 font-bold" : "text-ink-900 group-hover:text-red-700"}`}>
                          {item.question}
                        </span>
                      </div>

                      {/* Reference typografic +/- sign */}
                      <span className={`text-2xl font-light shrink-0 select-none transition-colors duration-200 leading-none ${isOpen ? "text-red-700" : "text-ink-400 group-hover:text-red-700"}`}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {/* Answer text shifted right (ml-8) to align with question, skipping index space */}
                          <div className="ml-8 mt-3 text-sm text-ink-600 leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
