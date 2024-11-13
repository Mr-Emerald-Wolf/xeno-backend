import { Decimal } from "@prisma/client/runtime/library";

export interface CreateOrderRequest {
    customerId: number;
    orderDate: string;  // Store as ISO date string
    revenue: Decimal;
    cost: Decimal;
  }
  