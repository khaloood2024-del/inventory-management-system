# نظام إدارة المنتجات والمخزون

نظام لإدارة المنتجات والتصنيفات وحركات المخزون، مع لوحة تحكم تعرض إحصائيات مباشرة وتنبيهات للمنتجات منخفضة المخزون. الطابع البصري مستوحى من تصميم Origin (خلفية كريمية دافئة، أزرار دائرية، خط Serif للعناوين).

## المزايا

### إدارة البيانات
- تسجيل دخول بسيط محمي بـ JWT.
- إدارة كاملة للمنتجات (إضافة / تعديل / حذف / عرض) مع بيانات: الاسم، التصنيف، الكمية، السعر، الكود، الوصف، تاريخ الإضافة.
- إدارة التصنيفات (إضافة / تعديل / حذف)، مع منع حذف تصنيف مرتبط بمنتجات.
- تسجيل حركات المخزون (إضافة / سحب) مع تحديث تلقائي لكمية المنتج، ومنع سحب كمية أكبر من المتوفر.
- تسجيل تلقائي لحركة "رصيد افتتاحي" عند إضافة منتج بكمية أولية، وحركة "تعديل يدوي" عند تغيير الكمية من نموذج التعديل — بحيث يبقى سجل الحركات مطابقًا دائمًا لكمية المنتج الفعلية.

### البحث والتصفية
- بحث عن المنتجات بالاسم أو الكود، مع اقتراحات تلقائية (Autocomplete) تظهر أثناء الكتابة في شريط البحث العلوي.
- تصفية حسب التصنيف وحالة المخزون (متوفر / منخفض / نفد المخزون).
- فلتر بحث بنطاق تاريخ (من – إلى) في صفحة المنتجات (تاريخ الإضافة) وصفحة حركات المخزون (تاريخ الحركة).
- ترتيب قابل للنقر على كل أعمدة جدول المنتجات (نصي، رقمي، حسب حالة المخزون، أو حسب التاريخ).

### التنبيهات ولوحة التحكم
- تنبيه واضح للمنتجات التي وصلت كميتها إلى أقل من 5 قطع (منخفض) أو صفر (نفد المخزون).
- قائمة تنبيهات منسدلة من أيقونة الجرس (بدون مغادرة الصفحة الحالية)، والعدد الظاهر على الأيقونة يتناقص فور فتح أي تنبيه منها.
- لوحة تحكم بإحصائيات مباشرة: إجمالي المنتجات، إجمالي الكمية، عدد المنتجات منخفضة المخزون، عدد المنتجات النافدة، آخر حركات المخزون.

### الواجهة
- شريط جانبي قابل للطي إلى أيقونات فقط (مع حفظ التفضيل)، وزر الطي مدمج بجانب شعار النظام.
- واجهة متجاوبة (Responsive) تعمل على الجوال والتابلت وسطح المكتب، بدعم كامل للغة العربية (RTL).

## التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الواجهة (Frontend) | React + TypeScript + Vite + Base UI + Tailwind CSS |
| الخلفية (Backend) | Node.js + Express + TypeScript |
| قاعدة البيانات | PostgreSQL (عبر Prisma ORM) — أو SQLite محليًا للتطوير |
| التوثيق (Auth) | JWT |

## هيكل المشروع

```
server/   الخلفية (API + قاعدة البيانات عبر Prisma)
client/   الواجهة (React)
```

## التشغيل محليًا

### 1) الخلفية (Server)

```bash
cd server
npm install
npm run prisma:migrate   # ينشئ قاعدة البيانات المحلية ويطبّق الجداول
npm run seed              # يضيف مستخدم مدير وبيانات تجريبية
npm run dev                # يشغّل الخادم على http://localhost:4000
```

بيانات الدخول الافتراضية (من ملف `server/.env`، يمكنك تغييرها):

- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

### 2) الواجهة (Client)

```bash
cd client
npm install
npm run dev   # يشغّل الواجهة على http://localhost:5173
```

افتح `http://localhost:5173` في المتصفح، وسجّل الدخول بالبيانات أعلاه.

## متغيرات البيئة (server/.env)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="غيّر-هذه-القيمة-إلى-نص-عشوائي-طويل"
PORT=4000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="اسم المدير"
```

## الانتقال إلى قاعدة بيانات سحابية (PostgreSQL)

المشروع يستخدم SQLite محليًا فقط لتسهيل التطوير بدون أي إعداد إضافي. للانتقال إلى قاعدة بيانات PostgreSQL سحابية (مثل [Neon](https://neon.tech) أو [Supabase](https://supabase.com) — كلاهما يقدّم خطة مجانية بدون بطاقة ائتمان ويعملان بشكل جيد من السعودية):

1. أنشئ مشروع قاعدة بيانات مجاني في Neon أو Supabase، وانسخ رابط الاتصال (Connection String).
2. في `server/prisma/schema.prisma` غيّر:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. ضع رابط الاتصال في `server/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```
4. نفّذ:
   ```bash
   cd server
   npm run prisma:migrate
   npm run seed
   ```

لا حاجة لأي تعديل آخر في الكود — كل الاستعلامات تمر عبر Prisma وتعمل بنفس الشكل على القاعدتين.

## ملاحظات أمان قبل النشر الفعلي

- غيّر `JWT_SECRET` و `ADMIN_PASSWORD` إلى قيم قوية وخاصة بك.
- لا ترفع ملف `.env` إلى GitHub (مستثنى بالفعل عبر `.gitignore`).

---

# Product & Inventory Management System

A system for managing products, categories, and stock movements, with a dashboard showing live statistics and low-stock alerts. The visual style is inspired by the Origin design (warm cream background, pill-shaped buttons, serif headings).

## Features

### Data management
- Simple JWT-protected login.
- Full product management (create / edit / delete / view) with: name, category, quantity, price, code, description, date added.
- Category management (create / edit / delete), with protection against deleting a category that still has products.
- Stock movement logging (stock in / stock out) with automatic product quantity updates, and prevention of withdrawing more than what's available.
- Automatic "opening balance" movement logged when a product is created with an initial quantity, and an automatic "manual adjustment" movement when the quantity is changed from the edit form — so the movement log always stays consistent with the product's actual quantity.

### Search & filtering
- Search products by name or code, with autocomplete suggestions appearing as you type in the top header search bar.
- Filter by category and stock status (available / low / out of stock).
- Date-range filter (from – to) on the Products page (date added) and the Stock Movements page (movement date).
- Clickable sorting on every column of the products table (text, numeric, stock-status, or date-aware).

### Alerts & dashboard
- Clear alert for products whose quantity has dropped below 5 (low) or to zero (out of stock).
- A dropdown notification panel from the bell icon (no page navigation needed), with the badge count decreasing as each alert is opened.
- Dashboard with live statistics: total products, total quantity in stock, low-stock count, out-of-stock count, and recent stock movements.

### Interface
- Collapsible sidebar (icon-only mode, preference persisted), with the collapse toggle placed next to the logo.
- Fully responsive UI across mobile, tablet, and desktop, with full Arabic (RTL) support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Base UI + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (via Prisma ORM) — or SQLite locally for development |
| Auth | JWT |

## Project Structure

```
server/   Backend (API + database via Prisma)
client/   Frontend (React)
```

## Running Locally

### 1) Backend (Server)

```bash
cd server
npm install
npm run prisma:migrate   # creates the local database and applies the schema
npm run seed              # adds an admin user and sample data
npm run dev                # runs the server on http://localhost:4000
```

Default login credentials (from `server/.env`, change as needed):

- Username: `admin`
- Password: `admin123`

### 2) Frontend (Client)

```bash
cd client
npm install
npm run dev   # runs the frontend on http://localhost:5173
```

Open `http://localhost:5173` in your browser and log in with the credentials above.

## Environment Variables (server/.env)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin name"
```

## Moving to a Cloud Database (PostgreSQL)

The project uses SQLite locally only, to make development setup-free. To move to a cloud PostgreSQL database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both offer a free tier with no credit card, and work well from Saudi Arabia):

1. Create a free database project on Neon or Supabase, and copy the connection string.
2. In `server/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Put the connection string in `server/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   ```
4. Run:
   ```bash
   cd server
   npm run prisma:migrate
   npm run seed
   ```

No other code changes are needed — every query goes through Prisma and works identically on both databases.

## Security Notes Before a Real Deployment

- Change `JWT_SECRET` and `ADMIN_PASSWORD` to strong, private values of your own.
- Never commit the `.env` file to GitHub (already excluded via `.gitignore`).
