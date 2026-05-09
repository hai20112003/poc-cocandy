import type { Supplier } from '@/features/suppliers/types'

export const mockMccSuppliers: Supplier[] = [
  {
    id: 'mcc1', name: 'Công ty TNHH VN Textile', mccCode: 'MCC-001',
    brandIds: ['b1', 'b2'], supplierSourceIds: ['ss1', 'ss2'],
    productCategories: ['NPL'],
    nccInfo: 'Chuyên cung cấp nguyên phụ liệu giày thể thao Nike và Adidas từ Việt Nam. Có kho hàng tại Bình Dương.',
  },
  {
    id: 'mcc2', name: 'Bangkok Sport Import Co.', mccCode: 'MCC-002',
    brandIds: ['b2', 'b3'], supplierSourceIds: ['ss3'],
    productCategories: ['Thành phẩm'],
    nccInfo: 'Nhà cung cấp thành phẩm quần áo thể thao Adidas & Puma, nhập khẩu từ Bangkok.',
  },
  {
    id: 'mcc3', name: 'SEA Sport Partners', mccCode: 'MCC-003',
    brandIds: ['b3'], supplierSourceIds: ['ss4', 'ss5'],
    productCategories: ['NPL', 'Thành phẩm'],
    nccInfo: 'Cung cấp cả NPL và thành phẩm phụ kiện thể thao Puma. Đối tác chiến lược khu vực Đông Nam Á.',
  },
  {
    id: 'mcc4', name: 'Turkey Apparel Manufacturing', mccCode: 'MCC-004',
    brandIds: ['b1', 'b4', 'b5'], supplierSourceIds: ['ss6'],
    productCategories: ['NPL'],
    nccInfo: 'NPL tổng hợp cho Nike, Reebok và Under Armour, xưởng sản xuất tại Thổ Nhĩ Kỳ.',
  },
  {
    id: 'mcc5', name: 'New Balance Asia Ltd', mccCode: 'MCC-005',
    brandIds: ['b6'], supplierSourceIds: ['ss7', 'ss8'],
    productCategories: ['Thành phẩm'],
    nccInfo: 'Thành phẩm New Balance từ Bangladesh và Cambodia. Giao hàng trong 45 ngày.',
  },
  {
    id: 'mcc6', name: 'Malaysia Textile Group', mccCode: 'MCC-006',
    brandIds: ['b2', 'b7'], supplierSourceIds: ['ss9'],
    productCategories: ['NPL', 'Thành phẩm'],
    nccInfo: 'Adidas & Converse — NPL vải và thành phẩm từ Malaysia.',
  },
  {
    id: 'mcc7', name: 'Indo Footwear Exports', mccCode: 'MCC-007',
    brandIds: ['b8', 'b9'], supplierSourceIds: ['ss10'],
    productCategories: ['Thành phẩm'],
    nccInfo: 'Vans & FILA thành phẩm nhập từ Indonesia, kiểm định chất lượng tại Việt Nam.',
  },
]
