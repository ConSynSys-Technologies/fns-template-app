export interface ShellResponse {
  requestId: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface ShellApi {
  emit(type: string, arg: any): void;
  on(type: string, handler: (payload: any) => void): void;
  off(type: string, handler: (payload: any) => void): void;
}

const DEFAULT_TIMEOUT_MS = 15000;

export function requestShellOperation<T>(
  app: ShellApi,
  operation: string,
  args?: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  if (typeof operation !== "string" || operation.length < 1 || operation.length > 80) {
    return Promise.reject(new Error("Invalid shell operation"));
  }
  if (!app || typeof app.emit !== "function" || typeof app.on !== "function" || typeof app.off !== "function") {
    return Promise.reject(new Error("PiletApi is not available for shell operation"));
  }

  const requestId = createRequestId();
  return new Promise((resolve, reject) => {
    let settled = false;
    const handler = (payload: ShellResponse) => {
      if (!payload || payload.requestId !== requestId) return;
      finish();
      if (payload.ok) resolve(payload.data as T);
      else reject(new Error(payload.error || `Shell operation failed: ${operation}`));
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      app.off("api-response", handler);
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error(`Shell operation timed out: ${operation}`));
    }, timeoutMs);
    app.on("api-response", handler);
    if (args === undefined) {
      app.emit("api-request", { requestId, operation });
    } else {
      app.emit("api-request", { requestId, operation, args });
    }
  });
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`.slice(0, 80);
}

let shellApp: ShellApi | null = null;

export function setShellApp(app: ShellApi) {
  shellApp = app;
}

export interface ProxyResult {
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

export interface ProxyCall {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  responseType?: "json" | "text" | "base64";
}

export function requestShellProxy(request: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  responseType?: "json" | "text" | "base64";
}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ProxyResult & { requestId?: string }> {
  const app = shellApp;
  if (!request || typeof request.url !== "string" || !/^https?:\/\//i.test(request.url)) {
    return Promise.reject(new Error("Shell proxy URL must be absolute"));
  }
  if (!app) return Promise.reject(new Error("PiletApi is not available for shell proxy"));
  const requestId = createRequestId();
  const message: Record<string, unknown> = { requestId, url: request.url };
  if (request.method) message.method = request.method;
  if (request.headers) {
    const headers: Record<string, string> = {};
    Object.keys(request.headers).forEach((key) => {
      if (key.toLowerCase() !== "authorization") headers[key] = request.headers![key];
    });
    if (Object.keys(headers).length > 0) message.headers = headers;
  }
  if (typeof request.body === "string") message.body = request.body;
  if (request.responseType) message.responseType = request.responseType;
  return new Promise((resolve, reject) => {
    let settled = false;
    const handler = (payload: ProxyResult & { requestId?: string }) => {
      if (!payload || payload.requestId !== requestId) return;
      finish();
      resolve(payload);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      app.off("api-proxy-response", handler);
    };
    const timer = setTimeout(() => {
      finish();
      reject(new Error("Shell proxy timed out"));
    }, timeoutMs);
    app.on("api-proxy-response", handler);
    app.emit("api-proxy-request", message);
  });
}

export function isLocalPage() {
  return typeof window !== "undefined" && window.location.hostname === "localhost";
}

export function decodeBase64(encoded: string): Uint8Array {
  const cleaned = String(encoded).replace(/^data:[^,]*,/, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function multipartFileBody(filename: string, type: string, bytes: Uint8Array) {
  const boundary = `----fns${Date.now().toString(36)}`;
  const head =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${type || "application/octet-stream"}\r\n\r\n`;
  const tail = `\r\n--${boundary}--\r\n`;
  const headBytes = new TextEncoder().encode(head);
  const tailBytes = new TextEncoder().encode(tail);
  const all = new Uint8Array(headBytes.length + bytes.length + tailBytes.length);
  all.set(headBytes, 0);
  all.set(bytes, headBytes.length);
  all.set(tailBytes, headBytes.length + bytes.length);
  let body = "";
  for (let i = 0; i < all.length; i += 1) body += String.fromCharCode(all[i]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

export async function proxyResult(url: string, options: ProxyCall = {}): Promise<ProxyResult> {
  const responseType = options.responseType || "json";
  if (isLocalPage()) {
    const headers: Record<string, string> = { ...(options.headers || {}) };
    delete headers.Authorization;
    delete headers.authorization;
    let body: string | undefined;
    if (options.body !== undefined) {
      if (typeof options.body === "string") body = options.body;
      else {
        body = JSON.stringify(options.body);
        if (!headers["Content-Type"] && !headers["content-type"]) headers["Content-Type"] = "application/json";
      }
    }
    const response = await fetch(url, { method: options.method || "GET", headers, body, mode: "cors" });
    let data: unknown = null;
    if (responseType === "base64") {
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
      data = btoa(binary);
    } else if (responseType === "text") {
      data = await response.text();
    } else {
      data = await response.json().catch(() => null);
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? undefined : `HTTP error! Status: ${response.status}`,
    };
  }
  const request: { url: string; method?: string; headers?: Record<string, string>; body?: string; responseType: "json" | "text" | "base64" } = {
    url,
    responseType,
  };
  if (options.method) request.method = options.method;
  if (options.headers) request.headers = options.headers;
  if (options.body !== undefined) {
    if (typeof options.body === "string") request.body = options.body;
    else {
      request.body = JSON.stringify(options.body);
      request.headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    }
  }
  const payload = await requestShellProxy(request, options.timeoutMs);
  return {
    ok: Boolean(payload.ok),
    status: payload.status,
    data: payload.data,
    error: payload.error,
  };
}
