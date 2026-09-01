import type { BookingData, SimulationData } from '../types'

// Generate unique booking number
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `GS-${new Date().getFullYear()}-${timestamp}${random}`
}

// Create booking
export async function createBooking(data: {
  customerName: string
  customerPhone: string
  customerEmail?: string
  branch: { id: string; name: string }
  itemDetails: SimulationData
  totalValuation: number
}): Promise<BookingData> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const bookingNumber = generateBookingNumber()
  
  return {
    bookingNumber,
    customerId: `CUST-${Date.now()}`,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    itemDetails: data.itemDetails,
    totalValuation: data.totalValuation,
    bookingDate: new Date(),
    status: 'pending',
  }
}

// Get booking by number
export async function getBookingByNumber(bookingNumber: string): Promise<BookingData | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // For demo, return a sample booking (in real app, fetch from database)
  if (bookingNumber.startsWith('GS-')) {
    return {
      bookingNumber,
      customerId: 'CUST-123456',
      customerName: 'John Doe',
      customerPhone: '+62812345678',
      itemDetails: {},
      totalValuation: 9500000,
      bookingDate: new Date('2024-01-15'),
      status: 'confirmed',
    }
  }
  
  return null
}

// Get booking status timeline
export function getBookingTimeline(booking: BookingData) {
  const steps = [
    {
      status: 'pending',
      title: 'Pemesanan Dibuat',
      description: 'Pemesanan Anda telah diterima',
      timestamp: booking.bookingDate,
      icon: '📝',
    },
    {
      status: 'confirmed',
      title: 'Dikonfirmasi',
      description: 'Pemesanan telah dikonfirmasi',
      timestamp: new Date(booking.bookingDate.getTime() + 1000 * 60 * 30),
      icon: '✓',
    },
    {
      status: 'completed',
      title: 'Selesai',
      description: 'Gadai barang telah selesai',
      timestamp: new Date(booking.bookingDate.getTime() + 1000 * 60 * 60),
      icon: '🎉',
    },
  ]
  
  const currentIndex = steps.findIndex(s => s.status === booking.status)
  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    current: index === currentIndex,
  }))
}

// Calculate interest (bunga gadai)
export function calculateInterest(
  principal: number,
  months: number,
  monthlyRate: number = 0.02 // 2% per month default
): number {
  return Math.round(principal * monthlyRate * months)
}

// Format valuation to currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
