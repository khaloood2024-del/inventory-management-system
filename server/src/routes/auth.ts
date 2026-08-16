import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { t, getLang, Lang } from "../lib/i18n";

const router = Router();

function buildLoginSchema(lang: Lang) {
  return z.object({
    username: z.string().min(1, t("usernameRequired", lang)),
    password: z.string().min(1, t("passwordRequired", lang)),
  });
}

router.post("/login", async (req, res) => {
  const lang = getLang(req);
  const parsed = buildLoginSchema(lang).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: t("invalidCredentials", lang) });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: t("invalidCredentials", lang) });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: t("userNotFound", getLang(req)) });
  res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
});

export default router;
