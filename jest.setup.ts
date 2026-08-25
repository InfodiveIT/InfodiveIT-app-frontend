import "@testing-library/jest-dom";

// Polyfill web standard request/response for server route testing in jsdom
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    status: number;
    headers: Map<string, string>;
    private _body: any;

    constructor(body?: any, init?: { status?: number; headers?: Record<string, string> }) {
      this._body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([k, v]) => this.headers.set(k.toLowerCase(), v));
      }
    }

    async json() {
      return typeof this._body === "string" ? JSON.parse(this._body) : this._body;
    }

    async text() {
      return typeof this._body === "string" ? this._body : JSON.stringify(this._body);
    }
  } as unknown as typeof Response;
}

if (typeof global.Request === "undefined") {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Map<string, string>;
    private _body: any;

    constructor(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([k, v]) => this.headers.set(k.toLowerCase(), v));
      }
      this._body = init?.body ? JSON.parse(init.body) : {};
    }

    async json() {
      return this._body;
    }
  } as unknown as typeof Request;
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080/api";

// O jsdom não implementa estas APIs de browser usadas por framer-motion
// (whileInView / useInView), GSAP (matchMedia) e pelo SelectField
// (reposicionamento no scroll/resize). Os mocks abaixo são no-op apenas para
// permitir que os componentes montem sem erro durante os testes unitários.

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

class MockObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

global.IntersectionObserver =
  MockObserver as unknown as typeof IntersectionObserver;
global.ResizeObserver = MockObserver as unknown as typeof ResizeObserver;

window.scrollTo = jest.fn();

// Made with Bob
