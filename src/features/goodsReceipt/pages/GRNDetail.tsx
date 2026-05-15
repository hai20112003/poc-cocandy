import { useParams, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { ChevronLeft, Edit, AlertCircle, Undo2, Check, CheckCircle, Package, FileText, Download, Mail, Send } from 'lucide-react'
import { useProcurementStore } from '@/store/procurementStore'
import { useGRNWorkflow } from '@/hooks/useWorkflow'

export function GRNDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'items' | 'matching' | 'returns'>('items')
  const goodsReceipt = useProcurementStore((state) => state.getGoodsReceipt(id || ''))
  const allGRNsRaw = useProcurementStore((state) => state.goodsReceipts)
  const { submitGRN, completeReceiving, startQC, completeQC, rejectQC } = useGRNWorkflow()
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [invoiceType, setInvoiceType] = useState<'by-grn' | 'consolidated'>('by-grn')
  const [paymentTerms, setPaymentTerms] = useState('NET 30')
  const purchaseOrder = goodsReceipt ? useProcurementStore((state) => state.getPurchaseOrder(goodsReceipt.poId)) : null
  const supplier = purchaseOrder ? useProcurementStore((state) => state.getSupplier(purchaseOrder.supplierId)) : null
  const [emailTo, setEmailTo] = useState('')
  const [emailCc, setEmailCc] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSentSuccess, setEmailSentSuccess] = useState(false)

  const allGRNs = useMemo(() => {
    if (!goodsReceipt) return []
    return allGRNsRaw.filter(gr => gr.poId === goodsReceipt.poId)
  }, [allGRNsRaw, goodsReceipt?.poId])

  if (!goodsReceipt) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Không Tìm Thấy Phiếu Nhập Hàng</h1>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      case 'Received':
        return 'bg-purple-100 text-purple-800'
      case 'QC In Progress':
        return 'bg-orange-100 text-orange-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'Nháp'
      case 'Submitted':
        return 'Đã gửi'
      case 'Received':
        return 'Đã nhận'
      case 'QC In Progress':
        return 'Kiểm tra QC'
      case 'Completed':
        return 'Hoàn thành'
      case 'Rejected':
        return 'Từ chối'
      default:
        return status
    }
  }

  const totalReceived = goodsReceipt.items.reduce((sum, item) => sum + (item.receivedQty ?? 0), 0)
  const totalExpected = goodsReceipt.items.reduce((sum, item) => sum + item.expectedQty, 0)
  const totalAccepted = goodsReceipt.items.reduce((sum, item) => sum + item.acceptedQty, 0)
  const totalRejected = goodsReceipt.items.reduce((sum, item) => sum + item.rejectedQty, 0)

  const qcCriteria = [
    { name: 'Kiểm lỗi dệt/nhuộm', result: 'Pass', note: '0 lỗi, đạt tiêu chuẩn' },
    { name: 'Độ co rút', result: 'Pass', note: '<3%, đạt tiêu chuẩn' },
    { name: 'Khổ vải đủ rộng', result: 'Pass', note: '150cm ±0.5cm' },
  ]

  const generateInvoiceCode = () => {
    const date = new Date()
    const year = date.getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}-${random}`
  }

  const handleExportInvoice = (printDirectly: boolean = false) => {
    if (!goodsReceipt || !purchaseOrder || !supplier) return

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoiceItems = goodsReceipt.items
      .filter(item => item.acceptedQty > 0)
      .map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.acceptedQty,
        unit: item.unit,
        unitPrice: purchaseOrder.items.find(pi => pi.productName === item.productName)?.unitPrice || 0,
        totalAmount: (item.acceptedQty * (purchaseOrder.items.find(pi => pi.productName === item.productName)?.unitPrice || 0))
      }))

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0)
    const vat = Math.round(subtotal * 0.1)
    const total = subtotal + vat

    const invoiceCode = generateInvoiceCode()
    const invoiceDate = new Date().toLocaleDateString('vi-VN')
    const dueDateStr = dueDate.toLocaleDateString('vi-VN')

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoiceCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Times New Roman', Times, serif;
            background: white;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .invoice-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .invoice-title {
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .info-section {
            margin: 15px 0;
            display: flex;
            justify-content: space-between;
          }
          .info-block {
            flex: 1;
          }
          .info-row {
            display: flex;
            margin: 8px 0;
            font-size: 13px;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            min-width: 140px;
          }
          .info-value {
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          th {
            background: #f5f5f5;
            padding: 10px;
            text-align: left;
            border: 1px solid #999;
            font-weight: bold;
            border-bottom: 2px solid #000;
          }
          td {
            padding: 9px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .total-section {
            margin-top: 20px;
            margin-left: auto;
            width: 350px;
          }
          .total-row {
            display: flex;
            margin: 8px 0;
            font-size: 13px;
          }
          .total-label {
            flex: 1;
            font-weight: normal;
          }
          .total-amount {
            width: 120px;
            text-align: right;
            font-weight: bold;
          }
          .final-total {
            font-size: 14px;
            font-weight: bold;
            margin-top: 8px;
            border-top: 2px solid #000;
            padding-top: 8px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #999;
            font-size: 11px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          .stamp-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-around;
            font-size: 11px;
            text-align: center;
          }
          .stamp-box {
            width: 150px;
            height: 80px;
            border: 1px solid #ddd;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          @media print {
            body { padding: 0; }
            .invoice-container { border: none; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">COCANDY ERP SYSTEM</div>
            <div style="font-size: 12px; color: #666;">Hệ thống quản lý kinh doanh tích hợp</div>
          </div>

          <div class="invoice-title">HÓA ĐƠN CUNG CẤP HÀNG HÓA</div>

          <div class="info-section">
            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Mã HĐ:</span>
                <span class="info-value"><strong>${invoiceCode}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày lập:</span>
                <span class="info-value">${invoiceDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Hạn thanh toán:</span>
                <span class="info-value">${dueDateStr}</span>
              </div>
            </div>
            <div class="info-block">
              <div class="info-row">
                <span class="info-label">Liên kết PO:</span>
                <span class="info-value"><strong>${purchaseOrder.code}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">GRN:</span>
                <span class="info-value">${goodsReceipt.code}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Điều khoản TT:</span>
                <span class="info-value">${paymentTerms}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
            <div class="info-row">
              <span class="info-label">Nhà cung cấp:</span>
              <span class="info-value">${supplier.name}</span>
            </div>
          </div>

          <div style="margin-top: 25px;">
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Sản phẩm</th>
                  <th style="width: 12%; text-align: right;">Số lượng</th>
                  <th style="width: 18%; text-align: right;">Đơn giá</th>
                  <th style="width: 25%; text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItems.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td style="text-align: right;">${item.quantity} ${item.unit}</td>
                    <td style="text-align: right;">${item.unitPrice.toLocaleString('vi-VN')} đ</td>
                    <td style="text-align: right;">${item.totalAmount.toLocaleString('vi-VN')} đ</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Tổng tiền hàng:</span>
              <span class="total-amount">${subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="total-row">
              <span class="total-label">Thuế GTGT (10%):</span>
              <span class="total-amount">${vat.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="total-row final-total">
              <span class="total-label">CỘNG TIỀN THANH TOÁN:</span>
              <span class="total-amount">${total.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div class="stamp-section">
            <div class="stamp-box">
              <div style="text-align: center; font-size: 10px;">
                <strong>Người lập</strong><br><br><br>
              </div>
            </div>
            <div class="stamp-box">
              <div style="text-align: center; font-size: 10px;">
                <strong>Kiểm duyệt</strong><br><br><br>
              </div>
            </div>
            <div class="stamp-box">
              <div style="text-align: center; font-size: 10px;">
                <strong>Thẩm phê</strong><br><br><br>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Ghi chú:</strong> Hóa đơn này được tạo tự động bởi hệ thống COCANDY ERP</p>
            <p style="margin-top: 8px; color: #999;">Thời gian xuất: ${new Date().toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </body>
      </html>
    `

    if (printDirectly) {
      const printWindow = window.open('', '', 'width=900,height=700')
      if (printWindow) {
        printWindow.document.write(invoiceHTML)
        printWindow.document.close()
        setTimeout(() => {
          printWindow.print()
        }, 250)
      }
    } else {
      const blob = new Blob([invoiceHTML], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoiceCode}.html`
      link.click()
      URL.revokeObjectURL(url)
    }

    setShowInvoiceModal(false)
  }

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      alert('Vui lòng nhập địa chỉ email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      alert('Email không hợp lệ')
      return
    }

    setIsSendingEmail(true)

    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, you would call an API endpoint here:
      // const response = await fetch('/api/send-invoice', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: emailTo,
      //     cc: emailCc,
      //     subject: emailSubject,
      //     message: emailMessage,
      //     grnCode: goodsReceipt.code,
      //     invoiceType
      //   })
      // })

      setEmailSentSuccess(true)
      setTimeout(() => {
        setShowEmailModal(false)
        setEmailSentSuccess(false)
      }, 2000)
    } catch (error) {
      alert('Gửi email thất bại. Vui lòng thử lại.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
              Quay lại
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {goodsReceipt.code}
                </h1>
                {allGRNs.length > 1 && (
                  <span className="badge bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    #{allGRNs.indexOf(goodsReceipt) + 1} / {allGRNs.length} lần
                  </span>
                )}
                <span className={`badge ${getStatusColor(goodsReceipt.status)} text-xs font-medium px-2 py-1 rounded-full`}>
                  {getStatusLabel(goodsReceipt.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">Liên kết {purchaseOrder?.code} · {supplier?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {goodsReceipt.status !== 'Draft' && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <FileText size={18} />
                Xuất Hóa Đơn
              </button>
            )}
            {goodsReceipt.status === 'Draft' && (
              <>
                <button
                  onClick={() => navigate(`/goods-receipts/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit size={18} />
                  Sửa
                </button>
                <button
                  onClick={() => submitGRN(id || '')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={18} />
                  Gửi duyệt
                </button>
              </>
            )}
            {goodsReceipt.status === 'Submitted' && (
              <button
                onClick={() => completeReceiving(id || '')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Check size={18} />
                Xác nhận đã nhận
              </button>
            )}
            {goodsReceipt.status === 'Received' && (
              <button
                onClick={() => startQC(id || '', 'Inspector')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <CheckCircle size={18} />
                Bắt đầu QC
              </button>
            )}
            {goodsReceipt.status === 'QC In Progress' && (
              <>
                <button
                  onClick={() => completeQC(id || '')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Check size={18} />
                  Đạt QC
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <AlertCircle size={18} />
                  Không đạt QC
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub tabs */}
        <div className="bg-white border-b border-gray-200 mb-6 rounded-t-lg">
          <div className="flex gap-0 px-6">
            {(['items', 'matching', 'returns'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab === 'items' ? 'Phiếu Nhập Kho (GRN)' : tab === 'matching' ? 'Đối Chiếu 3 Chiều' : 'Lịch Sử Trả Hàng'}
              </button>
            ))}
            {goodsReceipt.isPartial && (
              <div className="ml-auto flex items-center gap-2 text-orange-600 px-4 py-3">
                <span className="text-xl">⏳</span>
                <div className="text-sm">
                  <span className="font-medium">Chờ Hàng</span>
                  <span className="text-xs block text-orange-500">Còn {totalExpected - totalReceived} chưa nhận</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'items' && (
              <>
            {/* Section 1: Thông Tin Nhận Hàng & QC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin Nhận Hàng</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Liên Kết PO</div>
                    <button
                      onClick={() => navigate(`/orders/${goodsReceipt.poId}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {purchaseOrder?.code || 'Unknown'}
                    </button>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Nhà Cung Cấp</div>
                    <div className="font-medium text-gray-900">{supplier?.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ngày Nhập Hàng</div>
                    <div className="text-gray-900">{new Date(goodsReceipt.receivedDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Người Nhận</div>
                    <div className="text-gray-900">{goodsReceipt.receivedBy || '—'}</div>
                  </div>
                  {goodsReceipt.notes && (
                    <div>
                      <div className="text-sm text-gray-600">Ghi Chú</div>
                      <div className="text-gray-900 text-sm">{goodsReceipt.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* QC Checklist */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kiểm Tra Chất Lượng (QC)</h2>
                <div className="space-y-2">
                  {qcCriteria.map((criteria, idx) => (
                    <div key={idx} className="pb-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm text-gray-700">{criteria.name}</span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800">
                          ✓ {criteria.result}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{criteria.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Danh Sách Mặt Hàng */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Chi Tiết Hàng Nhận ({goodsReceipt.items.length})
                </h2>
                {goodsReceipt.isPartial && (
                  <span className="badge bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                    ◑ Giao Một Phần — còn {totalExpected - totalReceived} {goodsReceipt.items[0]?.unit}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-3 text-left font-semibold text-gray-700">Tên hàng</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700" style={{width: '65px'}}>SL đặt</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700" style={{width: '80px'}}>Thực nhận</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700" style={{width: '80px'}}>Chấp nhận</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700" style={{width: '70px'}}>Từ chối</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700" style={{width: '70px'}}>Còn lại</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700" style={{width: '90px'}}>Số lô</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700" style={{width: '80px'}}>Vị trí kho</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Ghi chú QC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goodsReceipt.items.map((item) => {
                      const remaining = item.expectedQty - item.acceptedQty - item.rejectedQty
                      const isBackorder = item.receivedQty === 0
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100"
                          style={{
                            background: isBackorder ? '#f8fafc' : 'white',
                            color: isBackorder ? '#94a3b8' : 'inherit'
                          }}
                        >
                          <td className="px-6 py-4 font-medium" style={{color: isBackorder ? '#94a3b8' : '#111827'}}>
                            {item.productName}
                          </td>
                          <td className="px-4 py-4 text-center" style={{color: isBackorder ? '#94a3b8' : 'inherit'}}>
                            {item.expectedQty}{item.unit}
                          </td>
                          <td className="px-4 py-4 text-center text-gray-900">
                            {item.receivedQty}
                          </td>
                          <td className="px-4 py-4 text-center text-gray-900">
                            {item.acceptedQty}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span style={{
                              color: item.rejectedQty > 0 ? '#dc2626' : 'inherit'
                            }}>
                              {item.rejectedQty}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center" style={{
                            color: remaining === 0 ? '#059669' : '#dc2626',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            {remaining}{item.unit} {remaining === 0 ? '✓' : ''}
                          </td>
                          <td className="px-4 py-4 text-xs text-gray-500">{item.batchNo || '—'}</td>
                          <td className="px-4 py-4 text-xs text-gray-500">{item.storageLocation || '—'}</td>
                          <td className="px-4 py-4 text-xs text-gray-600">{item.notes || '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Backorder notice */}
              {goodsReceipt.isPartial && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">⏳</span>
                  <div>
                    <div className="font-semibold text-amber-900">Chờ Hàng tự động sẽ được tạo</div>
                    <div className="text-sm text-amber-700 mt-1">
                      Còn {totalExpected - totalReceived} {goodsReceipt.items[0]?.unit} chưa nhận. Hệ thống sẽ tự tạo GRN tiếp theo sau khi xác nhận GRN này.
                    </div>
                  </div>
                </div>
              )}
            </div>
              </>
            )}

            {activeTab === 'matching' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Đối Chiếu 3 Chiều — {purchaseOrder?.code}</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {/* PO Column */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-2 mb-4 text-blue-700 font-semibold">
                        <CheckCircle size={18} />
                        Đơn Đặt Hàng
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="text-gray-600">Số Lượng Đặt (SL)</div>
                          <div className="font-semibold text-gray-900">{totalExpected}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Đơn Giá</div>
                          <div className="font-semibold text-gray-900">
                            {purchaseOrder ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              purchaseOrder.items.reduce((sum, item) => sum + item.unitPrice, 0) / purchaseOrder.items.length
                            ) : '—'}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-gray-600">Tổng PO</div>
                          <div className="font-bold text-blue-700">
                            {purchaseOrder ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              purchaseOrder.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            ) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                      <div className="text-gray-400">→</div>
                    </div>

                    {/* GRN Column */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold">
                        <Package size={18} />
                        Phiếu Nhập Kho (GRN)
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="text-gray-600">SL Nhận Về</div>
                          <div className="font-semibold text-gray-900">{totalReceived}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">SL Chấp Nhận</div>
                          <div className="font-semibold text-green-700">{totalAccepted}</div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-gray-600">SL Từ Chối</div>
                          <div className="font-semibold text-red-600">{totalRejected}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Result */}
                  <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">✓</div>
                    <div>
                      <div className="font-semibold text-green-900">Đối Chiếu 3 Chiều Thành Công</div>
                      <div className="text-sm text-green-700 mt-1">
                        SL GRN = SL HĐ ({totalAccepted}) · Giá khớp với PO · Sẵn sàng thanh toán
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch Sử Trả Hàng</h2>
                {goodsReceipt.returns && goodsReceipt.returns.length > 0 ? (
                  <div className="space-y-4">
                    {goodsReceipt.returns.map((returnItem) => (
                      <div key={returnItem.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{returnItem.productName}</div>
                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                              <div>
                                <div className="text-gray-600">Số Lượng Trả</div>
                                <div className="text-gray-900">{returnItem.quantityReturned}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Lý Do</div>
                                <div className="text-gray-900">{returnItem.reason}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Ngày Trả</div>
                                <div className="text-gray-900">{new Date(returnItem.returnDate).toLocaleDateString('vi-VN')}</div>
                              </div>
                              {returnItem.notes && (
                                <div>
                                  <div className="text-gray-600">Ghi Chú</div>
                                  <div className="text-gray-900">{returnItem.notes}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <Undo2 size={24} className="text-orange-600 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">
                    <Package size={40} className="mx-auto mb-2 text-gray-400" />
                    <p>Chưa có hàng trả lại</p>
                  </div>
                )}
              </div>
            )}

            {/* Section 3: QC Information */}
            {goodsReceipt.qcStatus && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin QC</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Trạng Thái QC</div>
                    <div className="text-gray-900">{goodsReceipt.qcStatus}</div>
                  </div>
                  {goodsReceipt.qcStartedAt && (
                    <div>
                      <div className="text-sm text-gray-600">Ngày Bắt Đầu QC</div>
                      <div className="text-gray-900">{new Date(goodsReceipt.qcStartedAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  )}
                  {goodsReceipt.qcCompletedAt && (
                    <div>
                      <div className="text-sm text-gray-600">Ngày Hoàn Thành QC</div>
                      <div className="text-gray-900">{new Date(goodsReceipt.qcCompletedAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                  )}
                  {goodsReceipt.qcInspector && (
                    <div>
                      <div className="text-sm text-gray-600">Người Kiểm Tra</div>
                      <div className="text-gray-900">{goodsReceipt.qcInspector}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Returns */}
            {goodsReceipt.returns && goodsReceipt.returns.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Hàng Trả Lại ({goodsReceipt.returns.length})
                </h2>
                <div className="space-y-4">
                  {goodsReceipt.returns.map((returnItem) => (
                    <div key={returnItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{returnItem.productName}</div>
                          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <div className="text-gray-600">Số Lượng Trả</div>
                              <div className="text-gray-900">{returnItem.quantityReturned}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Lý Do</div>
                              <div className="text-gray-900">{returnItem.reason}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Ngày Trả</div>
                              <div className="text-gray-900">{new Date(returnItem.returnDate).toLocaleDateString('vi-VN')}</div>
                            </div>
                            {returnItem.notes && (
                              <div>
                                <div className="text-gray-600">Ghi Chú</div>
                                <div className="text-gray-900">{returnItem.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Undo2 size={24} className="text-orange-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary & Info */}
          <div className="space-y-6">
            {activeTab === 'items' && (
              <>
            {/* GRN Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tóm Tắt Nhập Hàng</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600">Tổng Dự Kiến</div>
                  <div className="font-medium text-lg text-blue-900">
                    {totalExpected}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Đã Nhập</div>
                  <div className="font-medium text-lg text-green-600">{totalReceived}</div>
                </div>
                <div>
                  <div className="text-gray-600">Chấp Nhận</div>
                  <div className="font-medium text-lg text-green-600">{totalAccepted}</div>
                </div>
                <div>
                  <div className="text-gray-600">Từ Chối</div>
                  <div className="font-medium text-lg text-red-600">{totalRejected}</div>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="text-gray-600">Còn Lại</div>
                  <div className="font-medium text-lg text-orange-600">
                    {totalExpected - totalReceived}
                  </div>
                </div>
              </div>
            </div>

            {/* Related GRNs */}
            {allGRNs.length > 1 && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Lịch Sử GRN cho PO này</h3>
                <div className="space-y-2">
                  {allGRNs.map((grn, idx) => (
                    <button
                      key={grn.id}
                      onClick={() => navigate(`/goods-receipts/${grn.id}`)}
                      className={`w-full text-left p-2 rounded border transition ${
                        grn.id === goodsReceipt.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {grn.code}
                        <span className="ml-2 text-xs badge bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {new Date(grn.receivedDate).toLocaleDateString('vi-VN')} · {grn.status}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier Information */}
            {supplier && (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông Tin NCC</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Tên</div>
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Mã Số Thuế</div>
                    <div className="font-medium text-gray-900 text-xs">{supplier.taxCode}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Địa Chỉ</div>
                    <div className="font-medium text-gray-900 text-xs">{supplier.address}</div>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Không Đạt QC</h2>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Lý do không đạt QC"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectionReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    rejectQC(id || '', rejectionReason)
                    setShowRejectForm(false)
                    navigate('/goods-receipts')
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Không Đạt QC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Export Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Xuất Hóa Đơn
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kiểu Hóa Đơn</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoice-type"
                      value="by-grn"
                      checked={invoiceType === 'by-grn'}
                      onChange={(e) => setInvoiceType(e.target.value as 'by-grn' | 'consolidated')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Hóa đơn theo GRN</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="invoice-type"
                      value="consolidated"
                      checked={invoiceType === 'consolidated'}
                      onChange={(e) => setInvoiceType(e.target.value as 'by-grn' | 'consolidated')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Hóa đơn gộp</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điều Khoản Thanh Toán</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Thanh toán ngay</option>
                  <option>NET 15</option>
                  <option>NET 30</option>
                  <option>NET 60</option>
                  <option>COD (Trả tiền khi nhận)</option>
                  <option>Thanh toán trước</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <div className="font-medium">Tóm tắt hóa đơn:</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div>Số dòng: {goodsReceipt.items.filter(i => i.acceptedQty > 0).length}</div>
                  <div>Tổng SL chấp nhận: {totalAccepted}</div>
                  <div>Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    goodsReceipt.items.reduce((sum, item) => {
                      const unitPrice = purchaseOrder?.items.find(pi => pi.productName === item.productName)?.unitPrice || 0
                      return sum + (item.acceptedQty * unitPrice)
                    }, 0)
                  )}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Đóng
              </button>
              <button
                onClick={() => handleExportInvoice(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
              >
                <Download size={16} />
                Tải xuống
              </button>
              <button
                onClick={() => handleExportInvoice(true)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
              >
                <FileText size={16} />
                In ngay
              </button>
              <button
                onClick={() => {
                  setEmailTo(supplier?.email || '')
                  setEmailCc('')
                  setEmailSubject(`Hóa đơn cung cấp hàng - ${purchaseOrder?.code || ''}`)
                  setEmailMessage(`Kính gửi ${supplier?.name || ''},\n\nXin vui lòng xem hóa đơn đính kèm.\n\nTrân trọng,\nCocandy ERP System`)
                  setShowInvoiceModal(false)
                  setShowEmailModal(true)
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 text-sm"
              >
                <Mail size={16} />
                Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {emailSentSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Gửi Email Thành Công!</h2>
                <p className="text-gray-600 text-sm">Hóa đơn đã được gửi đến {emailTo}</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Gửi Hóa Đơn Qua Email
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Người Nhận *</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="Email nhà cung cấp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CC (Tùy chọn)</label>
                    <input
                      type="email"
                      value={emailCc}
                      onChange={(e) => setEmailCc(e.target.value)}
                      placeholder="Email CC"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chủ Đề</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nội Dung</label>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    <div className="font-medium">📎 Đính kèm:</div>
                    <div className="mt-1">Hóa đơn (file HTML)</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    disabled={isSendingEmail}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSendingEmail ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Gửi
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
