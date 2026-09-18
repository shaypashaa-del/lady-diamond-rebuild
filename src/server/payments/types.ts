// Payment abstraction: the store never talks to a specific gateway directly.
// Today only manual offline methods exist (matching the live site's actual
// Bank Transfer / Cash on Delivery setup — see AUDIT.md section 12). A real
// gateway (Israeli or international) can be added later by implementing this
// same interface; nothing in checkout/order code needs to change.

export type PaymentMethodId = "bank_transfer" | "cash_on_delivery" | "bit" | "credit_card" | "paypal";

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
  // `meta` carries provider-specific data the client collected before
  // calling createOrder — e.g. PayPal's approved order id, used here to
  // verify the payment server-side instead of trusting the client.
  init(orderTotal: number, orderNumber: string, meta?: Record<string, string>): Promise<PaymentInitResult>;
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

// Bit and Credit Card are shown to customers as real intent-to-pay options,
// but — like Bank Transfer/COD — settle manually for now: no Israeli payment
// processor (Cardcom/Tranzila/Meshulam/PayPlus) is connected yet, so nothing
// here actually charges a card or requests a Bit payment. Swap the body of
// `init` for a real gateway call once that account exists; checkout/order
// code doesn't need to change.
export const bitProvider: PaymentProvider = {
  id: "bit",
  label: "ביט",
  async init(_orderTotal, orderNumber) {
    return {
      immediatelyPaid: false,
      instructions: `ניצור איתך קשר בקרוב לשליחת בקשת תשלום בביט עבור הזמנה ${orderNumber}. ההזמנה תישלח רק לאחר קבלת התשלום.`,
    };
  },
};

export const creditCardProvider: PaymentProvider = {
  id: "credit_card",
  label: "כרטיס אשראי",
  async init(_orderTotal, orderNumber) {
    return {
      immediatelyPaid: false,
      instructions: `ניצור איתך קשר בקרוב לגביית התשלום בכרטיס אשראי עבור הזמנה ${orderNumber}. ההזמנה תישלח רק לאחר קבלת התשלום.`,
    };
  },
};

// PayPal is real, not manual: the client renders PayPal's own Buttons SDK
// and captures the payment through PayPal directly. This just verifies that
// capture actually happened before trusting it.
//
// NEXT_PUBLIC_PAYPAL_CLIENT_ID defaults to "sb" — PayPal's public sandbox
// test id, so the button renders and can be clicked immediately with no
// account setup. It has no matching secret, so until a real PAYPAL_CLIENT_SECRET
// is configured, capture is trusted client-side (fine for demoing the flow,
// never for a production launch — see .env.example for how to go live).
async function getPaypalAccessToken(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) return null;

  const base = clientId.startsWith("sb") ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",
  label: "PayPal",
  async init(orderTotal, orderNumber, meta) {
    const paypalOrderId = meta?.paypalOrderId;
    if (!paypalOrderId) {
      return { immediatelyPaid: false, instructions: `לא התקבל אישור תשלום מ-PayPal עבור הזמנה ${orderNumber}.` };
    }

    const token = await getPaypalAccessToken();
    if (!token) {
      // No live PayPal credentials configured yet — trust the client-side
      // approval (sandbox/demo mode only).
      return {
        immediatelyPaid: true,
        instructions: `שולם באמצעות PayPal (מצב בדיקה — מזהה הזמנת PayPal: ${paypalOrderId}).`,
      };
    }

    const base = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.startsWith("sb")
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";
    const verifyRes = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!verifyRes.ok) {
      return { immediatelyPaid: false, instructions: `אימות תשלום PayPal נכשל עבור הזמנה ${orderNumber}.` };
    }
    const order = (await verifyRes.json()) as {
      status?: string;
      purchase_units?: { amount?: { value?: string } }[];
    };
    const paidAmount = Number(order.purchase_units?.[0]?.amount?.value ?? 0);
    const verified = order.status === "COMPLETED" && Math.abs(paidAmount - orderTotal) < 0.01;

    return verified
      ? { immediatelyPaid: true, instructions: `שולם באמצעות PayPal (מזהה הזמנה: ${paypalOrderId}).` }
      : { immediatelyPaid: false, instructions: `אימות תשלום PayPal לא הצליח עבור הזמנה ${orderNumber}.` };
  },
};

export const paymentProviders: Record<PaymentMethodId, PaymentProvider> = {
  bank_transfer: bankTransferProvider,
  cash_on_delivery: cashOnDeliveryProvider,
  bit: bitProvider,
  credit_card: creditCardProvider,
  paypal: paypalProvider,
};
