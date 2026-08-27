export interface MetaUserData {
  em?: string[]; // SHA256 hashed emails
  ph?: string[]; // SHA256 hashed phones
  fn?: string[]; // SHA256 hashed first names
  ln?: string[]; // SHA256 hashed last names
  ct?: string[]; // SHA256 hashed cities / governorates
  country?: string[]; // SHA256 hashed country code (e.g. 'tn')
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

export interface MetaContentItem {
  id: string;
  quantity: number;
  item_price?: number;
  title?: string;
  category?: string;
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: MetaContentItem[];
  content_type?: "product" | "product_group";
  num_items?: number;
  order_id?: string;
}

export interface MetaEventPayload {
  event_name: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | string;
  event_time: number; // Unix timestamp in seconds
  event_id: string;
  event_source_url?: string;
  action_source: "website";
  user_data: MetaUserData;
  custom_data?: MetaCustomData;
}

export interface MetaCapiOptions {
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  eventId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
}
