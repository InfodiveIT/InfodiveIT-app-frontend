import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// O drawer de lead (GsapMenu) anima via GSAP, escondendo o formulário no jsdom.
// Mockamos o GSAP (no-op encadeável) para que os elementos do drawer fiquem
// acessíveis nas asserções.
jest.mock("gsap", () => {
  const chain: unknown = new Proxy(() => chain, {
    get: () => () => chain,
    apply: () => chain,
  });
  return {
    __esModule: true,
    default: {
      set: jest.fn(),
      timeline: jest.fn(() => chain),
      registerPlugin: jest.fn(),
      utils: { selector: () => () => [], toArray: () => [] },
    },
  };
});

import { Contact } from "../contact";

describe("Contact", () => {
  it("renderiza o eyebrow e o título da seção", () => {
    render(<Contact />);
    expect(screen.getByText("Contato")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /evoluir a/i }),
    ).toBeInTheDocument();
  });

  it("renderiza os canais de contato (e-mail e telefone) com links corretos", () => {
    render(<Contact />);
    expect(
      screen.getByRole("link", { name: "contato@infodive.com.br" }),
    ).toHaveAttribute("href", "mailto:contato@infodive.com.br");
    expect(
      screen.getByRole("link", { name: /3330-0444/ }),
    ).toHaveAttribute("href", "tel:555133300444");
  });

  it("renderiza o CTA que abre o formulário de especialista", () => {
    render(<Contact />);
    expect(
      screen.getByRole("button", { name: /falar com especialista/i }),
    ).toBeInTheDocument();
  });

  it("integra o drawer de lead (GsapMenu) com seu formulário", async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(
      screen.getByRole("button", { name: /falar com especialista/i }),
    );

    // O formulário do drawer está montado (botão de envio do GsapMenu presente).
    expect(
      screen.getByRole("button", { name: /solicitar contato/i }),
    ).toBeInTheDocument();
  });
});
