export interface UserBuidObj {
  firstname: string;
  lastname: string;
  phone: string;
  bvn: string;
}

export interface Authorization {
  mode: string;
  pin: string;
}

export interface CardInterface {
  fullname: string;
  tx_ref: string;
  amount: string;
  email: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  currency: string;
  redirect_url: string;
  authorization: Authorization;
}

export interface CardCharge {
  token: string;
  currency: string;
  country: string;
  amount: number;
  email: string;
  first_name: string;
  last_name: string;
  narration: string;
  tx_ref: string;
}

export interface MessagingPayload {
  notification?: NotificationMessagePayload;
}

export interface NotificationMessagePayload {
  tag?: string;
  body?: string;
  icon?: string;
  color?: string;
  sound?: string;
  title?: string;
  bodyLocKey?: string;
}
