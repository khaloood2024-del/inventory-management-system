export type Role = "ADMIN" | "EMPLOYEE";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productsCount: number;
  createdAt: string;
}

export type StockStatus = "available" | "low" | "out";

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  categoryId: string;
  categoryName: string;
  stockStatus: StockStatus;
  createdAt: string;
}

export type MovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: MovementType;
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: {
    id: string;
    code: string;
    name: string;
    quantity: number;
    categoryName: string;
  }[];
  recentMovements: StockMovement[];
}
