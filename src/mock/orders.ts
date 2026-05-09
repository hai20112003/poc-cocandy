import type { Order, OrderStatus } from '@/features/orders/types'

const STATUSES: OrderStatus[] = ['draft', 'pending', 'confirmed', 'in_transit', 'delivered', 'overdue']
const SUPPLIER_IDS = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15']
const BRAND_IDS = ['b1','b2','b3','b4','b5','b6','b7','b8','b9','b10','b11','b12','b13','b14','b15']
const CURRENCIES = ['USD', 'USD', 'USD', 'EUR', 'USD']
const PRODUCTS = [
  'Running Shoes', 'Sports Jersey', 'Training Shorts', 'Hoodie', 'Track Pants',
  'Sports Socks', 'Cap', 'Backpack', 'Water Bottle', 'Gym Gloves',
  'Yoga Mat', 'Resistance Bands', 'Foam Roller', 'Jump Rope', 'Dumbbell Set',
]

function addDays(base: Date, days: number): string {
  return new Date(base.getTime() + days * 86_400_000).toISOString()
}

function generateOrder(i: number): Order {
  const base = new Date('2026-01-15')
  const createdAt = addDays(base, i * 3)
  const amount = Math.round((1200 + (i * 1337 % 48000)) / 100) * 100

  return {
    id: `PO-${2400 + i}`,
    supplierId: SUPPLIER_IDS[i % SUPPLIER_IDS.length],
    brandId: BRAND_IDS[i % BRAND_IDS.length],
    amount,
    currency: CURRENCIES[i % CURRENCIES.length],
    status: STATUSES[i % STATUSES.length],
    createdAt,
    expectedDate: addDays(new Date(createdAt), 30 + (i % 15)),
    items: [
      {
        id: `PO-${2400 + i}-1`,
        productName: PRODUCTS[i % PRODUCTS.length],
        quantity: (i % 10) + 1,
        unitPrice: Math.round(amount * 0.7 / ((i % 10) + 1) / 10) * 10,
      },
      ...(i % 3 === 0
        ? [{
            id: `PO-${2400 + i}-2`,
            productName: PRODUCTS[(i + 5) % PRODUCTS.length],
            quantity: (i % 4) + 1,
            unitPrice: Math.round(amount * 0.3 / ((i % 4) + 1) / 10) * 10,
          }]
        : []),
    ],
  }
}

export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => generateOrder(i + 1))
