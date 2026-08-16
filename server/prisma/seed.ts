import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "مدير النظام";

  const existingAdmin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: { username: adminUsername, password: hashed, name: adminName, role: "مدير النظام" },
    });
    console.log(`تم إنشاء المستخدم المدير: ${adminUsername}`);
  }

  const categoryNames = ["إلكترونيات", "إكسسوارات", "أدوات مكتبية"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category.id;
  }

  const productsCount = await prisma.product.count();
  if (productsCount === 0) {
    const products = [
      {
        code: "P1001",
        name: "سماعات بلوتوث",
        description: "سماعات لاسلكية بجودة صوت عالية",
        price: 249,
        quantity: 3,
        categoryId: categories["إلكترونيات"],
      },
      {
        code: "P1002",
        name: "كيبورد ميكانيكي",
        description: "لوحة مفاتيح ميكانيكية للألعاب",
        price: 89,
        quantity: 25,
        categoryId: categories["إكسسوارات"],
      },
      {
        code: "P1003",
        name: "شاحن لاسلكي",
        description: "شاحن سريع لاسلكي متوافق مع جميع الأجهزة",
        price: 129,
        quantity: 0,
        categoryId: categories["إلكترونيات"],
      },
      {
        code: "P1004",
        name: "ماوس لاسلكي",
        description: "ماوس دقيق بتصميم مريح",
        price: 69,
        quantity: 18,
        categoryId: categories["إكسسوارات"],
      },
      {
        code: "P1005",
        name: "كابل شحن سريع",
        description: "كابل USB-C بطول 1.5 متر",
        price: 39,
        quantity: 1,
        categoryId: categories["إكسسوارات"],
      },
      {
        code: "P1006",
        name: "دفتر ملاحظات",
        description: "دفتر جلدي بغلاف صلب",
        price: 25,
        quantity: 40,
        categoryId: categories["أدوات مكتبية"],
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }
    console.log(`تم إنشاء ${products.length} منتجات تجريبية`);

    const p1001 = await prisma.product.findUnique({ where: { code: "P1001" } });
    const p1005 = await prisma.product.findUnique({ where: { code: "P1005" } });
    if (p1001) {
      await prisma.stockMovement.create({
        data: { productId: p1001.id, type: "IN", quantity: 50, reason: "توريد من المورد" },
      });
    }
    if (p1005) {
      await prisma.stockMovement.create({
        data: { productId: p1005.id, type: "OUT", quantity: 3, reason: "بيع" },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
