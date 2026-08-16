import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const LOW_STOCK_THRESHOLD = 5;

router.get("/stats", async (_req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });

  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity < LOW_STOCK_THRESHOLD).length;

  const lowStockProducts = products
    .filter((p) => p.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      quantity: p.quantity,
      categoryName: p.category.name,
    }));

  const recentMovements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { product: { select: { name: true, code: true } } },
  });

  res.json({
    totalProducts,
    totalQuantity,
    lowStockCount,
    outOfStockCount,
    lowStockProducts,
    recentMovements: recentMovements.map((m) => ({
      id: m.id,
      productName: m.product.name,
      productCode: m.product.code,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
