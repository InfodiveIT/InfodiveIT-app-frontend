import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { type Artigo, TIPO_CONFIG } from "@/lib/blog-data";

function getYouTubeThumbnail(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Card de artigo/material — usado tanto no grid da listagem (/blog) quanto na
 * seção de conteúdos relacionados da página de detalhe. É um Link para
 * /blog/[slug].
 */
export function ArtigoCard({ artigo }: { artigo: Artigo }) {
  const config = TIPO_CONFIG[artigo.tipo];
  const Icon = config.icon;
  const ytThumb = artigo.tipo === "video" ? getYouTubeThumbnail(artigo.urlExterna) : null;
  const bannerImage = artigo.imagemUrl || ytThumb;

  return (
    <Link
      href={`/blog/${artigo.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink-200 bg-white !text-ink-950 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand"
    >
      {/* Thumbnail */}
      <div
        className="relative h-[200px] overflow-hidden bg-ink-950"
        style={{ backgroundColor: artigo.imagemBg }}
      >
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt={artigo.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Icon
            className="absolute right-5 top-5 h-16 w-16 text-white/[0.06]"
            strokeWidth={1.25}
            aria-hidden
          />
        )}
        {artigo.tipo === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-5 w-5 fill-white text-white" aria-hidden />
            </span>
          </div>
        )}
        {/* Badge tipo */}
        <span
          className="absolute left-4 top-4 z-10 inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Corpo */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
          {artigo.categoria} • {artigo.fabricante}
        </p>
        <h3 className="mt-2 text-[17px] font-semibold leading-[1.4] text-ink-950">
          {artigo.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6] text-ink-500">
          {artigo.descricao}
        </p>

        {/* Rodapé do card */}
        <div className="mt-auto flex items-center justify-between border-t border-ink-200/70 pt-4 text-xs">
          <span className="text-ink-500">{artigo.data}</span>
          <span className="inline-flex items-center gap-1 font-medium text-brand transition-colors group-hover:text-brand-deep">
            {artigo.tipo === "video" ? "Assistir vídeo" : "Ler mais"}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
