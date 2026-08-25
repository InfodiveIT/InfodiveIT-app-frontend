import { revalidateTag, revalidatePath } from 'next/cache';

const RESOURCE_TAG_MAP: Record<string, string> = {
  'categorias': 'categorias',
  'solucoes': 'solucoes',
  'produtos': 'produtos',
  'fabricantes': 'fabricantes',
  'servicos': 'servicos',
  'conteudos': 'conteudos',
  'cases': 'cases',
  'faq': 'faq',
  'home-solucoes-bento': 'home-bento',
  'hero-carousel': 'home-hero',
  'home-seguranca-marquee': 'home-marquee',
  'home-problemas': 'home-problemas',
  'home-trust-stats': 'home-trust',
  'paginas-hero': 'pagina-hero',
  'ctas': 'ctas',
  'config-footer': 'config-footer',
  'config-blog': 'config-blog',
  'contato-info': 'contato-info',
  'secoes-home': 'secoes-home',
  'servicos-etapas': 'servicos-etapas',
  'servicos-metodologia': 'servicos-metodologia',
  'sobre-numeros': 'sobre-numeros',
  'sobre-timeline': 'sobre-timeline',
  'sobre-valores': 'sobre-valores',
  'sobre-cultura': 'sobre-cultura',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.REVALIDATE_SECRET;

    // Fail-closed: se a variável de ambiente não estiver configurada, rejeita imediatamente
    if (!configuredSecret || configuredSecret.trim() === '') {
      return json(
        { message: 'Revalidation endpoint is disabled (secret not configured)' },
        401
      );
    }

    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-revalidate-secret');

    const isBearerValid = authHeader === `Bearer ${configuredSecret}`;
    const isHeaderValid = secretHeader === configuredSecret;

    if (!isBearerValid && !isHeaderValid) {
      return json(
        { message: 'Invalid or missing revalidation secret header' },
        401
      );
    }

    const body = await request.json().catch(() => ({}));
    const { resource, tag, path } = body || {};

    const targetTag = tag || (resource ? RESOURCE_TAG_MAP[resource] : null);

    if (targetTag) {
      revalidateTag(targetTag);
    }

    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath('/', 'layout');
    }

    return json({
      revalidated: true,
      tag: targetTag,
      now: Date.now(),
    });
  } catch (error: any) {
    return json(
      { message: error?.message || 'Error revalidating' },
      500
    );
  }
}
