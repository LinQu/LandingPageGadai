// Branch types
export interface Branch {
  id: string
  NamaCabang: string
  Kota: string
  Provinsi: string
  Alamat: string
  Phone: string
  latitude: number
  longitude: number
  hours?: string
  distance?: number
}

// Item/Category types
export interface ItemCategory {
  kode: string
  name: string
  icon: string
}

export interface ItemBrand {
  id: string
  kodekat: string
  name: string
}

export interface ItemSeries {
  id: string
  brandId: string
  name: string
}

export interface ItemVariant {
  id: string
  seriesId: string
  name: string
}

export interface ItemStorage {
  id: string
  variantId: string
  name: string
}

export interface ItemYear {
  id: string
  storageId: string
  year: number
}

export interface ItemColor {
  id: string
  yearId: string
  name: string
  valuation: number // Taksiran nilai
}

// Simulation/Booking types
export interface SimulationData {
  branch?: Branch
  branchCode?: string
  category?: ItemCategory
  brand?: ItemBrand
  series?: ItemSeries
  variant?: ItemVariant
  storage?: ItemStorage
  year?: ItemYear
  color?: ItemColor
  itemName?: string
  specification?: string
  valuationMin?: number
  valuationMax?: number
  quantity?: number
  valuation?: number
}

export interface BookingData {
  bookingNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  itemDetails: SimulationData
  totalValuation: number
  bookingDate: Date
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export interface BookingStep {
  step: number
  title: string
  isCompleted: boolean
}

// Article/News types
export interface Article {
  id: string
  title: string
  slug: string
  description: string
  content: string
  image: string
  author: string
  publishedAt: Date
  category: string
  readTime: number
}

// Archive types
export interface ArchiveItem {
  id: string
  bookingNumber: string
  itemName: string
  valuation: number
  bookingDate: Date
  status: 'active' | 'redeemed' | 'extended'
}

// FAQ types
export interface FAQItem {
  id: string
  question: string
  answer: string
}

// Testimonial types
export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  image?: string
}
