import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/auth";
import { t, getLang, Lang } from "../lib/i18n";

const router = Router();
router.use(requireAuth, requireAdmin);

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, username: true, name: true, role: true, createdAt: true },
  });
  res.json(users);
});

function buildUserSchema(lang: Lang, { passwordRequired }: { passwordRequired: boolean }) {
  return z.object({
    username: z.string().trim().min(1, t("usernameRequired", lang)).max(40, t("usernameTooLong", lang)),
    name: z.string().trim().min(1, t("nameRequired", lang)).max(80, t("nameTooLong", lang)),
    role: z.enum(["ADMIN", "EMPLOYEE"], { message: t("invalidRole", lang) }),
    password: passwordRequired
      ? z.string().min(MIN_PASSWORD_LENGTH, t("passwordTooShort", lang))
      : z
          .union([z.string().min(MIN_PASSWORD_LENGTH, t("passwordTooShort", lang)), z.literal("")])
          .optional(),
  });
}

router.post("/", async (req: AuthedRequest, res) => {
  const lang = getLang(req);
  const parsed = buildUserSchema(lang, { passwordRequired: true }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { username, name, role, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json({ error: t("usernameExists", lang) });
  }

  const hashed = await bcrypt.hash(password as string, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { username, name, role, password: hashed },
    select: { id: true, username: true, name: true, role: true, createdAt: true },
  });
  res.status(201).json(user);
});

router.put("/:id", async (req: AuthedRequest, res) => {
  const lang = getLang(req);
  const parsed = buildUserSchema(lang, { passwordRequired: false }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { username, name, role, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: t("userNotFound", lang) });

  const duplicate = await prisma.user.findUnique({ where: { username } });
  if (duplicate && duplicate.id !== user.id) {
    return res.status(409).json({ error: t("usernameExists", lang) });
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: t("cannotDemoteLastAdmin", lang) });
    }
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      username,
      name,
      role,
      ...(password ? { password: await bcrypt.hash(password, BCRYPT_ROUNDS) } : {}),
    },
    select: { id: true, username: true, name: true, role: true, createdAt: true },
  });
  res.json(updated);
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const lang = getLang(req);
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: t("userNotFound", lang) });

  if (user.id === req.userId) {
    return res.status(400).json({ error: t("cannotDeleteSelf", lang) });
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return res.status(400).json({ error: t("cannotDeleteLastAdmin", lang) });
    }
  }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
