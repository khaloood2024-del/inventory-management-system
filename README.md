# نظام إدارة المنتجات والمخزون

نظام لإدارة المنتجات والتصنيفات وحركات المخزون، مع لوحة تحكم تعرض إحصائيات مباشرة وتنبيهات للمنتجات منخفضة المخزون. الطابع البصري مستوحى من تصميم Origin (خلفية كريمية دافئة، أزرار دائرية، خط Serif للعناوين).

## الروابط

- **النسخة المنشورة (الواجهة):** https://inventory-management-system-eta-drab.vercel.app
- **الـ API (الخلفية):** https://inventory-management-system-production-3512.up.railway.app/api
- **مستودع الكود (Repository):** https://github.com/khaloood2024-del/inventory-management-system

بيانات دخول تجريبية: اسم المستخدم `admin` / كلمة المرور `admin123` (يُنصح بتغييرها فور الاستلام من صفحة إدارة المستخدمين).

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
- واجهة متجاوبة (Responsive) تعمل على الجوال والتابلت وسطح المكتب.
- **دعم لغتين (عربي / إنجليزي)** مع زر تبديل في الشريط العلوي — يبدّل اتجاه الواجهة تلقائيًا بين RTL وLTR، ويحفظ اللغة المختارة، ويترجم حتى رسائل الأخطاء القادمة من الخادم.

## التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| الواجهة (Frontend) | React + TypeScript + Vite + Base UI + Tailwind CSS |
| الخلفية (Backend) | Node.js + Express + TypeScript |
| قاعدة البيانات | PostgreSQL سحابية (Supabase) عبر Prisma ORM |
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

المشروع متصل حاليًا بقاعدة بيانات PostgreSQL سحابية على [Supabase](https://supabase.com) (خطة مجانية). رابط الاتصال موجود في `server/.env` (غير مرفوع على Git):

```
DATABASE_URL="postgresql://user:password@pooler-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@direct-host:5432/postgres"
JWT_SECRET="غيّر-هذه-القيمة-إلى-نص-عشوائي-طويل"
PORT=4000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="اسم المدير"
```

- `DATABASE_URL`: رابط الاتصال المجمّع (Transaction pooler، المنفذ `6543`) — يُستخدم في وقت التشغيل العادي.
- `DIRECT_URL`: رابط اتصال مباشر (المنفذ `5432`) — يستخدمه Prisma Migrate فقط عند إنشاء أو تعديل الجداول.

## الانتقال إلى مشروع Supabase آخر (أو أي PostgreSQL)

1. أنشئ مشروع قاعدة بيانات في [Supabase](https://supabase.com) (أو [Neon](https://neon.tech))، واحفظ كلمة مرور القاعدة.
2. من لوحة Supabase اضغط **Connect** في أعلى الصفحة، واختر تبويب **ORMs → Prisma** لتحصل على `DATABASE_URL` و`DIRECT_URL` بالصيغة الجاهزة.
3. ضع الرابطين في `server/.env` (استبدل `[YOUR-PASSWORD]` بكلمة المرور الفعلية).
4. نفّذ:
   ```bash
   cd server
   npm run prisma:migrate
   npm run seed
   ```

لا حاجة لأي تعديل آخر في الكود — `schema.prisma` يستخدم متغيرات البيئة هذه مباشرة.

## ملاحظات أمان قبل النشر الفعلي

- غيّر `JWT_SECRET` و `ADMIN_PASSWORD` إلى قيم قوية وخاصة بك.
- لا ترفع ملف `.env` إلى GitHub (مستثنى بالفعل عبر `.gitignore`).

---

# Product & Inventory Management System

A system for managing products, categories, and stock movements, with a dashboard showing live statistics and low-stock alerts. The visual style is inspired by the Origin design (warm cream background, pill-shaped buttons, serif headings).

## Links

- **Live app (frontend):** https://inventory-management-system-eta-drab.vercel.app
- **API (backend):** https://inventory-management-system-production-3512.up.railway.app/api
- **Repository:** https://github.com/khaloood2024-del/inventory-management-system

Demo login: username `admin` / password `admin123` (recommend changing it right after handoff, from the Users management page).

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
- Fully responsive UI across mobile, tablet, and desktop.
- **Bilingual interface (Arabic / English)** with a language toggle in the top bar — automatically switches the layout direction between RTL and LTR, remembers the chosen language, and even translates error messages coming from the server.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Base UI + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | Cloud PostgreSQL (Supabase) via Prisma ORM |
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
npm run prisma:migrate   # applies the schema to the configured database
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

The project is currently connected to a cloud PostgreSQL database on [Supabase](https://supabase.com) (free tier). The connection string lives in `server/.env` (not committed to Git):

```
DATABASE_URL="postgresql://user:password@pooler-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@direct-host:5432/postgres"
JWT_SECRET="change-this-to-a-long-random-string"
PORT=4000
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin name"
```

- `DATABASE_URL`: the pooled connection (Transaction pooler, port `6543`) — used at normal runtime.
- `DIRECT_URL`: a direct connection (port `5432`) — used only by Prisma Migrate when creating or changing tables.

## Switching to a Different Supabase Project (or Any PostgreSQL)

1. Create a database project on [Supabase](https://supabase.com) (or [Neon](https://neon.tech)), and save the database password.
2. From the Supabase dashboard, click **Connect** at the top of the page, then open the **ORMs → Prisma** tab to get ready-made `DATABASE_URL` and `DIRECT_URL` strings.
3. Put both in `server/.env` (replace `[YOUR-PASSWORD]` with the actual password).
4. Run:
   ```bash
   cd server
   npm run prisma:migrate
   npm run seed
   ```

No other code changes are needed — `schema.prisma` reads these environment variables directly.

## Security Notes Before a Real Deployment

- Change `JWT_SECRET` and `ADMIN_PASSWORD` to strong, private values of your own.
- Never commit the `.env` file to GitHub (already excluded via `.gitignore`).
