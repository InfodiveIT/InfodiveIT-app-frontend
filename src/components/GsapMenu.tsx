"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { createPortal } from "react-dom";
import gsap from "gsap";
import Image from "next/image";
import { z } from "zod";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import infodiveLogo from "@/assets/logo/Logo infodive.webp";
import iconContact from "@/assets/logo/Icon contact.png";

// Validação client-side (a validação final é responsabilidade do backend)
const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Informe seu nome."),
  lastName: z.string().trim().min(1, "Informe seu sobrenome."),
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Digite um e-mail válido."),
  phone: z.string().trim().min(1, "Informe seu celular."),
  company: z.string().trim().min(1, "Informe o nome da empresa."),
  message: z.string().trim().min(1, "Conte pra gente o que você precisa."),
  agreeToTerms: z.boolean().refine((v) => v, { message: "É necessário aceitar os termos." }),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

// Mensagem de erro sutil exibida abaixo de um campo
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </p>
  );
}

// Mascara automatica para o campo de Celular iniciando no DDD com +55 fixo
function formatPhoneFromDDD(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface GsapMenuProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  exitSpeed?: number;
  easeReverse?: boolean;
}

export function GsapMenu({
  isOpen,
  onToggle,
  exitSpeed = 1,
  easeReverse = true,
}: GsapMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTlRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const EMAIL_ADRESS = "contato@infodive.com.br";
  // Form states based on reference image
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  // Remove o erro de um campo assim que o usuário começa a corrigi-lo
  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  // Re-build/initialize the GSAP timeline
  useEffect(() => {
    if (!containerRef.current) return;

    // Standard GSAP selector helper scoped to this component's container
    const q = gsap.utils.selector(containerRef);

    // If there is an existing timeline, revert it to avoid duplicates
    if (tlRef.current) {
      tlRef.current.revert();
    }

    // Set initial states
    gsap.set(q("#nav"), { visibility: "hidden" });
    gsap.set(q(".nav-bg"), { opacity: 0 });
    gsap.set(q(".nav-login"), { opacity: 0, y: 8 });

    const er = (val: string | boolean) => {
      return easeReverse ? val || true : false;
    };

    // Create the GSAP timeline
    const tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        gsap.set(q("#nav"), { visibility: "hidden", pointerEvents: "none" });
      },
    });
    tlRef.current = tl;

    tl.set(q("#nav"), { visibility: "visible", pointerEvents: "auto" })
      // ═══ ENTER ═══
      .to(
        q(".nav-bg"),
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          easeReverse: er("power4.out"),
        },
        0
      )
      .fromTo(
        q(".nav-panel"),
        { x: "110%", y: 0, rotation: 0 },
        {
          x: "0%",
          y: 0,
          duration: 0.6,
          ease: "back.out",
          easeReverse: er("power3.in"),
          stagger: 0.1,
        },
        0
      )
      .fromTo(
        q(".nav-item"),
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "expo.out",
          easeReverse: er("power3.in"),
          stagger: 0.03,
        },
        0.1
      )
      .to(
        q(".nav-login"),
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out",
          easeReverse: er("power4.out"),
        },
        0.4
      );

    // Clean up timeline on unmount
    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
      }
      if (closeTlRef.current) {
        closeTlRef.current.kill();
      }
    };
  }, [easeReverse, mounted]);

  // Handle open/close
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    if (isOpen) {
      // Cancela um fechamento em andamento e (re)inicia a entrada do começo
      closeTlRef.current?.kill();
      closeTlRef.current = null;
      tl.timeScale(1).play(0);
    } else {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      // Fechamento dedicado: o painel sai IMEDIATAMENTE. Com reverse() o painel só
      // se movia depois de reverter todo o conteúdo (que entra por último), causando
      // o delay percebido entre o clique e a saída do painel.
      tl.pause();
      closeTlRef.current?.kill();
      const closeTl = gsap.timeline({
        onComplete: () => {
          gsap.set(q("#nav"), { visibility: "hidden", pointerEvents: "none" });
        },
      });
      closeTl
        .to(q(".nav-item"), { opacity: 0, duration: 0.12, ease: "power1.in" }, 0)
        .to(q(".nav-login"), { opacity: 0, duration: 0.12, ease: "power1.in" }, 0)
        .to(q(".nav-panel"), { x: "110%", duration: 0.45, ease: "power3.in", stagger: 0.05 }, 0)
        .to(q(".nav-bg"), { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.05);
      closeTl.timeScale(exitSpeed);
      closeTlRef.current = closeTl;
    }
  }, [isOpen, exitSpeed, mounted]);

  // Escape key handler to close the menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onToggle(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Checklist handler
  const handleTechChange = (tech: string) => {
    setTechnologies((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      company,
      message,
      agreeToTerms,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    api.enviarLead({
      nomeCompleto: `${firstName} ${lastName}`.trim(),
      email,
      telefone: phone ? `+55 ${phone}` : undefined,
      empresa: company,
      cargo: role || undefined,
      mensagem: message || undefined,
      consentimentoLgpd: agreeToTerms,
    })
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          onToggle(false);
          setTimeout(() => {
            setStatus("idle");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setCompany("");
            setRole("");
            setTechnologies([]);
            setMessage("");
            setAgreeToTerms(false);
            setErrors({});
          }, 1000);
        }, 5000);
      })
      .catch(() => {
        setStatus("error");
      });
  };

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} className="gsap-menu-theme">
      {/* Nav Overlay Drawer */}
      <div className="nav" id="nav">
        <div className="nav-bg" onClick={() => onToggle(false)}></div>

        {/* Top panel — Form Drawer Card */}
        <div 
          className="nav-top nav-border nav-panel" 
          id="navTop" 
          data-lenis-prevent
          style={{ 
            maxWidth: "700px", 
            display: "flex", 
            flexDirection: "column",
            background: "#FFFFFF",
            color: "#141413"
          }}
        >
          <div className="relative w-full flex flex-col pt-1 pb-2 px-2 sm:px-4 md:px-6">
            
            {/* Header Area */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="pr-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                  Falar com vendas
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed font-normal">
                  Tem uma pergunta? Fale com um especialista e tire todas as suas dúvidas sobre a plataforma.
                </p>
              </div>
              
              {/* Close Button X at the top right */}
              <button
                type="button"
                onClick={() => onToggle(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full cursor-pointer -mt-1 -mr-1"
                aria-label="Fechar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
                <div className="w-14 h-14 bg-[#E4EAFF] text-[#0E66FF] rounded-full flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Mensagem enviada com sucesso!</h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                  Obrigado pelo contato, {firstName}. Nossos consultores retornarão em até 1 hora.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:gap-4 text-left text-gray-900 font-sans">

                {/* Nome & Sobrenome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nome <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      aria-invalid={!!errors.firstName}
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                      placeholder="Nome"
                      className={cn(
                        "w-full px-3.5 h-10 sm:h-11 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 bg-white text-gray-900 transition-all",
                        errors.firstName && "field-error"
                      )}
                      disabled={status === "submitting"}
                    />
                    <FieldError message={errors.firstName} />
                  </div>
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Sobrenome <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      aria-invalid={!!errors.lastName}
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); clearError("lastName"); }}
                      placeholder="Sobrenome"
                      className={cn(
                        "w-full px-3.5 h-10 sm:h-11 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 bg-white text-gray-900 transition-all",
                        errors.lastName && "field-error"
                      )}
                      disabled={status === "submitting"}
                    />
                    <FieldError message={errors.lastName} />
                  </div>
                </div>

                {/* E-mail & Celular */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      E-mail <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      aria-invalid={!!errors.email}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                      placeholder="E-mail"
                      className={cn(
                        "w-full px-3.5 h-10 sm:h-11 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 bg-white text-gray-900 transition-all",
                        errors.email && "field-error"
                      )}
                      disabled={status === "submitting"}
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Celular <span className="text-danger">*</span>
                    </label>
                    <div className="flex items-center w-full">
                      <span className="h-10 sm:h-11 px-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs sm:text-sm font-semibold text-gray-600 flex items-center shrink-0 select-none">
                        +55
                      </span>
                      <input
                        type="tel"
                        required
                        aria-invalid={!!errors.phone}
                        value={phone}
                        onChange={(e) => { setPhone(formatPhoneFromDDD(e.target.value)); clearError("phone"); }}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className={cn(
                          "w-full px-3.5 h-10 sm:h-11 text-xs sm:text-sm border border-gray-200 rounded-r-xl rounded-l-none focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 bg-white text-gray-900 transition-all",
                          errors.phone && "field-error"
                        )}
                        disabled={status === "submitting"}
                      />
                    </div>
                    <FieldError message={errors.phone} />
                  </div>
                </div>

                {/* Empresa & Cargo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Empresa <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      aria-invalid={!!errors.company}
                      value={company}
                      onChange={(e) => { setCompany(e.target.value); clearError("company"); }}
                      placeholder="Nome da empresa"
                      className={cn(
                        "w-full px-3.5 h-10 sm:h-11 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 bg-white text-gray-900 transition-all",
                        errors.company && "field-error"
                      )}
                      disabled={status === "submitting"}
                    />
                    <FieldError message={errors.company} />
                  </div>
                  <div className="nav-item">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Cargo</label>
                    <SelectField
                      value={role}
                      onChange={setRole}
                      ariaLabel="Cargo"
                      placeholder="Selecione"
                      disabled={status === "submitting"}
                      options={[
                        { value: "Diretor / C-Level", label: "Diretor / C-Level" },
                        { value: "Gerente de TI", label: "Gerente de TI" },
                        { value: "Coordenador / Supervisor de TI", label: "Coordenador / Supervisor de TI" },
                        { value: "Analista / Engenheiro de TI", label: "Analista / Engenheiro de TI" },
                        { value: "Outro", label: "Outro" },
                      ]}
                    />
                  </div>
                </div>

                {/* Qual tecnologia está procurando? */}
                <div className="nav-item">
                  <span className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5 sm:mb-2">
                    Qual tecnologia está procurando?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 sm:gap-y-2 gap-x-3">
                    {[
                      { id: "cloud", label: "Computação em Nuvem" },
                      { id: "services", label: "Serviços" },
                      { id: "data", label: "Dados" },
                      { id: "partnerships", label: "Parcerias" },
                      { id: "security", label: "Cibersegurança" },
                      { id: "other", label: "Outro assunto" },
                      { id: "ai", label: "Inteligência Artificial" },
                    ].map((tech) => (
                      <label 
                        key={tech.id} 
                        className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={technologies.includes(tech.label)}
                          onChange={() => handleTechChange(tech.label)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#0E66FF] focus:ring-[#0E66FF] cursor-pointer"
                          disabled={status === "submitting"}
                        />
                        {tech.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quais são as necessidades da sua empresa? */}
                <div className="nav-item">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                    Quais são as necessidades da sua empresa? <span className="text-danger">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    aria-invalid={!!errors.message}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); clearError("message"); }}
                    placeholder="Digite sua mensagem..."
                    className={cn(
                      "w-full px-3.5 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0E66FF] focus:ring-2 focus:ring-[#0E66FF]/10 resize-none bg-white placeholder-gray-400 transition-all",
                      errors.message && "field-error"
                    )}
                    disabled={status === "submitting"}
                  />
                  <FieldError message={errors.message} />
                </div>

                {/* Termos de Uso */}
                <div className="nav-item">
                  <label className="flex items-start gap-2.5 text-xs font-normal text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      aria-invalid={!!errors.agreeToTerms}
                      checked={agreeToTerms}
                      onChange={(e) => { setAgreeToTerms(e.target.checked); clearError("agreeToTerms"); }}
                      className={cn(
                        "w-3.5 h-3.5 mt-0.5 rounded border-gray-300 text-[#0E66FF] focus:ring-[#0E66FF] cursor-pointer",
                        errors.agreeToTerms && "field-error"
                      )}
                      disabled={status === "submitting"}
                    />
                    <span>
                      Li e estou de acordo com os{" "}
                      <a href="#" className="underline text-gray-800 hover:text-black font-medium">
                        Termos e política de privacidade
                      </a>.
                    </span>
                  </label>
                  <FieldError message={errors.agreeToTerms} />
                </div>

                {/* Submit button aligned bottom right */}
                <div className="nav-login flex justify-end mt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#001DFF] hover:bg-[#0b21e8] text-white font-sans font-semibold rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-[#001DFF]/15"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Enviando...
                      </>
                    ) : (
                      "Solicitar contato"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Middle panel — Blue gradient with support details */}
        <div className="nav-middle nav-border nav-panel" id="navMiddle">
          <div className="nav-middle-header text-white/70">SUPORTE & ATENDIMENTO</div>
          <div className="nav-middle-card">
            <div className="nav-middle-badge text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="nav-middle-info">
              <div className="nav-middle-title text-white">Já é cliente e precisa de ajuda?</div>
              <div className="nav-middle-desc text-white/80 text-xs leading-relaxed mt-0.5">
                Fale conosco pelo e-mail <strong className="text-white">contato@infodive.com.br</strong> ou pelo telefone de suporte.
              </div>
            </div>
          </div>
          <div className="nav-middle-actions mt-3">
            <a 
              href={`mailto:${EMAIL_ADRESS}`} 
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${EMAIL_ADRESS}`;
              }}
              className="nav-action-btn text-xs font-semibold"
            >
              Falar com o Suporte
            </a>
          </div>
        </div>

        {/* Bottom panel — social networks */}
        <div className="nav-bottom nav-border nav-panel" id="navBottom">
          <ul className="nav-socials flex gap-4 text-xs">
            <li><a href="https://www.linkedin.com/company/infodiveit/posts/?feedView=all" className="hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href="https://www.instagram.com/infodiveit/" className="hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://www.facebook.com/InfodiveIt" className="hover:text-white transition-colors">Facebook</a></li>
          </ul>
          <div className="nav-asset">
            <Image
              src={infodiveLogo}
              alt="Infodive"
              width={132}
              height={33}
              className="hidden sm:block nav-logo-img"
            />
            <Image
              src={iconContact}
              alt="Contato"
              width={30}
              height={30}
              className="block sm:hidden object-contain"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
