"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X, ShieldCheck } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("infodive_cookie_consent");
    if (!consent) {
      // Pequeno delay para entrada suave após o carregamento da página
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("infodive_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("infodive_cookie_consent", "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-[999] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="dialog"
      aria-live="polite"
      aria-label="Consentimento de Cookies"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0b0f19]/95 backdrop-blur-xl border border-white/15 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white">
        {/* Glow sutil de fundo */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-brand/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-teal/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand/15 border border-brand/30 text-brand">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1 text-xs leading-relaxed text-white/80">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                Privacidade & Cookies
                <ShieldCheck className="h-3.5 w-3.5 text-teal" />
              </span>
              <button
                onClick={handleDecline}
                className="text-white/40 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
                aria-label="Fechar aviso de cookies"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p>
              Utilizamos cookies para otimizar sua navegação e analisar o tráfego do portal. Ao continuar, você concorda com a nossa{" "}
              <Link
                href="/politica-de-cookies"
                className="font-medium text-brand hover:underline underline-offset-2 transition-colors"
              >
                Política de Cookies
              </Link>.
            </p>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-medium text-xs shadow-md shadow-brand/20 transition-all duration-200 active:scale-95 text-center"
              >
                Aceitar Todos
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium text-xs transition-all duration-200 text-center"
              >
                Essenciais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
