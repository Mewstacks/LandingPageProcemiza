import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `after` só existe dentro de uma requisição do Next: aqui roda na hora.
vi.mock("next/server", () => ({ after: (fn: () => unknown) => void fn() }));
vi.mock("@/lib/pdf", () => ({ reportPdf: async () => Buffer.from("%PDF-fake") }));
vi.mock("@/lib/crmew", () => ({ sendToCrmew: vi.fn(async () => "skipped") }));

const send = vi.fn();
vi.mock("@/lib/resend", () => ({
  DEFAULT_FROM_EMAIL: "Procemiza <relatorio@procemiza.com.br>",
  getResend: () => (process.env.RESEND_API_KEY ? { emails: { send } } : null),
}));

import { POST } from "./route";

// e-mail novo a cada chamada: o limite por destinatário vive em memória e vale entre testes
let n = 0;
const EMAIL = () => `vinicius${n}@mewstack.com.br`;
const body = () => ({
  routines: [{ kind: "dados", period: "semana", minutes: 30, runs: 5 }],
  pay: { mode: "bruto", salary: 4500, regime: "simples", benefits: 0 },
  lead: { email: (n++, EMAIL()), company: "Mewstack", wantsContact: false },
  trap: { website: "", elapsedMs: 6000 },
  turnstile: "token",
});

let ip = 0;
const post = (payload: unknown) =>
  POST(
    new Request("http://localhost/api/relatorio", {
      method: "POST",
      headers: { origin: "http://localhost:3001", "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip}` },
      body: JSON.stringify(payload),
    }),
  );

const env = process.env as Record<string, string | undefined>;
const saved = { ...env };

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "x" }, error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
  for (const k of ["RESEND_API_KEY", "LEADS_TO_EMAIL", "TURNSTILE_SECRET_KEY"]) delete env[k];
  env.NODE_ENV = "test";
});
afterEach(() => {
  vi.restoreAllMocks();
  for (const k of Object.keys(env)) if (!(k in saved)) delete env[k];
  Object.assign(env, saved);
});

describe("POST /api/relatorio", () => {
  it("manda para a equipe primeiro e depois para a pessoa, com o PDF anexo", async () => {
    env.RESEND_API_KEY = "re_test";
    env.LEADS_TO_EMAIL = "equipe@procemiza.com.br";
    const res = await post(body());
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]![0].to).toBe("equipe@procemiza.com.br");
    expect(send.mock.calls[1]![0].to).toBe(EMAIL());
    expect(send.mock.calls[1]![0].attachments).toHaveLength(1);
  });

  it("sem Resend ou sem e-mail da equipe responde 503 e o log diz qual variável falta", async () => {
    const res = await post(body());
    expect(res.status).toBe(503);
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).toContain("RESEND_API_KEY");
    expect(logged).toContain("LEADS_TO_EMAIL");
    expect(logged).not.toContain(EMAIL());
  });

  it("em produção sem TURNSTILE_SECRET_KEY recusa (400) e o log diz o motivo", async () => {
    env.NODE_ENV = "production";
    env.RESEND_API_KEY = "re_test";
    env.LEADS_TO_EMAIL = "equipe@procemiza.com.br";
    const res = await post(body());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "challenge" });
    expect(vi.mocked(console.error).mock.calls.flat().join(" ")).toContain("TURNSTILE_SECRET_KEY");
    expect(send).not.toHaveBeenCalled();
  });

  it("falha do Resend vira 502 e o log guarda o motivo sem dado pessoal", async () => {
    env.RESEND_API_KEY = "re_test";
    env.LEADS_TO_EMAIL = "equipe@procemiza.com.br";
    send.mockResolvedValueOnce({ data: null, error: { name: "validation_error", message: "The domain is not verified", statusCode: 403 } });
    const res = await post(body());
    expect(res.status).toBe(502);
    const logged = vi.mocked(console.error).mock.calls.flat().join(" ");
    expect(logged).toContain("validation_error");
    expect(logged).toContain("403");
    expect(logged).not.toContain(EMAIL());
  });

  it("não devolve 200 quando só o envio para a pessoa falha", async () => {
    env.RESEND_API_KEY = "re_test";
    env.LEADS_TO_EMAIL = "equipe@procemiza.com.br";
    send.mockResolvedValueOnce({ data: { id: "a" }, error: null }).mockResolvedValueOnce({ data: null, error: { name: "rate_limit_exceeded", message: "slow down", statusCode: 429 } });
    const res = await post(body());
    expect(res.status).toBe(502);
  });
});
