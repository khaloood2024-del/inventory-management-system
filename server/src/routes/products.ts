import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

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
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
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

const productSchema = z.object({
  code: z.string().trim().min(1, "كود المنتج مطلوب").max(40, "كود المنتج طويل جداً"),
  name: z.string().trim().min(1, "اسم المنتج مطلوب").max(120, "اسم المنتج طويل جداً"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative("السعر يجب أن يكون رقماً موجباً"),
  quantity: z.coerce.number().int("الكمية يجب أن تكون رقماً صحيحاً").nonnegative("الكمية يجب أن تكون رقماً موجباً"),
  categoryId: z.string().min(1, "التصنيف مطلوب"),
});

router.post("/", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return res.status(400).json({ error: "التصنيف المحدد غير موجود" });

  const existingCode = await prisma.product.findUnique({ where: { code: data.code } });
  if (existingCode) return res.status(409).json({ error: "يوجد منتج بنفس الكود مسبقاً" });

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
          reason: "رصيد افتتاحي عند إضافة المنتج",
        },
      });
    }

    return created;
  });

  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return res.status(400).json({ error: "التصنيف المحدد غير موجود" });

  const existingCode = await prisma.product.findUnique({ where: { code: data.code } });
  if (existingCode && existingCode.id !== product.id) {
    return res.status(409).json({ error: "يوجد منتج بنفس الكود مسبقاً" });
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
          reason: "تعديل يدوي للكمية من صفحة المنتجات",
        },
      });
    }

    return result;
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
