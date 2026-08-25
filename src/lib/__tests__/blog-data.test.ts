import {
  ARTIGOS,
  FILTROS,
  TIPO_CONFIG,
  getArtigoBySlug,
  getArtigosRelacionados,
  type TipoConteudo,
} from "../blog-data";

const TIPOS: TipoConteudo[] = [
  "artigo",
  "whitepaper",
  "case",
  "datasheet",
  "video",
];

describe("blog-data", () => {
  describe("TIPO_CONFIG", () => {
    it("cobre todos os tipos de conteúdo", () => {
      for (const tipo of TIPOS) {
        expect(TIPO_CONFIG[tipo]).toBeDefined();
        expect(TIPO_CONFIG[tipo].label).toBeTruthy();
        expect(TIPO_CONFIG[tipo].icon).toBeDefined();
      }
    });
  });

  describe("FILTROS", () => {
    it('inclui o filtro "todos" como primeira opção', () => {
      expect(FILTROS[0]).toEqual({ label: "Todos", value: "todos" });
    });

    it("possui um filtro para cada tipo de conteúdo", () => {
      const valores = FILTROS.map((f) => f.value);
      for (const tipo of TIPOS) {
        expect(valores).toContain(tipo);
      }
    });
  });

  describe("getArtigoBySlug() e getArtigosRelacionados()", () => {
    it("retorna undefined para slug inexistente quando vazio", () => {
      expect(getArtigoBySlug("nao-existe")).toBeUndefined();
    });

    it("retorna array vazio de relacionados quando ARTIGOS é vazio", () => {
      expect(getArtigosRelacionados("qualquer-slug")).toEqual([]);
    });
  });
});
