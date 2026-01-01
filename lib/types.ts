export interface Coin {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  year: number
  metal: string
  weight: number
  purity: string
  rarity_level: string
  quantity_available: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  coin_id: string
  quantity: number
  coin?: Coin
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  shipping_address_id: string
  payment_method: string
  payment_status: string
  order_status: string
  courier_service: string
  tracking_number: string
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  street: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  avatar_url: string
  created_at: string
  updated_at: string
}
