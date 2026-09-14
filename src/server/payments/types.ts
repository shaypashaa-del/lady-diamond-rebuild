// Payment abstraction: the store never talks to a specific gateway directly.
// Today only manual offline methods exist (matching the live site's actual
// Bank Transfer / Cash on Delivery setup — see AUDIT.md section 12). A real
// gateway (Israeli or international) can be added later by implementing this
// same interface; nothing in checkout/order code needs to change.

export type PaymentMethodId = "bank_transfer" | "cash_on_delivery";

export type PaymentInitResult = {
  // Whether the order should be marked PAID immediately (never true for
  // manual methods) or left PENDING until funds/cash are confirmed.
  immediatelyPaid: boolean;
  // Instructions shown on the order confirmation page.
  instructions: string;
};

export interface PaymentProvider {
  id: PaymentMethodId;
  label: string;
  init(orderTotal: number, orderNumber: string): Promise<PaymentInitResult>;
}

export const bankTransferProvider: PaymentProvider = {
  id: "bank_transfer",
  label: "העברה בנקאית",
  async init(_orderTotal, orderNumber) {
    return {
      immediatelyPaid: false,
      instructions: `יש להעביר את הסכום לחשבון הבנק שלנו ולציין את מספר ההזמנה ${orderNumber} כאסמכתא. ההזמנה תישלח רק לאחר קבלת התשלום.`,
    };
  },
};

export const cashOnDeliveryProvider: PaymentProvider = {
  id: "cash_on_delivery",
  label: "תשלום במזומן בעת המסירה",
  async init() {
    return {
      immediatelyPaid: false,
      instructions: "התשלום יתבצע במזומן ישירות לשליח בעת קבלת המשלוח.",
    };
  },
};

export const paymentProviders: Record<PaymentMethodId, PaymentProvider> = {
  bank_transfer: bankTransferProvider,
  cash_on_delivery: cashOnDeliveryProvider,
};
