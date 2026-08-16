import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { productId, limit, dateFrom, dateTo } = req.query as {
    productId?: string;
    limit?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  const where: Prisma.StockMovementWhereInput = {};
  if (productId) where.productId = productId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
    if (dateTo) where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: { product: { select: { name: true, code: true } } },
    orderBy: { createdAt: "desc" },
    take: limit ? Number(limit) : undefined,
  });

  res.json(
    movements.map((m) => ({
      id: m.id,
      productId: m.productId,
      productName: m.product.name,
      productCode: m.product.code,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      createdAt: m.createdAt,
    }))
  );
});

const movementSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  type: z.enum(["IN", "OUT"], { message: "نوع الحركة غير صحيح" }),
  quantity: z.coerce.number().int().positive("الكمية يجب أن تكون رقماً أكبر من صفر"),
  reason: z.string().trim().min(1, "سبب الحركة مطلوب").max(200, "سبب الحركة طويل جداً"),
});

router.post("/", async (req, res) => {
  const parsed = movementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { productId, type, quantity, reason } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

  if (type === "OUT" && quantity > product.quantity) {
    return res.status(400).json({
      error: `لا يمكن سحب كمية أكبر من المتوفر (المتوفر حالياً: ${product.quantity})`,
    });
  }

  const newQuantity = type === "IN" ? product.quantity + quantity : product.quantity - quantity;

  const [, movement] = await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { quantity: newQuantity } }),
    prisma.stockMovement.create({
      data: { productId, type, quantity, reason },
    }),
  ]);

  res.status(201).json(movement);
});

export default router;
