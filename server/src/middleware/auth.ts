import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { t, getLang } from "../lib/i18n";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const lang = getLang(req);
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: t("unauthorized", lang) });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: t("invalidSession", lang) });
  }
}
