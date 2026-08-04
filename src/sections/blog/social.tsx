"use client";

import { useEffect, useState } from "react";
import { api, SocialPostDTO } from "@/lib/api";
import Image from "next/image";
import {
  ArrowUpRight,
  ChevronDown,
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  ThumbsUp,
} from "lucide-react";
import faviconImg from "@/assets/logo/Logos Infodive Navbar.png";
import instagramImg from "@/assets/footer/instagram.png";
import linkedinImg from "@/assets/footer/linkedin.png";
import { Reveal } from "@/components/animations/reveal";
import { cn } from "@/lib/utils";

type InstagramPostDisplay = {
  imagemBg?: string;
  imagemUrl?: string;
  permalinkUrl?: string;
  likes: number;
  comentarios: number;
  legenda: string;
  tempo: string;
};

type LinkedinPostDisplay = {
  texto: string;
  temImagem: boolean;
  imagemBg?: string;
  imagemUrl?: string;
  permalinkUrl?: string;
  likes: number;
  comentarios: number;
  tempo: string;
};

const fallbackInstagramPosts: InstagramPostDisplay[] = [
  {
    imagemBg: "#0A0F1A",
    likes: 215,
    comentarios: 34,
    legenda:
      "🚀 Missão cumprida: 200 VMs migradas para Proxmox em um final de semana, zero downtime. Orgulho do time! #Virtualização #Proxmox #Infodive",
    tempo: "1 semana atrás",
  },
  {
    imagemBg: "#0A1215",
    likes: 187,
    comentarios: 29,
    legenda:
      "🤖 IA no ambiente corporativo: não é o futuro, é o presente. Como o Watson está sendo usado por clientes Infodive. #IA #IBM #Watson",
    tempo: "2 semanas atrás",
  },
  {
    imagemBg: "#0A0F1A",
    likes: 142,
    comentarios: 23,
    legenda:
      "🔐 Segurança não é produto, é processo. Saiba como o IBM Guardium está protegendo dados críticos de empresas no Brasil. #Segurança #IBM #LGPD",
    tempo: "2 dias atrás",
  },
  {
    imagemBg: "#0A1A0A",
    likes: 98,
    comentarios: 11,
    legenda:
      "☁️ Cloud sem governança é dinheiro jogado fora. Fizemos uma thread completa sobre FinOps — vale a leitura! #Cloud #FinOps #Azure",
    tempo: "4 dias atrás",
  },
  {
    imagemBg: "#1A100A",
    likes: 76,
    comentarios: 8,
    legenda:
      "📊 Novo datasheet disponível: Lenovo ThinkSystem SR650 V3. Baixe gratuitamente no link da bio. #Infraestrutura #Lenovo #Datacenter",
    tempo: "1 semana atrás",
  },
  {
    imagemBg: "#0F0A1A",
    likes: 63,
    comentarios: 6,
    legenda:
      "🛡️ Ransomware não avisa antes de atacar. Veja o case de como implementamos proteção em uma rede hospitalar em 72 horas. #Segurança #Acronis",
    tempo: "2 semanas atrás",
  },
];

const fallbackLinkedinPosts: LinkedinPostDisplay[] = [
  {
    texto:
      "Uma reflexão importante para gestores de TI:\n\nComprar tecnologia é a parte fácil. O que diferencia ambientes que funcionam de ambientes que travam é a execução — planejamento, implantação e sustentação feitos com método.\n\nNos últimos 20 anos vimos muitas empresas adquirirem soluções excelentes que nunca chegaram ao potencial por falta de um parceiro técnico sólido.\n\nÉ exatamente esse gap que a Infodive preenche.",
    temImagem: false,
    imagemBg: "",
    likes: 231,
    comentarios: 42,
    tempo: "1 semana atrás",
  },
  {
    texto:
      "Estamos contratando! 🎯\n\nProcuramos Engenheiro de Infraestrutura com experiência em ambientes VMware e/ou Proxmox para atuar em projetos enterprise em Porto Alegre.\n\nSe você quer trabalhar com tecnologia de missão crítica e um time que respira TI, fala com a gente.",
    temImagem: false,
    imagemBg: "",
    likes: 156,
    comentarios: 38,
    tempo: "2 semanas atrás",
  },
  {
    texto:
      "Acabamos de concluir mais um projeto de modernização de datacenter. O cliente tinha servidores legados com mais de 8 anos operando aplicações críticas. Em 90 dias, sem nenhuma interrupção do serviço, migramos tudo para uma nova infraestrutura Lenovo ThinkSystem.\n\nO resultado: 40% de redução no consumo energético, 3x mais capacidade de processamento e SLA de 99.98%.\n\nÉ por projetos assim que acordamos todo dia. 🚀",
    temImagem: true,
    imagemBg: "#0A0F1A",
    likes: 94,
    comentarios: 17,
    tempo: "3 dias atrás",
  },
  {
    texto:
      'Publicamos um novo whitepaper: "Guia completo de recuperação de desastres com Veeam Data Platform".\n\nAbordamos RTO, RPO, backup imutável, e estratégias testadas em ambientes reais de clientes.\n\nDownload gratuito — link nos comentários. 👇',
    temImagem: true,
    imagemBg: "#0A1A0A",
    likes: 78,
    comentarios: 24,
    tempo: "1 semana atrás",
  },
];

type Rede = "instagram" | "linkedin";

function formatTempoRelativo(dataIso?: string): string {
  if (!dataIso) return "Recente";
  try {
    const diffMs = Date.now() - new Date(dataIso).getTime();
    if (isNaN(diffMs)) return "Recente";
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHoras < 1) return "Poucos minutos atrás";
    if (diffHoras < 24) return `${diffHoras} horas atrás`;
    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias === 1) return "Ontem";
    if (diffDias < 7) return `${diffDias} dias atrás`;
    const diffSemanas = Math.floor(diffDias / 7);
    if (diffSemanas < 4) return `${diffSemanas} semana${diffSemanas > 1 ? "s" : ""} atrás`;
    const diffMeses = Math.floor(diffDias / 30);
    return `${diffMeses} mês${diffMeses > 1 ? "es" : ""} atrás`;
  } catch {
    return "Recente";
  }
}

export function BlogSocial() {
  const [rede, setRede] = useState<Rede>("instagram");
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/infodiveit/");
  const [linkedinUrl, setLinkedinUrl] = useState("https://www.linkedin.com/company/infodiveit/posts/?feedView=all");
  const [socialEyebrow, setSocialEyebrow] = useState("Nas redes sociais");
  const [socialHeadline, setSocialHeadline] = useState("Acompanhe a Infodive no Instagram e LinkedIn.");
  const [socialDescricao, setSocialDescricao] = useState("Conteúdo técnico, novidades e bastidores da equipe.");

  const [instagramPosts, setInstagramPosts] = useState<InstagramPostDisplay[]>(fallbackInstagramPosts);
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedinPostDisplay[]>(fallbackLinkedinPosts);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  useEffect(() => {
    api.configBlog()
      .then((data) => {
        if (data.urlInstagram) setInstagramUrl(data.urlInstagram);
        if (data.urlLinkedin) setLinkedinUrl(data.urlLinkedin);
        if (data.socialEyebrow) setSocialEyebrow(data.socialEyebrow);
        if (data.socialHeadline) setSocialHeadline(data.socialHeadline);
        if (data.socialDescricao) setSocialDescricao(data.socialDescricao);
      })
      .catch(() => {});

    Promise.all([
      api.socialPosts("INSTAGRAM").catch(() => []),
      api.socialPosts("LINKEDIN").catch(() => []),
    ]).then(([igData, liData]) => {
      if (igData && igData.length > 0) {
        // Filtrar e ordenar pelos posts mais curtidos primeiro
        const sortedIg = [...igData].sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
        setInstagramPosts(
          sortedIg.map((item) => ({
            imagemUrl: item.imagemUrl,
            permalinkUrl: item.permalinkUrl,
            likes: item.likesCount ?? 0,
            comentarios: item.commentsCount ?? 0,
            legenda: item.textoLegenda || "",
            tempo: formatTempoRelativo(item.publicadoEm),
          }))
        );
      }

      if (liData && liData.length > 0) {
        // Ordenar pelos posts mais curtidos do LinkedIn
        const sortedLi = [...liData].sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
        setLinkedinPosts(
          sortedLi.map((item) => ({
            texto: item.textoLegenda || "",
            temImagem: Boolean(item.imagemUrl && item.imagemUrl.length > 0),
            imagemUrl: item.imagemUrl,
            permalinkUrl: item.permalinkUrl,
            likes: item.likesCount ?? 0,
            comentarios: item.commentsCount ?? 0,
            tempo: formatTempoRelativo(item.publicadoEm),
          }))
        );
      }
    });
  }, []);

  const postsAtuais = rede === "instagram" ? instagramPosts : linkedinPosts;
  const postsExibidos = postsAtuais.slice(0, visibleCount);
  const temMaisPosts = postsAtuais.length > visibleCount;

  return (
    <section className="relative overflow-hidden bg-[#050507] py-20 text-white md:py-28">
      <div className="container-default">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-accent">
              {socialEyebrow}
            </p>
            <h2 className="mt-3 text-balance text-white">
              {socialHeadline}
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-ink-300">
              {socialDescricao}
            </p>
          </div>

          {/* Botões de perfil */}
          <div className="flex flex-shrink-0 flex-wrap gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:border-white/40"
            >
              <Image
                src={instagramImg}
                alt=""
                aria-hidden
                className="h-4 w-4 object-contain"
              />
              Instagram
              <ArrowUpRight className="h-4 w-4 text-ink-300" aria-hidden />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:border-white/40"
            >
              <Image
                src={linkedinImg}
                alt=""
                aria-hidden
                className="h-4 w-4 object-contain"
              />
              LinkedIn
              <ArrowUpRight className="h-4 w-4 text-ink-300" aria-hidden />
            </a>
          </div>
        </div>

        {/* Tabs de rede */}
        <div className="mt-10 flex gap-8 border-b border-white/10">
          {(["instagram", "linkedin"] as const).map((item) => {
            const ativo = rede === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRede(item);
                  setVisibleCount(6);
                }}
                className={cn(
                  "relative -mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium capitalize transition-all",
                  ativo
                    ? "border-brand text-white"
                    : "border-transparent text-ink-500 hover:text-ink-300",
                )}
              >
                <Image
                  src={item === "instagram" ? instagramImg : linkedinImg}
                  alt=""
                  aria-hidden
                  className={cn(
                    "h-4 w-4 object-contain transition-opacity",
                    ativo ? "opacity-100" : "opacity-50",
                  )}
                />
                {item}
              </button>
            );
          })}
        </div>

        {/* Feed */}
        <div className="mt-10">
          {rede === "instagram" ? (
            <InstagramFeed posts={postsExibidos as InstagramPostDisplay[]} instagramUrl={instagramUrl} />
          ) : (
            <LinkedinFeed posts={postsExibidos as LinkedinPostDisplay[]} linkedinUrl={linkedinUrl} />
          )}
        </div>

        {/* Botão Ver Mais */}
        {temMaisPosts ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-brand hover:bg-brand/10 hover:text-white"
            >
              Ver mais publicações
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-10 flex justify-center">
            <a
              href={rede === "instagram" ? instagramUrl : linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium text-ink-300 transition-all hover:border-white/30 hover:text-white"
            >
              Ver perfil completo no {rede === "instagram" ? "Instagram" : "LinkedIn"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        )}

        {/* Badge Informativa */}
        <p className="mt-12 text-center text-xs text-ink-500">
          Siga nossas contas oficiais no Instagram e LinkedIn para acompanhar nossas publicações.
        </p>
      </div>
    </section>
  );
}

/** Mini header de perfil reutilizado no topo de cada card do Instagram. */
function ProfileHeader({ permalinkUrl, instagramUrl }: { permalinkUrl?: string; instagramUrl: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
        <Image
          src={faviconImg}
          alt="Infodive"
          className="h-5 w-5 object-contain"
        />
      </span>
      <span className="text-sm font-semibold text-white">infodive_it</span>
      <a
        href={permalinkUrl || instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto"
      >
        <Image
          src={instagramImg}
          alt="Instagram Post"
          className="h-4 w-4 object-contain opacity-70 hover:opacity-100 transition-opacity"
        />
      </a>
    </div>
  );
}

/** Feed do Instagram — grid responsiva moderna de 3 colunas com fotos proporcionais. */
function InstagramFeed({ posts, instagramUrl }: { posts: InstagramPostDisplay[]; instagramUrl: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <Reveal
          key={post.permalinkUrl || post.legenda.slice(0, 32) + index}
          delay={(index % 3) * 0.08}
          className="flex h-full"
        >
          <article className="group flex w-full flex-col overflow-hidden rounded-xl border border-[#1E1E22] bg-[#0D0D0F] transition-all duration-300 hover:-translate-y-1 hover:border-[#2A2A30] hover:shadow-xl hover:shadow-brand/5">
            <ProfileHeader permalinkUrl={post.permalinkUrl} instagramUrl={instagramUrl} />

            {/* Imagem Proporcional com Aspect Square / Fit */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#07090E]">
              {post.imagemUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.imagemUrl}
                  alt={post.legenda ? post.legenda.slice(0, 50) : "Instagram Post"}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                  <Image
                    src={faviconImg}
                    alt=""
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.08]"
                  />
                </>
              )}
            </div>

            {/* Interações */}
            <div className="flex items-center gap-4 px-4 pt-3.5 text-ink-300">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                <Heart className="h-4 w-4 fill-red-500/20 text-red-500" aria-hidden />
                {post.likes}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-300">
                <MessageCircle className="h-4 w-4 text-ink-400" aria-hidden />
                {post.comentarios}
              </span>
              {post.permalinkUrl && (
                <a
                  href={post.permalinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-ink-400 transition-colors hover:text-white"
                  title="Abrir no Instagram"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>

            <div className="mx-4 mt-3 border-t border-white/[0.06]" />

            {/* Legenda */}
            <div className="flex flex-1 flex-col justify-between px-4 py-3">
              <p className="line-clamp-3 text-[13px] leading-[1.6] text-ink-300">
                <span className="font-semibold text-white">infodive_it</span>{" "}
                {post.legenda}
              </p>
              {post.permalinkUrl && (
                <a
                  href={post.permalinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-light"
                >
                  Ver no Instagram
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="mx-4 border-t border-white/[0.06]" />

            {/* Timestamp */}
            <p className="px-4 py-3 text-[11px] uppercase tracking-wide text-ink-500">
              {post.tempo}
            </p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/** Feed do LinkedIn — posts longos estilo feed profissional, 2 colunas. */
function LinkedinFeed({ posts, linkedinUrl }: { posts: LinkedinPostDisplay[]; linkedinUrl: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {posts.map((post, index) => (
        <Reveal
          key={post.permalinkUrl || post.texto.slice(0, 32) + index}
          as="article"
          delay={(index % 2) * 0.08}
          className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#1E1E22] bg-[#0D0D0F] transition-all duration-300 hover:border-[#2A2A30]"
        >
          {/* Header do post */}
          <div className="flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
              <Image
                src={faviconImg}
                alt="Infodive IT"
                className="h-6 w-6 object-contain"
              />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">
                Infodive IT
              </span>
              <span className="text-xs text-ink-500">
                Integradora de Tecnologia B2B
              </span>
              <span className="text-xs text-ink-500">{post.tempo}</span>
            </div>
            <a
              href={post.permalinkUrl || linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
            >
              <Image
                src={linkedinImg}
                alt="LinkedIn"
                className="h-5 w-5 object-contain opacity-80 transition-opacity hover:opacity-100"
              />
            </a>
          </div>

          {/* Texto */}
          <div className="px-5 pb-4">
            <p className="whitespace-pre-line text-sm leading-[1.6] text-[#BFBFBF] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:5] overflow-hidden">
              {post.texto}
            </p>
            {post.permalinkUrl && (
              <a
                href={post.permalinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand-light"
              >
                Ver publicação completa no LinkedIn
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Imagem opcional */}
          {(post.temImagem || post.imagemUrl) && (
            <div className="relative aspect-video w-full overflow-hidden bg-[#07090E]">
              {post.imagemUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.imagemUrl}
                  alt="LinkedIn Media"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                  <Image
                    src={faviconImg}
                    alt=""
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.07]"
                  />
                </>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="mt-auto flex items-center gap-6 border-t border-white/[0.06] px-5 py-3.5 text-ink-500">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-ink-300">
              <ThumbsUp className="h-4 w-4 text-brand" aria-hidden />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-2 text-sm transition-colors hover:text-ink-300">
              <MessageCircle className="h-4 w-4" aria-hidden />
              {post.comentarios}
            </span>
            {post.permalinkUrl ? (
              <a
                href={post.permalinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-ink-300"
              >
                <Repeat2 className="h-4 w-4" aria-hidden />
                Compartilhar
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm transition-colors hover:text-ink-300">
                <Repeat2 className="h-4 w-4" aria-hidden />
                Compartilhar
              </span>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
