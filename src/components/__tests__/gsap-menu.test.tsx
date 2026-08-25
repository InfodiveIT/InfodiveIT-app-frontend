import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// O GsapMenu usa GSAP para animar o drawer, definindo visibility:hidden no
// container — o que zera o nome acessível dos campos no jsdom. Mockamos o GSAP
// (no-op encadeável) para testar apenas a lógica do formulário (Zod + LGPD).
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

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return {
    ...actual,
    api: {
      ...actual.api,
      enviarLead: jest.fn().mockImplementation(() => new Promise(() => {})),
    },
  };
});

import { GsapMenu } from "../GsapMenu";

function renderMenu() {
  const onToggle = jest.fn();
  render(<GsapMenu isOpen onToggle={onToggle} />);
  return { onToggle };
}

async function preencherFormularioValido(
  user: ReturnType<typeof userEvent.setup>,
) {
  await user.type(screen.getByPlaceholderText("Nome"), "João");
  await user.type(screen.getByPlaceholderText("Sobrenome"), "Silva");
  await user.type(screen.getByPlaceholderText("E-mail"), "joao@example.com");
  await user.type(
    screen.getByPlaceholderText("(00) 00000-0000"),
    "51999999999",
  );
  await user.type(screen.getByPlaceholderText("Nome da empresa"), "Infodive");
  await user.type(
    screen.getByPlaceholderText("Digite sua mensagem..."),
    "Preciso de uma análise de infraestrutura.",
  );
}

describe("GsapMenu (formulário de lead)", () => {
  it("renderiza todos os campos do formulário", () => {
    renderMenu();
    expect(screen.getByPlaceholderText("Nome")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sobrenome")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("(00) 00000-0000"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nome da empresa")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Digite sua mensagem..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /termos/i })).toBeInTheDocument();
  });

  it("exibe erros de validação ao enviar vazio", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: /solicitar contato/i }));

    expect(await screen.findByText("Informe seu nome.")).toBeInTheDocument();
    expect(screen.getByText("Informe seu sobrenome.")).toBeInTheDocument();
    expect(screen.getByText("Informe seu e-mail.")).toBeInTheDocument();
    expect(
      screen.getByText("É necessário aceitar os termos."),
    ).toBeInTheDocument();
  });

  it("valida o formato do e-mail", async () => {
    const user = userEvent.setup();
    renderMenu();

    await preencherFormularioValido(user);
    await user.clear(screen.getByPlaceholderText("E-mail"));
    await user.type(screen.getByPlaceholderText("E-mail"), "email-invalido");
    await user.click(screen.getByRole("checkbox", { name: /termos/i }));
    await user.click(screen.getByRole("button", { name: /solicitar contato/i }));

    expect(
      await screen.findByText("Digite um e-mail válido."),
    ).toBeInTheDocument();
  });

  it("não envia sem o consentimento LGPD", async () => {
    const user = userEvent.setup();
    const { onToggle } = renderMenu();

    await preencherFormularioValido(user);
    // Deixa o checkbox de termos desmarcado de propósito.
    await user.click(screen.getByRole("button", { name: /solicitar contato/i }));

    expect(
      await screen.findByText("É necessário aceitar os termos."),
    ).toBeInTheDocument();
    // Continua em "idle": o botão não virou "Enviando..." e o menu não fechou.
    expect(
      screen.getByRole("button", { name: /solicitar contato/i }),
    ).toBeInTheDocument();
    expect(onToggle).not.toHaveBeenCalledWith(false);
  });

  it("entra em estado de envio quando o formulário é válido e consentido", async () => {
    const user = userEvent.setup();
    renderMenu();

    await preencherFormularioValido(user);
    await user.click(screen.getByRole("checkbox", { name: /termos/i }));
    await user.click(screen.getByRole("button", { name: /solicitar contato/i }));

    expect(
      await screen.findByRole("button", { name: /enviando/i }),
    ).toBeInTheDocument();
  });
});
