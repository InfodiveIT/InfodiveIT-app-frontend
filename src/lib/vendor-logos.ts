import type { StaticImageData } from "next/image";
import awsLogo from "@/assets/AWS Logo.svg";
import awsPretoLogo from "@/assets/AWS Preto Logo.svg";
import acronisLogo from "@/assets/Acronis Logo.svg";
import appleLogo from "@/assets/Apple Logo.svg";
import dellLogo from "@/assets/Dell Logo.svg";
import ibmLogo from "@/assets/IBM Logo.svg";
import lenovoLogo from "@/assets/Lenovo Logo.svg";
import microsoftLogo from "@/assets/Microsoft Logo.svg";
import redhatLogo from "@/assets/Red Hat Logo.svg";
import redhatPretoLogo from "@/assets/Red Hat Preto Logo.svg";
import suseLogo from "@/assets/Suse Logo.svg";
import veeamLogo from "@/assets/Veeam Logo.svg";
import virtuozzoLogo from "@/assets/Virtuozzo Logo.svg";

export const VENDOR_LOGOS: Record<string, StaticImageData> = {
  AWS: awsLogo,
  Acronis: acronisLogo,
  Apple: appleLogo,
  "Dell Technologies": dellLogo,
  IBM: ibmLogo,
  Lenovo: lenovoLogo,
  Microsoft: microsoftLogo,
  "Red Hat": redhatLogo,
  SUSE: suseLogo,
  Veeam: veeamLogo,
  Virtuozzo: virtuozzoLogo,
};

/**
 * Resolve a logo adequada do fabricante de acordo com o fundo:
 * - "light" (fundo branco/claro): Red Hat e AWS usam a variante de tipografia escura.
 * - "dark" (fundo preto/escuro): Red Hat e AWS usam a variante de tipografia branca.
 */
export function getVendorLogo(
  fabricante?: string | null,
  rawLogo?: StaticImageData | string | null,
  theme: "light" | "dark" = "light"
): StaticImageData | string {
  const key = (fabricante || "").trim().toLowerCase();

  if (theme === "light") {
    if (key === "red hat" || key === "red-hat" || key === "redhat") {
      return redhatPretoLogo;
    }
    if (key === "aws") {
      return awsPretoLogo;
    }
  } else {
    if (key === "red hat" || key === "red-hat" || key === "redhat") {
      return rawLogo || redhatLogo;
    }
    if (key === "aws") {
      return rawLogo || awsLogo;
    }
  }

  return rawLogo || (fabricante ? VENDOR_LOGOS[fabricante] : "") || "";
}

/**
 * Indica se a logo original do fabricante é monocromática preta e precisa de
 * `brightness-0 invert` quando exibida sobre fundo escuro.
 */
export function shouldInvertLogoOnDark(fabricante?: string | null): boolean {
  const key = (fabricante || "").trim().toLowerCase();
  return key === "virtuozzo" || key === "apple";
}

export const VENDOR_URLS: Record<string, string> = {
  AWS: "https://aws.amazon.com",
  Acronis: "https://www.acronis.com",
  Apple: "https://www.apple.com",
  "Dell Technologies": "https://www.dell.com",
  IBM: "https://www.ibm.com",
  Lenovo: "https://www.lenovo.com",
  Microsoft: "https://www.microsoft.com",
  "Red Hat": "https://www.redhat.com",
  SUSE: "https://www.suse.com",
  Veeam: "https://www.veeam.com",
  Virtuozzo: "https://www.virtuozzo.com",
};


