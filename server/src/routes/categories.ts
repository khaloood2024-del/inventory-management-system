import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { t, getLang, Lang } from "../lib/i18n";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      productsCount: c._count.products,
      createdAt: c.createdAt,
    }))
  );
});

function buildCategorySchema(lang: Lang) {
  return z.object({
    name: z.string().trim().min(1, t("categoryNameRequired", lang)).max(60, t("categoryNameTooLong", lang)),
  });
}

router.post("/", async (req, res) => {
  const lang = getLang(req);
  const parsed = buildCategorySchema(lang).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return res.status(409).json({ error: t("categoryNameExists", lang) });
  }
  const category = await prisma.category.create({ data: parsed.data });
  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const lang = getLang(req);
  const parsed = buildCategorySchema(lang).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) return res.status(404).json({ error: t("categoryNotFound", lang) });

  const duplicate = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (duplicate && duplicate.id !== category.id) {
    return res.status(409).json({ error: t("categoryNameExists", lang) });
  }

  const updated = await prisma.category.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const lang = getLang(req);
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return res.status(404).json({ error: t("categoryNotFound", lang) });
  if (category._count.products > 0) {
    return res.status(400).json({
      error: t("categoryHasProducts", lang, { count: category._count.products }),
    });
  }
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
