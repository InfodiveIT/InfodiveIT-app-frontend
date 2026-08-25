"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShieldCheck, Cpu } from "lucide-react";
import logoImg from "@/assets/logo/Logo Infodive 3.png";
import facebookImg from "@/assets/footer/facebook.png";
import facebookColorImg from "@/assets/footer/facebook-colorfull.png";
import instagramImg from "@/assets/footer/instagram.png";
import instagramColorImg from "@/assets/footer/instagram-colorfull.png";
import linkedinImg from "@/assets/footer/linkedin.png";
import linkedinColorImg from "@/assets/footer/linkedin-colorfull.png";

gsap.registerPlugin(ScrollTrigger);

export type FooterLinkItem = { nome: string; href: string }

export type FooterProps = {
  initialConfig?: {
    urlLinkedin?: string
    urlInstagram?: string
    urlFacebook?: string
    descricaoEmpresa?: string
  }
  initialSolucoes?: FooterLinkItem[]
  initialProdutos?: FooterLinkItem[]
}

const DEFAULT_SOLUCOES_LIST: FooterLinkItem[] = [
  { nome: "Infraestrutura", href: "/solucoes/infraestrutura" },
  { nome: "Segurança Cibernética", href: "/solucoes/seguranca" },
  { nome: "Cloud & Virtualização", href: "/solucoes/cloud" },
  { nome: "Inteligência Artificial", href: "/solucoes/inteligencia-artificial" },
]

const DEFAULT_PRODUTOS_LIST: FooterLinkItem[] = [
  { nome: "Monitoramento NOC", href: "/produtos" },
  { nome: "Backup Cloud", href: "/produtos" },
  { nome: "Firewall Next-Gen", href: "/produtos" },
  { nome: "Servidores Dedicados", href: "/produtos" },
]

export function Footer({ initialConfig, initialSolucoes, initialProdutos }: FooterProps = {}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const [urlLinkedin, setUrlLinkedin] = useState(initialConfig?.urlLinkedin || "https://www.linkedin.com/company/infodiveit/posts/?feedView=all");
  const [urlInstagram, setUrlInstagram] = useState(initialConfig?.urlInstagram || "https://www.instagram.com/infodiveit/");
  const [urlFacebook, setUrlFacebook] = useState(initialConfig?.urlFacebook || "https://www.facebook.com/InfodiveIt");
  const [descricaoEmpresa, setDescricaoEmpresa] = useState<string | null>(initialConfig?.descricaoEmpresa || null);

  const [solucoesList, setSolucoesList] = useState<FooterLinkItem[]>(
    initialSolucoes && initialSolucoes.length > 0 ? initialSolucoes : DEFAULT_SOLUCOES_LIST
  );

  const [produtosList, setProdutosList] = useState<FooterLinkItem[]>(
    initialProdutos && initialProdutos.length > 0 ? initialProdutos : DEFAULT_PRODUTOS_LIST
  );

  useEffect(() => {
    if (initialConfig && initialSolucoes && initialProdutos) return;

    if (!initialConfig) {
      api.configFooter()
        .then((data) => {
          if (data.urlLinkedin) setUrlLinkedin(data.urlLinkedin);
          if (data.urlInstagram) setUrlInstagram(data.urlInstagram);
          if (data.urlFacebook) setUrlFacebook(data.urlFacebook);
          if (data.descricaoEmpresa) setDescricaoEmpresa(data.descricaoEmpresa);
        })
        .catch(() => { /* mantém fallback */ });
    }

    if (!initialSolucoes) {
      api.solucoes()
        .then((data) => {
          if (data && data.length > 0) {
            const first4 = [...data]
              .filter((s) => s.ativo)
              .sort((a, b) => a.ordem - b.ordem)
              .slice(0, 4)
              .map((s) => ({
                nome: s.nome,
                href: `/solucoes/${s.slug}`,
              }));
            if (first4.length > 0) {
              setSolucoesList(first4);
            }
          }
        })
        .catch(() => { /* mantém fallback */ });
    }

    if (!initialProdutos) {
      api.produtos({ size: 4 })
        .then((page) => {
          if (page && page.content && page.content.length > 0) {
            const first4 = page.content.slice(0, 4).map((p) => ({
              nome: p.nome,
              href: `/produtos/${p.slug}`,
            }));
            setProdutosList(first4);
          }
        })
        .catch(() => { /* mantém fallback */ });
    }
  }, [initialConfig, initialSolucoes, initialProdutos]);

  // Reveal por parallax — APENAS no desktop (lg+).
  // Recalcula ScrollTrigger sempre que o pathname mudar (ex: ao ir para /sobre)
  useEffect(() => {
    if (!footerRef.current || !containerRef.current) return;

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      gsap.fromTo(
        footerRef.current,
        { yPercent: -30 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450);

    return () => {
      mm.revert();
      clearTimeout(timer);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative w-full">
      <footer
        ref={footerRef}
        className="relative w-full z-10 text-white overflow-hidden flex flex-col justify-end footer-wrap"
      style={{
        background:
          "linear-gradient(to bottom, rgba(8,3,16,0.55) 0%, #050507 72%), linear-gradient(135deg, #6F0101 0%, #3B1F59 50%, #063FB4 100%)",
      }}
    >
      {/* Decorative background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-75"></div>
      </div>

      <div className="relative z-10 w-full mx-auto max-w-[1600px] px-6 md:px-10 pt-20 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
            {/* Logo and About Section */}
            <div className="lg:col-span-5 flex flex-col items-start gap-6">
              <Image
                src={logoImg}
                alt="Infodive Logo"
                className="h-[38px] w-auto object-contain ml-[-10px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                priority
              />
              <p className="text-white/60 text-sm max-w-md leading-relaxed">
                {descricaoEmpresa || "Consultoria e infraestrutura de TI avançada para empresas em expansão. Projetando a segurança, estabilidade e inteligência do seu amanhã."}
              </p>

              {/* Badge/Certifications simulation */}
              <div className="flex gap-4 items-center text-white/50 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-teal" />
                  <span>NOC 24/7 Ativo</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Cpu className="h-4 w-4 text-brand" />
                  <span>Cloud Integrada</span>
                </div>
              </div>
            </div>

            {/* Links Columns (Equal distribution & spacing) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 items-start pt-2 lg:pt-0">
              {/* Soluções */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold tracking-wider text-white uppercase">
                  Soluções
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm text-white/55">
                  {solucoesList.map((sol) => {
                    const words = sol.nome ? sol.nome.trim().split(/\s+/) : [];
                    const displayName = words.length > 1 ? `${words[0]}...` : sol.nome;
                    return (
                      <li key={sol.href + sol.nome}>
                        <Link
                          href={sol.href}
                          title={sol.nome}
                          className="hover:text-white hover:translate-x-1 transition-all duration-200 block truncate"
                        >
                          {displayName}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Produtos */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold tracking-wider text-white uppercase">
                  Produtos
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm text-white/55">
                  {produtosList.map((prod) => (
                    <li key={prod.href + prod.nome}>
                      <Link
                        href={prod.href}
                        className="hover:text-white hover:translate-x-1 transition-all duration-200 block truncate"
                      >
                        {prod.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Empresa */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold tracking-wider text-white uppercase">
                  Empresa
                </h4>
                <ul className="flex flex-col gap-2.5 text-sm text-white/55">
                  <li>
                    <Link
                      href="/sobre"
                      className="hover:text-white hover:translate-x-1 transition-all duration-200 block"
                    >
                      Sobre Nós
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#cases"
                      className="hover:text-white hover:translate-x-1 transition-all duration-200 block"
                    >
                      Casos de Sucesso
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="hover:text-white hover:translate-x-1 transition-all duration-200 block"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#contact"
                      className="hover:text-white hover:translate-x-1 transition-all duration-200 block"
                    >
                      Fale Conosco
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 text-xs text-white/40">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <span>
                &copy; {new Date().getFullYear()} Infodive Tecnologia Ltda.
              </span>
              <span className="hidden md:inline text-white/10">|</span>
              <Link
                href="/politica-de-privacidade"
                className="hover:text-white transition-colors duration-200"
              >
                Política de Privacidade
              </Link>
              <span className="hidden md:inline text-white/10">|</span>
              <Link
                href="/termos-de-uso"
                className="hover:text-white transition-colors duration-200"
              >
                Termos de Uso
              </Link>
              <span className="hidden md:inline text-white/10">|</span>
              <Link
                href="/politica-de-cookies"
                className="hover:text-white transition-colors duration-200"
              >
                Política de Cookies
              </Link>
            </div>

            {/* Social Media links */}
            <div className="flex gap-5">
              <a
                href={urlLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group block h-5 w-5"
                aria-label="LinkedIn"
              >
                <Image
                  src={linkedinImg}
                  alt="LinkedIn"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
                />
                <Image
                  src={linkedinColorImg}
                  alt="LinkedIn"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href={urlInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group block h-5 w-5"
                aria-label="Instagram"
              >
                <Image
                  src={instagramImg}
                  alt="Instagram"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
                />
                <Image
                  src={instagramColorImg}
                  alt="Instagram"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href={urlFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group block h-5 w-5"
                aria-label="Facebook"
              >
                <Image
                  src={facebookImg}
                  alt="Facebook"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
                />
                <Image
                  src={facebookColorImg}
                  alt="Facebook"
                  className="absolute inset-0 h-5 w-5 object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
