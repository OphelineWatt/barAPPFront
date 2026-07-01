export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  userId: number
  email: string
  name: string
  role: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface CocktailIngredient {
  ingredientId: number
  ingredientName?: string
  quantity: string
}

export interface CocktailPrice {
  sizeId: number
  sizeCode?: string
  price: number
}

export interface Cocktail {
  id: number
  name: string
  description?: string
  categoryId?: number
  imageUrl?: string
  active: boolean
  createdById?: number
  ingredients: CocktailIngredient[]
  prices: CocktailPrice[]
}

export type ItemStatus = 'PREPARATION_INGREDIENTS' | 'ASSEMBLAGE' | 'DRESSAGE' | 'TERMINEE'
export type OrderStatus = 'COMMANDEE' | 'EN_COURS' | 'TERMINEE'

export interface OrderItem {
  id: number
  cocktailId: number
  cocktailName: string
  sizeId: number
  sizeCode: string
  quantity: number
  unitPrice: number
  itemStatus: ItemStatus
  startedAt?: string
  finishedAt?: string
}

export interface Order {
  id: number
  userId: number
  status: OrderStatus
  createdAt: string
  totalAmount: number
  pickupCode?: string
  items: OrderItem[]
}

export interface OrderItemRequest {
  cocktailId: number
  sizeId: number
  quantity: number
}

export interface OrderCreateRequest {
  userId: number
  items: OrderItemRequest[]
}

export interface ExternalCocktail {
  name: string
  imageUrl: string
  ingredients: string[]
}

export interface Size {
  id: number
  code: string
  label: string
}
