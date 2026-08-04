import {
  BookOpen,
  FileText,
  Play,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type TipoConteudo =
  | "artigo"
  | "whitepaper"
  | "case"
  | "datasheet"
  | "video";

/** Blocos do corpo do conteúdo — espelham um rich text simples vindo do backend. */
export type ArtigoBloco =
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "citacao"; texto: string };

export type ArtigoProduto = {
  id: string;
  nome: string;
  slug: string;
  descricaoCurta?: string;
  imagemUrl?: string;
  fabricanteNome?: string;
  categoriaNome?: string;
};

export type Artigo = {
  slug: string;
  tipo: TipoConteudo;
  categoria: string;
  fabricante: string;
  titulo: string;
  descricao: string;
  data: string;
  imagemBg: string;
  imagemUrl?: string;
  urlExterna?: string;
  autor: string;
  tempoLeitura: string;
  conteudo: ArtigoBloco[];
  produto?: ArtigoProduto;
};

/** Configuração visual por tipo: rótulo, cores do badge e ícone temático. */
export const TIPO_CONFIG: Record<
  TipoConteudo,
  { label: string; bg: string; color: string; icon: LucideIcon }
> = {
  artigo: { label: "Artigo", bg: "#E4EAFF", color: "#0E66FF", icon: FileText },
  whitepaper: {
    label: "Whitepaper",
    bg: "#F0F0F0",
    color: "#7B7B7B",
    icon: BookOpen,
  },
  case: { label: "Case", bg: "#E8F8F4", color: "#46BEA3", icon: TrendingUp },
  datasheet: {
    label: "Datasheet",
    bg: "#FFF7E6",
    color: "#BA7517",
    icon: Sparkles,
  },
  video: { label: "Vídeo", bg: "#FFE8E8", color: "#C0001A", icon: Play },
};

export const FILTROS: { label: string; value: TipoConteudo | "todos" }[] = [
  { label: "Todos", value: "todos" },
  { label: "Artigos", value: "artigo" },
  { label: "Whitepapers", value: "whitepaper" },
  { label: "Cases", value: "case" },
  { label: "Datasheets", value: "datasheet" },
  { label: "Vídeos", value: "video" },
];

export const ARTIGOS: Artigo[] = [];

export function getArtigoBySlug(slug: string): Artigo | undefined {
  return ARTIGOS.find((a) => a.slug === slug);
}

export function getArtigosRelacionados(slug: string, limite = 3): Artigo[] {
  return ARTIGOS.filter((a) => a.slug !== slug).slice(0, limite);
}
