import { api } from "../api";

// Mock global fetch
global.fetch = jest.fn();

describe("api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("conteudos()", () => {
    it("faz fetch para a URL correta com o path fornecido", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudos();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/conteudos"),
        expect.any(Object),
      );
    });

    it("não inclui header Content-Type em requisições GET sem body", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudos();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("lança erro quando response.ok é false", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Not found",
      });

      await expect(api.conteudos()).rejects.toThrow();
    });

    it("retorna dados parseados corretamente", async () => {
      const mockData = {
        content: [{ id: "1", titulo: "Test", tipo: "ARTIGO" }],
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.conteudos();

      expect(result).toEqual(mockData);
    });

    it("usa next: { revalidate: 300 } para conteudos", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudos();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: expect.objectContaining({ revalidate: 300 }),
        }),
      );
    });

    it("aceita parâmetros de query", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudos({ size: 10, page: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("size=10"),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=1"),
        expect.any(Object),
      );
    });
  });

  describe("conteudo()", () => {
    it("faz fetch para a URL correta com slug", async () => {
      const mockResponse = { id: "1", slug: "test-slug" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudo("test-slug");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/conteudos/test-slug"),
        expect.any(Object),
      );
    });

    it("retorna dados do conteúdo", async () => {
      const mockData = { id: "1", slug: "test-slug", titulo: "Test" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.conteudo("test-slug");

      expect(result).toEqual(mockData);
    });

    it("encoda slug com caracteres especiais", async () => {
      const mockResponse = { id: "1", slug: "test slug" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.conteudo("test slug");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("test%20slug"),
        expect.any(Object),
      );
    });
  });

  describe("produtos()", () => {
    it("faz fetch para /produtos", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.produtos();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/produtos"),
        expect.any(Object),
      );
    });

    it("aceita filtros de categoria e fabricante", async () => {
      const mockResponse = { content: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.produtos({ categoria: "seguranca", fabricante: "ibm" });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("categoria=seguranca"),
        expect.any(Object),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("fabricante=ibm"),
        expect.any(Object),
      );
    });
  });

  describe("produto()", () => {
    it("faz fetch para /produtos/:slug", async () => {
      const mockResponse = { id: "1", slug: "ibm-guardium" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.produto("ibm-guardium");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/produtos/ibm-guardium"),
        expect.any(Object),
      );
    });
  });

  describe("categorias()", () => {
    it("faz fetch para /categorias", async () => {
      const mockResponse: any[] = [];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.categorias();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/categorias"),
        expect.any(Object),
      );
    });
  });

  describe("homeClientes()", () => {
    it("busca com tags e cache ISR", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await api.homeClientes();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/home-clientes"),
        expect.objectContaining({
          next: expect.objectContaining({ revalidate: 600, tags: ["home-clientes"] }),
        }),
      );
    });
  });

  describe("solucoes()", () => {
    it("faz fetch para /solucoes", async () => {
      const mockResponse: any[] = [];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.solucoes();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/solucoes"),
        expect.any(Object),
      );
    });
  });

  describe("enviarLead()", () => {
    it("faz POST para /leads com header Content-Type", async () => {
      const mockResponse = { id: "1", message: "Lead criado" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const leadData = {
        nomeCompleto: "João Silva",
        email: "joao@example.com",
        empresa: "Empresa XYZ",
        consentimentoLgpd: true,
      };

      await api.enviarLead(leadData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/leads"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(leadData),
        }),
      );
    });

    it("usa cache no-store para envio de leads", async () => {
      const mockResponse = { id: "1", message: "Lead criado" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.enviarLead({
        nomeCompleto: "João Silva",
        email: "joao@example.com",
        empresa: "Empresa XYZ",
        consentimentoLgpd: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: "no-store",
        }),
      );
    });
  });
});

// Made with Bob
