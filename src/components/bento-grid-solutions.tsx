"use client"

import * as React from "react"
import {
  Server,
  ShieldCheck,
  Cloud,
  BrainCircuit,
  Building2,
  HardDrive,
  Network,
  Database,
  Globe,
  Lock,
  KeyRound,
  FileCheck2,
  Activity,
  Laptop,
  Boxes,
} from "lucide-react"
import Image from "next/image"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { AnimatedBeam } from "@/components/animations/animated-beam"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import { cn } from "@/lib/utils"
import iaImage from "@/assets/bento-grid/inteligencia-artificial.webp"
import { api } from "@/lib/api"

const SECURITY_ICON_MAP: Record<string, any> = {
  shield: ShieldCheck,
  database: Database,
  lock: Lock,
  key: KeyRound,
  check: FileCheck2,
  activity: Activity,
  brain: BrainCircuit,
  server: Server,
  cloud: Cloud,
}

const resolveIcon = (iconName: string, defaultIcon: any) => {
  const name = (iconName || "").toLowerCase();
  if (name.includes("shield")) return ShieldCheck;
  if (name.includes("lock")) return Lock;
  if (name.includes("key")) return KeyRound;
  if (name.includes("check")) return FileCheck2;
  if (name.includes("activity")) return Activity;
  if (name.includes("brain")) return BrainCircuit;
  if (name.includes("server")) return Server;
  if (name.includes("cloud")) return Cloud;
  if (name.includes("database")) return Database;
  return defaultIcon;
};

// Nó circular (hub ou periférico). forwardRef para o AnimatedBeam conseguir medir
// sua posição e ancorar o feixe no centro do círculo.
const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex items-center justify-center rounded-full border border-ink-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
      className
    )}
  >
    {children}
  </div>
))
Circle.displayName = "Circle"

// RefObjects estáveis para uma lista de N nós (não dá pra chamar useRef em loop).
function useRefArray<T>(length: number) {
  const refs = React.useRef<React.RefObject<T>[]>([])
  if (refs.current.length !== length) {
    refs.current = Array.from(
      { length },
      (_, i) => refs.current[i] ?? React.createRef<T>()
    )
  }
  return refs.current
}

// Fundo animado de cada card: um hub central de marca, uma fonte à esquerda e uma
// coluna de serviços à direita, com feixes pulsando do hub para cada nó (estilo do
// print de "Integrations", porém monocromático/on-brand — sem logos coloridos).
function BeamBackground({
  center: Center,
  left: Left,
  right: rightIcons,
}: {
  center: React.ElementType
  left: React.ElementType
  right: React.ElementType[]
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const centerRef = React.useRef<HTMLDivElement>(null)
  const leftRef = React.useRef<HTMLDivElement>(null)
  const rightRefs = useRefArray<HTMLDivElement>(rightIcons.length)
  const mid = (rightIcons.length - 1) / 2

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-between px-8 pb-28 pt-8 [mask-image:linear-gradient(to_top,transparent_8%,#000_55%)]"
    >
      {/* Fonte (esquerda) */}
      <Circle ref={leftRef} className="size-11 border-ink-300">
        <Left className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
      </Circle>

      {/* Hub central (marca) */}
      <Circle ref={centerRef} className="size-16 border-brand/30 ring-4 ring-brand/5">
        <Center className="h-7 w-7 text-brand" strokeWidth={1.75} />
      </Circle>

      {/* Serviços (coluna direita) */}
      <div className="flex flex-col gap-3">
        {rightIcons.map((Icon, i) => (
          <Circle ref={rightRefs[i]} key={i} className="size-11">
            <Icon className="h-5 w-5 text-ink-500" strokeWidth={1.75} />
          </Circle>
        ))}
      </div>

      {/* Feixes: fonte → hub, e hub → cada serviço (com leve curvatura/escalonamento).
          Cores on-brand: trilho cinza claro + ponto luminoso no azul de marca. */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftRef}
        toRef={centerRef}
        duration={5}
        delay={0.2}
        pathColor="#D8D8D8"
        pathWidth={1.5}
        pathOpacity={0.7}
        gradientStartColor="#0E66FF"
        gradientStopColor="#001DFF"
      />
      {rightRefs.map((ref, i) => (
        <AnimatedBeam
          key={i}
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={ref}
          curvature={(i - mid) * 22}
          duration={4 + (i % 3)}
          delay={i * 0.45}
          pathColor="#D8D8D8"
          pathWidth={1.5}
          pathOpacity={0.7}
          gradientStartColor="#0E66FF"
          gradientStopColor="#001DFF"
        />
      ))}
    </div>
  )
}

// Card de Cloud: nuvem no centro com dois anéis de ícones de serviços orbitando
// (anel interno horário, externo anti-horário). Container centralizado é requisito
// do OrbitingCircles (os itens absolutos partem do centro).
function CloudOrbit() {
  return (
    <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_12%,#000_62%)]">
      {/* Hub central (marca) */}
      <div className="z-10 flex size-16 items-center justify-center rounded-full border border-brand/30 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-4 ring-brand/5">
        <Cloud className="h-7 w-7 text-brand" strokeWidth={1.75} />
      </div>

      {/* Anel interno */}
      <OrbitingCircles
        radius={66}
        duration={22}
        iconSize={36}
        className="border border-ink-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <Server className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <Database className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <Globe className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
      </OrbitingCircles>

      {/* Anel externo (sentido invertido, mais lento) */}
      <OrbitingCircles
        radius={120}
        duration={34}
        iconSize={36}
        reverse
        className="border border-ink-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      >
        <Boxes className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <Laptop className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <ShieldCheck className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <Network className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
      </OrbitingCircles>
    </div>
  )
}

// Eventos no estilo "feed de SOC" — passam num marquee desfocado; ao passar o mouse,
// o item sob o cursor fica nítido e a esteira pausa (efeito do 1º card do Magic UI).
const securityEvents = [
  {
    Icon: ShieldCheck,
    title: "Ameaça bloqueada",
    body: "Ataque Ransomware contido com sucesso no endpoint SRV-03 antes de comprometer dados da operação.",
  },
  {
    Icon: Database,
    title: "Backup concluído",
    body: "Snapshot diário concluído às 02:00. 2,4 TB de dados criptografados e replicados de forma segura na nuvem.",
  },
  {
    Icon: Lock,
    title: "Volume criptografado",
    body: "Protocolo AES-256 ativo em 100% dos discos da operação, garantindo proteção total de dados em repouso.",
  },
  {
    Icon: KeyRound,
    title: "Login barrado por MFA",
    body: "Tentativa de acesso por IP externo suspeito bloqueada de forma preventiva através de autenticação MFA.",
  },
  {
    Icon: FileCheck2,
    title: "Conformidade LGPD",
    body: "Políticas de governança e retenção de logs aplicadas para total conformidade e proteção de dados pessoais.",
  },
  {
    Icon: Activity,
    title: "Monitoramento 24/7",
    body: "142 endpoints monitorados ativamente em tempo integral. Zero incidentes nas últimas 24 horas de operação.",
  },
]

function SecurityMarquee({ events = securityEvents }: { events?: any[] }) {
  return (
    <div className="absolute inset-x-0 top-6 [mask-image:linear-gradient(to_top,transparent_18%,#000_60%)]">
      {/* Esteira: conteúdo duplicado + translateX(-50%) (animate-marquee) = loop contínuo.
          group-hover pausa a animação ao passar o mouse no card. */}
      <div className="flex w-max animate-marquee items-start gap-4 px-4 group-hover:[animation-play-state:paused]">
        {[...events, ...events].map(({ Icon, title, body }, i) => (
          <figure
            key={i}
            className={cn(
              "relative h-[210px] w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-ink-200 bg-white p-3",
              "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
              // desfocado por padrão; nítido no hover do próprio item
              "transform-gpu blur-[1.5px] transition-all duration-300 ease-out hover:border-ink-300 hover:blur-none"
            )}
          >
            {/* Marca d'água preenche a altura do card sem poluir */}
            <Icon
              className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-ink-200/60"
              strokeWidth={1}
            />
            <div className="relative z-10 flex items-center gap-2">
              <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.75} />
              <figcaption className="text-sm font-semibold text-ink-950">
                {title}
              </figcaption>
            </div>
            <blockquote className="relative z-10 mt-2 text-[13px] leading-snug text-ink-500">
              {body}
            </blockquote>
          </figure>
        ))}
      </div>
    </div>
  )
}

const features = [
  {
    Icon: ShieldCheck,
    name: "Segurança & Proteção de Dados",
    description: "Cibersegurança, backup e recuperação para manter a operação sempre de pé.",
    href: "/solucoes/seguranca",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-1",
    background: <SecurityMarquee />,
  },
  {
    Icon: Server,
    name: "Infraestrutura",
    description: "Servidores, storage e redes de alta performance para cargas críticas.",
    href: "/solucoes/infraestrutura",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-2",
    background: (
      <BeamBackground
        center={Server}
        left={Building2}
        right={[HardDrive, Network, Database, Boxes]}
      />
    ),
  },
  {
    Icon: BrainCircuit,
    name: "Inteligência Artificial",
    description: "IA aplicada ao negócio, integrada à sua infraestrutura.",
    href: "/solucoes/inteligencia-artificial",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0">
        <Image
          src={iaImage}
          alt="Inteligência Artificial"
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover object-center transition-transform duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_22%,#000_85%)] group-hover:scale-105 lg:object-contain lg:object-right"
        />
      </div>
    ),
  },
  {
    Icon: Cloud,
    name: "Cloud",
    description: "Migração, gestão e otimização de nuvem pública, privada e híbrida.",
    href: "/solucoes/cloud",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-1",
    background: <CloudOrbit />,
  },
]

export type BentoGridSolutionsProps = {
  initialMarqueeEvents?: any[]
  initialBentoData?: any[]
}

export function BentoGridSolutions({ initialMarqueeEvents, initialBentoData }: BentoGridSolutionsProps = {}) {
  const [marqueeEvents, setMarqueeEvents] = React.useState<any[]>(
    initialMarqueeEvents && initialMarqueeEvents.length > 0 ? initialMarqueeEvents : securityEvents
  )
  const [bentoData, setBentoData] = React.useState<any>(initialBentoData ?? null)

  React.useEffect(() => {
    if (initialMarqueeEvents && initialBentoData) return;

    if (!initialMarqueeEvents) {
      api.homeSegurancaMarquee()
        .then((data) => {
          if (data && data.length > 0) {
            const sorted = [...data].sort((a, b) => a.ordem - b.ordem);
            setMarqueeEvents(sorted.map((item) => {
              const IconComponent = SECURITY_ICON_MAP[item.icone || ""] || ShieldCheck;
              return {
                Icon: IconComponent,
                title: item.titulo,
                body: item.corpo,
              };
            }));
          }
        })
        .catch(() => { /* fallback */ });
    }

    if (!initialBentoData) {
      api.homeSolucoesBento()
        .then((data) => {
          if (data && data.length > 0) {
            setBentoData(data);
          }
        })
        .catch(() => { /* fallback */ });
    }
  }, [initialMarqueeEvents, initialBentoData])

  const dynamicFeatures = React.useMemo(() => {
    if (!bentoData || bentoData.length === 0) {
      const list = [...features];
      list[0] = {
        ...list[0],
        background: <SecurityMarquee events={marqueeEvents} />,
      };
      return list;
    }

    const sorted = [...bentoData].sort((a, b) => a.ordem - b.ordem);

    return sorted.map((item: any) => {
      const iconeLower = (item.icone || "").toLowerCase();

      if (iconeLower.includes("shield") || iconeLower.includes("lock")) {
        const iconComponent = resolveIcon(item.icone, ShieldCheck);
        
        let marqueeList = marqueeEvents;
        if (item.textoCarrossel && item.textoCarrossel.trim() !== "") {
          const lines = item.textoCarrossel.split("\n");
          const parsed = lines
            .map((line: string) => {
              let cleanLine = line.trim();
              if (cleanLine.startsWith("'") && cleanLine.endsWith("'")) {
                cleanLine = cleanLine.substring(1, cleanLine.length - 1).trim();
              }
              if (cleanLine === "") return null;

              const parts = cleanLine.split("|");
              if (parts.length >= 2) {
                const itemIconName = parts[0].trim();
                const itemIcon = resolveIcon(itemIconName, ShieldCheck);
                const itemTitle = parts[1].trim();
                const itemBody = parts.slice(2).join("|").trim();
                return {
                  Icon: itemIcon,
                  title: itemTitle,
                  body: itemBody || "",
                };
              }
              const partsColon = cleanLine.split(":");
              if (partsColon.length >= 2) {
                return {
                  Icon: ShieldCheck,
                  title: partsColon[0].trim(),
                  body: partsColon.slice(1).join(":").trim(),
                };
              }
              return null;
            })
            .filter(Boolean) as any[];

          if (parsed.length > 0) {
            marqueeList = parsed;
          }
        }

        const cardHref = item.solucaoSlug ? `/solucoes/${item.solucaoSlug}` : "/solucoes";

        return {
          Icon: iconComponent,
          name: item.nome,
          description: item.descricao,
          href: cardHref,
          cta: "Saiba mais",
          className: "col-span-3 lg:col-span-1",
          background: <SecurityMarquee events={marqueeList} />,
        };
      }

      const cardHref = item.solucaoSlug ? `/solucoes/${item.solucaoSlug}` : "/solucoes";

      if (iconeLower.includes("server")) {
        const iconComponent = resolveIcon(item.icone, Server);
        return {
          Icon: iconComponent,
          name: item.nome,
          description: item.descricao,
          href: cardHref,
          cta: "Saiba mais",
          className: "col-span-3 lg:col-span-2",
          background: (
            <BeamBackground
              center={Server}
              left={Building2}
              right={[HardDrive, Network, Database, Boxes]}
            />
          ),
        };
      }

      if (iconeLower.includes("brain")) {
        const iconComponent = resolveIcon(item.icone, BrainCircuit);
        const bgImage = item.imagemIaUrl || iaImage;
        return {
          Icon: iconComponent,
          name: item.nome,
          description: item.descricao,
          href: cardHref,
          cta: "Saiba mais",
          className: "col-span-3 lg:col-span-2",
          background: (
            <div className="absolute inset-0">
              <Image
                src={bgImage}
                alt={item.nome}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center transition-transform duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_22%,#000_85%)] group-hover:scale-105 lg:object-contain lg:object-right"
                unoptimized={typeof bgImage === 'string'}
              />
            </div>
          ),
        };
      }

      if (iconeLower.includes("cloud")) {
        const iconComponent = resolveIcon(item.icone, Cloud);
        return {
          Icon: iconComponent,
          name: item.nome,
          description: item.descricao,
          href: cardHref,
          cta: "Saiba mais",
          className: "col-span-3 lg:col-span-1",
          background: <CloudOrbit />,
        };
      }

      const defaultIcon = resolveIcon(item.icone, Server);
      return {
        Icon: defaultIcon,
        name: item.nome,
        description: item.descricao,
        href: cardHref,
        cta: "Saiba mais",
        className: "col-span-3 lg:col-span-1",
        background: null,
      };
    });
  }, [bentoData, marqueeEvents]);

  return (
    <BentoGrid>
      {dynamicFeatures.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}
