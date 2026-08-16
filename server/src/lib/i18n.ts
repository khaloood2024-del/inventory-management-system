import { Request } from "express";

export type Lang = "ar" | "en";

const messages = {
  usernameRequired: { ar: "اسم المستخدم مطلوب", en: "Username is required" },
  passwordRequired: { ar: "كلمة المرور مطلوبة", en: "Password is required" },
  invalidCredentials: { ar: "اسم المستخدم أو كلمة المرور غير صحيحة", en: "Incorrect username or password" },
  userNotFound: { ar: "المستخدم غير موجود", en: "User not found" },

  categoryNameRequired: { ar: "اسم التصنيف مطلوب", en: "Category name is required" },
  categoryNameTooLong: { ar: "اسم التصنيف طويل جداً", en: "Category name is too long" },
  categoryNameExists: { ar: "يوجد تصنيف بنفس الاسم مسبقاً", en: "A category with this name already exists" },
  categoryNotFound: { ar: "التصنيف غير موجود", en: "Category not found" },
  categoryHasProducts: {
    ar: "لا يمكن حذف هذا التصنيف لارتباطه بـ {count} منتج",
    en: "Cannot delete this category — {count} product(s) are linked to it",
  },

  productCodeRequired: { ar: "كود المنتج مطلوب", en: "Product code is required" },
  productCodeTooLong: { ar: "كود المنتج طويل جداً", en: "Product code is too long" },
  productNameRequired: { ar: "اسم المنتج مطلوب", en: "Product name is required" },
  productNameTooLong: { ar: "اسم المنتج طويل جداً", en: "Product name is too long" },
  pricePositive: { ar: "السعر يجب أن يكون رقماً موجباً", en: "Price must be a positive number" },
  quantityInteger: { ar: "الكمية يجب أن تكون رقماً صحيحاً", en: "Quantity must be a whole number" },
  quantityPositive: { ar: "الكمية يجب أن تكون رقماً موجباً", en: "Quantity must be a positive number" },
  categoryRequired: { ar: "التصنيف مطلوب", en: "Category is required" },
  productNotFound: { ar: "المنتج غير موجود", en: "Product not found" },
  categoryNotExists: { ar: "التصنيف المحدد غير موجود", en: "The selected category does not exist" },
  productCodeExists: { ar: "يوجد منتج بنفس الكود مسبقاً", en: "A product with this code already exists" },
  openingBalanceReason: { ar: "رصيد افتتاحي عند إضافة المنتج", en: "Opening balance from product creation" },
  manualAdjustmentReason: {
    ar: "تعديل يدوي للكمية من صفحة المنتجات",
    en: "Manual quantity adjustment from the Products page",
  },

  movementProductRequired: { ar: "المنتج مطلوب", en: "Product is required" },
  invalidMovementType: { ar: "نوع الحركة غير صحيح", en: "Invalid movement type" },
  quantityGreaterThanZero: { ar: "الكمية يجب أن تكون رقماً أكبر من صفر", en: "Quantity must be greater than zero" },
  movementReasonRequired: { ar: "سبب الحركة مطلوب", en: "Reason is required" },
  movementReasonTooLong: { ar: "سبب الحركة طويل جداً", en: "Reason is too long" },
  cannotWithdrawMore: {
    ar: "لا يمكن سحب كمية أكبر من المتوفر (المتوفر حالياً: {available})",
    en: "Cannot withdraw more than what's available (currently available: {available})",
  },

  unauthorized: { ar: "غير مصرح، الرجاء تسجيل الدخول", en: "Unauthorized, please sign in" },
  invalidSession: { ar: "جلسة الدخول غير صالحة أو منتهية", en: "Your session is invalid or has expired" },
  forbidden: { ar: "ليس لديك صلاحية للقيام بهذا الإجراء", en: "You don't have permission to do this" },
  routeNotFound: { ar: "المسار غير موجود", en: "Route not found" },
  serverError: { ar: "حدث خطأ غير متوقع في الخادم", en: "An unexpected server error occurred" },
  tooManyRequests: {
    ar: "عدد الطلبات كبير جداً، الرجاء المحاولة بعد قليل",
    en: "Too many requests, please try again shortly",
  },
  tooManyLoginAttempts: {
    ar: "محاولات دخول كثيرة جداً، الرجاء المحاولة بعد 15 دقيقة",
    en: "Too many login attempts, please try again in 15 minutes",
  },

  usernameTooLong: { ar: "اسم المستخدم طويل جداً", en: "Username is too long" },
  nameRequired: { ar: "الاسم مطلوب", en: "Name is required" },
  nameTooLong: { ar: "الاسم طويل جداً", en: "Name is too long" },
  passwordTooShort: { ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", en: "Password must be at least 8 characters" },
  invalidRole: { ar: "الصلاحية غير صحيحة", en: "Invalid role" },
  usernameExists: { ar: "اسم المستخدم مستخدم مسبقاً", en: "This username is already taken" },
  cannotDeleteSelf: { ar: "لا يمكنك حذف حسابك الخاص", en: "You cannot delete your own account" },
  cannotDeleteLastAdmin: {
    ar: "لا يمكن حذف هذا المستخدم لأنه المدير الوحيد المتبقي",
    en: "Cannot delete this user — they are the last remaining admin",
  },
  cannotDemoteLastAdmin: {
    ar: "لا يمكن تغيير صلاحية هذا المستخدم لأنه المدير الوحيد المتبقي",
    en: "Cannot change this user's role — they are the last remaining admin",
  },
} as const;

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey, lang: Lang, params?: Record<string, string | number>): string {
  let text: string = messages[key][lang];
  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, String(value));
    }
  }
  return text;
}

export function getLang(req: Request): Lang {
  return req.header("X-Lang") === "en" ? "en" : "ar";
}
