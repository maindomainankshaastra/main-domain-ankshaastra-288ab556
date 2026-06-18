type ReqWithBody = {
  method?: string;
  body?: unknown;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
};

export async function attachJsonBody(req: ReqWithBody): Promise<void> {
  if (req.method === "GET" || req.method === "HEAD") return;

  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return;
  }

  if (typeof req.body === "string") {
    try {
      req.body = req.body ? JSON.parse(req.body) : {};
    } catch {
      req.body = {};
    }
    return;
  }

  const chunks: Buffer[] = [];
  const raw = await new Promise<string>((resolve, reject) => {
    req.on("data", (chunk) => chunks.push(chunk as Buffer));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

  try {
    req.body = raw ? JSON.parse(raw) : {};
  } catch {
    req.body = {};
  }
}
