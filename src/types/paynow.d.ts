declare module "paynow" {
  export class CartItem {
    constructor(title: string, quantity: number, price: number);
  }

  export class Cart {
    constructor();
    add(item: CartItem): void;
    items(): CartItem[];
    total(): number;
    length(): number;
  }

  export class Payment {
    constructor(reference: string, authEmail?: string);
    add(title: string, amount: number): void;
    total(): number;
    info(): string;
    reference: string;
    authEmail?: string;
    items: Cart;
  }

  export class InitResponse {
    success: boolean;
    hasRedirect: boolean;
    redirectUrl?: string;
    pollUrl?: string;
    error?: string;
    status: string;
    isInnbucks: boolean;
    instructions?: string;
    innbucks_info?: Array<{
      authorizationcode: string;
      deep_link_url: string;
      qr_code: string;
      expires_at: string;
    }>;
  }

  export class StatusResponse {
    reference?: string;
    amount?: string;
    paynowReference?: string;
    pollUrl?: string;
    status?: string;
    error?: string;
  }

  export class Paynow {
    constructor(
      integrationId: string,
      integrationKey: string,
      resultUrl: string,
      returnUrl: string
    );
    createPayment(reference: string, authEmail?: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(
      payment: Payment,
      phone: string,
      method: string
    ): Promise<InitResponse>;
    pollTransaction(url: string): Promise<StatusResponse>;
    parseStatusUpdate(response: string): StatusResponse;
  }
}