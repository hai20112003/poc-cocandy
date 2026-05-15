cat > /Users/hainv03/Documents/project/poc-cocandy-v2/src/features/goodsReceipt/mockData.ts << 'GRNEOF'
import { IGRN, IReturn } from './types'

const baseDate = new Date('2026-05-15')

export const mockGoodsReceipts: IGRN[] = [
  {
    id: 'grn-001',
    code: 'GRN-2026-001',
    poId: 'po-001',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Completed',
    isPartial: false,
    items: [
      {
        id: 'grni-001',
        productId: 'prod-001',
        productName: 'Vải Cotton Trắng',
        expectedQty: 200,
        receivedQty: 200,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Đạt chuẩn, khổ đúng 150cm',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-002',
    code: 'GRN-2026-002',
    poId: 'po-002',
    supplierId: 'sup-002',
    supplierName: 'Phụ Liệu XYZ',
    status: 'QC In Progress',
    isPartial: false,
    items: [
      {
        id: 'grni-002',
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        expectedQty: 3000,
        receivedQty: 2800,
        unit: 'cái',
        qcStatus: 'Pending',
        notes: 'Kiểm tra mẫu, có 200 cái thiếu so PO',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'grn-003',
    code: 'GRN-2026-003',
    poId: 'po-003',
    supplierId: 'sup-001',
    supplierName: 'Vải ABC Trading Co.',
    status: 'Submitted',
    isPartial: true,
    items: [
      {
        id: 'grni-003',
        productId: 'prod-002',
        productName: 'Vải Cotton Xanh Navy',
        expectedQty: 150,
        receivedQty: 100,
        unit: 'mét',
        qcStatus: 'Pass',
        notes: 'Nhận 100m, còn 50m sẽ gửi tuần tới',
      },
    ],
    receivedDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
]

export const mockReturns: IReturn[] = [
  {
    id: 'ret-001',
    grnId: 'grn-002',
    returnDate: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    reason: 'over_delivery',
    items: [
      {
        productId: 'prod-005',
        productName: 'Nút nhựa 15mm',
        returnQty: 200,
        unit: 'cái',
      },
    ],
    status: 'pending',
  },
]
