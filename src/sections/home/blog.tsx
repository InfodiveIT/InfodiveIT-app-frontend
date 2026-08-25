"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { api, type ConteudoDTO } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";

// Imagens geradas correspondendo ao estilo e temas do screenshot
import peopleImg from "@/assets/blog/people.png";
import cloudImg from "@/assets/blog/cloud.png";
import presentationImg from "@/assets/blog/presentation.png";

import { dtoToBlogItem, type ContentItem } from "@/lib/converters"

export type BlogProps = {
  initialItems?: ContentItem[];
};

export function Blog({ initialItems }: BlogProps = {}) {
  const [items, setItems] = useState<ContentItem[]>(initialItems ?? []);
  const [isLoaded, setIsLoaded] = useState(Boolean(initialItems));

  useEffect(() => {
    if (initialItems) return;

    let active = true;

    api
      .conteudos({ size: 3, destaque: true })
      .then((res) => {
        if (active) {
          if (res && res.content && res.content.length > 0) {
            const formatted = res.content
              .slice(0, 3)
              .map(dtoToBlogItem);
            setItems(formatted);
          } else {
            setItems([]);
          }
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setIsLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [initialItems]);

  if (isLoaded && items.length === 0) return null;

  return (
    <section
      id="blog"
      className="relative bg-white py-20 md:py-28 border-t border-ink-200/60"
    >
      <div className="container-default">
        {/* Cabeçalho do Blog */}
        <Reveal className="mb-10 flex items-center justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink-950 tracking-tight">
            Blog
          </h2>

          <Link
            href="/blog"
            className="focus:outline-none shrink-0"
            tabIndex={-1}
          >
            <Button
              variant="ghost"
              size="sm"
              className="border border-ink-200 text-xs px-5 py-2.5 font-semibold text-ink-900 bg-white hover:bg-ink-50 transition-all active:scale-95"
            >
              Todos os artigos
            </Button>
          </Link>
        </Reveal>

        {/* Grade de Cards com Redimensionamento e Bordas Compartilhadas dinâmicas */}
        <div className={`border border-ink-200 rounded-2xl overflow-hidden grid grid-cols-1 ${
          items.length === 1 ? 'md:grid-cols-1 max-w-[400px] mx-auto' : items.length === 2 ? 'md:grid-cols-2 max-w-[800px] mx-auto' : 'md:grid-cols-3 max-w-none'
        } divide-y md:divide-y-0 md:divide-x divide-ink-200 bg-transparent`}>
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="group flex flex-col p-6 transition-colors duration-300 hover:bg-ink-50/50"
            >
              {/* Imagem do Card com Proporção do Screenshot */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-ink-200/40 bg-ink-50">
                <Image
                  src={item.imagem}
                  alt={item.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Tag / Categoria */}
              <span className="mt-5 text-[10px] font-bold uppercase tracking-wider text-brand">
                {item.categoria}
              </span>

              {/* Título do Artigo */}
              <h3 className="mt-2.5 text-base sm:text-lg font-bold text-ink-950 leading-snug group-hover:text-brand transition-colors duration-300">
                <Link
                  href={`/blog/${item.slug}`}
                  className="focus:outline-none"
                >
                  {item.titulo}
                </Link>
              </h3>

              {/* Rodapé: Data e Tempo de Leitura */}
              <div className="mt-auto pt-6 text-xs text-ink-500 font-sans font-light">
                {item.publicadoEm} &bull; {item.tempoLeitura}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Blog;
