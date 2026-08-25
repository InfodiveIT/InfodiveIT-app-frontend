import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const secret = process.env.REVALIDATE_SECRET;
    const authHeader = request.headers.get('authorization');
    const secretHeader = request.headers.get('x-revalidate-secret');
    const url = new URL(request.url);
    const secretParam = url.searchParams.get('secret');

    if (secret) {
      const isValid =
        secretHeader === secret ||
        secretParam === secret ||
        authHeader === `Bearer ${secret}`;

      if (!isValid) {
        return NextResponse.json(
          { message: 'Invalid revalidation secret' },
          { status: 401 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const { resource, tag, path } = body;

    const targetTag = tag || (resource ? RESOURCE_TAG_MAP[resource] : null);

    if (targetTag) {
      revalidateTag(targetTag);
    }

    if (path) {
      revalidatePath(path);
    } else {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      tag: targetTag,
      now: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error revalidating' },
      { status: 500 }
    );
  }
}
