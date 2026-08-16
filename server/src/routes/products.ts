import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { t, getLang, Lang } from "../lib/i18n";

const router = Router();
router.use(requireAuth);

const LOW_STOCK_THRESHOLD = 5;

function stockStatusOf(quantity: number): "out" | "low" | "available" {
  if (quantity <= 0) return "out";
  if (quantity < LOW_STOCK_THRESHOLD) return "low";
  return "available";
}

router.get("/", async (req, res) => {
  const { search, categoryId, stockStatus, dateFrom, dateTo } = req.query as {
    search?: string;
    categoryId?: string;
    stockStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  const where: Prisma.ProductWhereInput = {};

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim() } },
      { code: { contains: search.trim() } },
    ];
  }

  if (categoryId && categoryId !== "all") {
    where.categoryId = categoryId;
  }

  if (stockStatus === "out") where.quantity = { lte: 0 };
  else if (stockStatus === "low") where.quantity = { gt: 0, lt: LOW_STOCK_THRESHOLD };
  else if (stockStatus === "available") where.quantity = { gte: LOW_STOCK_THRESHOLD };

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
    if (dateTo) where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    products.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      price: p.price,
      quantity: p.quantity,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      stockStatus: stockStatusOf(p.quantity),
      createdAt: p.createdAt,
    }))
  );
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ error: t("productNotFound", getLang(req)) });
  res.json({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    stockStatus: stockStatusOf(product.quantity),
    createdAt: product.createdAt,
  });
});

function buildProductSchema(lang: Lang) {
  return z.object({
    code: z.string().trim().min(1, t("productCodeRequired", lang)).max(40, t("productCodeTooLong", lang)),
    name: z.string().trim().min(1, t("productNameRequired", lang)).max(120, t("productNameTooLong", lang)),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
    price: z.coerce.number().nonnegative(t("pricePositive", lang)),
    quantity: z.coerce.number().int(t("quantityInteger", lang)).nonnegative(t("quantityPositive", lang)),
    categoryId: z.string().min(1, t("categoryRequired", lang)),
  });
}

router.post("/", async (req, res) => {
  const lang = getLang(req);
  const parsed = buildProductSchema(lang).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return res.status(400).json({ error: t("categoryNotExists", lang) });

  const existingCode = await prisma.product.findUnique({ where: { code: data.code } });
  if (existingCode) return res.status(409).json({ error: t("productCodeExists", lang) });

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        price: data.price,
        quantity: data.quantity,
        categoryId: data.categoryId,
      },
    });

    if (data.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          productId: created.id,
          type: "IN",
          quantity: data.quantity,
          reason: t("openingBalanceReason", lang),
        },
      });
    }

    return created;
  });

  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const lang = getLang(req);
  const parsed = buildProductSchema(lang).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: t("productNotFound", lang) });

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return res.status(400).json({ error: t("categoryNotExists", lang) });

  const existingCode = await prisma.product.findUnique({ where: { code: data.code } });
  if (existingCode && existingCode.id !== product.id) {
    return res.status(409).json({ error: t("productCodeExists", lang) });
  }

  const quantityDiff = data.quantity - product.quantity;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.product.update({
      where: { id: req.params.id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        price: data.price,
        quantity: data.quantity,
        categoryId: data.categoryId,
      },
    });

    if (quantityDiff !== 0) {
      await tx.stockMovement.create({
        data: {
          productId: result.id,
          type: quantityDiff > 0 ? "IN" : "OUT",
          quantity: Math.abs(quantityDiff),
          reason: t("manualAdjustmentReason", lang),
        },
      });
    }

    return result;
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: t("productNotFound", getLang(req)) });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
