import { POST } from '../route'
import { revalidateTag, revalidatePath } from 'next/cache'

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}))

// Polyfill minimal Request se não existir no ambiente de teste
class TestRequest {
  url: string
  method: string
  headers: Map<string, string>
  private bodyContent: any

  constructor(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
    this.url = url
    this.method = init?.method || 'POST'
    this.headers = new Map()
    if (init?.headers) {
      Object.entries(init.headers).forEach(([k, v]) => this.headers.set(k.toLowerCase(), v))
    }
    this.bodyContent = init?.body ? JSON.parse(init.body) : {}
  }

  async json() {
    return this.bodyContent
  }
}

describe('POST /api/revalidate', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('should return 401 if REVALIDATE_SECRET is not configured in env (fail-closed)', async () => {
    delete process.env.REVALIDATE_SECRET

    const req = new TestRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret123',
      },
      body: JSON.stringify({ resource: 'produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.message).toContain('secret not configured')
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  test('should return 401 if request has no secret header', async () => {
    process.env.REVALIDATE_SECRET = 'my-secure-secret'

    const req = new TestRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      body: JSON.stringify({ resource: 'produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  test('should return 401 if secret passed via query parameter only', async () => {
    process.env.REVALIDATE_SECRET = 'my-secure-secret'

    const req = new TestRequest('http://localhost:3000/api/revalidate?secret=my-secure-secret', {
      method: 'POST',
      body: JSON.stringify({ resource: 'produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  test('should return 401 if invalid secret header is provided', async () => {
    process.env.REVALIDATE_SECRET = 'my-secure-secret'

    const req = new TestRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
      body: JSON.stringify({ resource: 'produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  test('should return 200 and revalidate tag when valid Bearer token is provided', async () => {
    process.env.REVALIDATE_SECRET = 'my-secure-secret'

    const req = new TestRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        authorization: 'Bearer my-secure-secret',
      },
      body: JSON.stringify({ resource: 'produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.revalidated).toBe(true)
    expect(data.tag).toBe('produtos')
    expect(revalidateTag).toHaveBeenCalledWith('produtos')
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  test('should return 200 and revalidate when x-revalidate-secret header is provided', async () => {
    process.env.REVALIDATE_SECRET = 'my-secure-secret'

    const req = new TestRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'my-secure-secret',
      },
      body: JSON.stringify({ tag: 'custom-tag', path: '/produtos' }),
    }) as unknown as Request

    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.revalidated).toBe(true)
    expect(data.tag).toBe('custom-tag')
    expect(revalidateTag).toHaveBeenCalledWith('custom-tag')
    expect(revalidatePath).toHaveBeenCalledWith('/produtos')
  })
})
