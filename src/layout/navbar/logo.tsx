import Link from "next/link";
import Image from "next/image";
import logoImg from "@/assets/logo/Logo Infodive 3.png";
import faviconImg from "@/assets/logo/Logos Infodive Navbar.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string;
  scrolled?: boolean;
};

export function Logo({ className, href = "/", scrolled = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Infodive — Portal de Soluções de TI"
      className={cn(
        "inline-flex items-center transition-all duration-300 relative",
        scrolled
          ? "text-ink-950 hover:text-ink-950"
          : "text-white hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 rounded-md",
        className,
      )}
    >
      {/* Scrolled State (Favicon only, increased size) */}
      <div
        className={cn(
          "flex items-center transition-all duration-300",
          scrolled
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none absolute inset-0"
        )}
      >
        <div className="relative h-[28px] md:h-[35px] flex items-center justify-center mb-1">
          <Image
            src={faviconImg}
            alt="Infodive Favicon"
            className="h-[28px] md:h-[35px] w-auto object-contain"
            priority
          />
        </div>
      </div>

      {/* Transparent State (Full Logo) */}
      <div
        className={cn(
          "flex items-center transition-all duration-300",
          scrolled
            ? "opacity-0 scale-95 pointer-events-none absolute inset-0"
            : "opacity-100 scale-100"
        )}
      >
        <div className="relative h-[28px] md:h-[35px] flex items-center mb-1">
          <Image
            src={logoImg}
            alt="Infodive Logo"
            className="h-[28px] md:h-[35px] w-auto object-contain"
            priority
          />
        </div>
      </div>
    </Link>
  );
}
