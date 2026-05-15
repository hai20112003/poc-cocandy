import { useProcurementStore } from '@/store/procurementStore'

export function usePRWorkflow() {
  const { getPurchaseRequest, updatePurchaseRequest } = useProcurementStore()

  const submitPR = (prId: string) => {
    const pr = getPurchaseRequest(prId)
    if (!pr) return

    const updatedPR = {
      ...pr,
      status: 'Submitted' as const,
    }
    updatePurchaseRequest(prId, updatedPR)
  }

  const approvePR = (prId: string, approvedBy: string) => {
    const pr = getPurchaseRequest(prId)
    if (!pr) return

    const updatedPR = {
      ...pr,
      status: 'Approved' as const,
      approvedBy,
      approvedAt: new Date().toISOString(),
    }
    updatePurchaseRequest(prId, updatedPR)
  }

  const rejectPR = (prId: string, reason: string) => {
    const pr = getPurchaseRequest(prId)
    if (!pr) return

    const updatedPR = {
      ...pr,
      status: 'Rejected' as const,
      rejectionReason: reason,
    }
    updatePurchaseRequest(prId, updatedPR)
  }

  const convertToPO = (prId: string, poId: string) => {
    const pr = getPurchaseRequest(prId)
    if (!pr) return

    const updatedPR = {
      ...pr,
      status: 'Converted' as const,
      convertedToPOId: poId,
    }
    updatePurchaseRequest(prId, updatedPR)
  }

  return { submitPR, approvePR, rejectPR, convertToPO }
}

export function usePOWorkflow() {
  const { getPurchaseOrder, updatePurchaseOrder } = useProcurementStore()

  const sendPO = (poId: string) => {
    const po = getPurchaseOrder(poId)
    if (!po) return

    const updatedPO = {
      ...po,
      status: 'Sent' as const,
      sentAt: new Date().toISOString(),
    }
    updatePurchaseOrder(poId, updatedPO)
  }

  const confirmPO = (poId: string, confirmedBy: string) => {
    const po = getPurchaseOrder(poId)
    if (!po) return

    const updatedPO = {
      ...po,
      status: 'Confirmed' as const,
      confirmedAt: new Date().toISOString(),
      confirmedBy,
    }
    updatePurchaseOrder(poId, updatedPO)
  }

  const startReceiving = (poId: string) => {
    const po = getPurchaseOrder(poId)
    if (!po) return

    const updatedPO = {
      ...po,
      status: 'Receiving' as const,
    }
    updatePurchaseOrder(poId, updatedPO)
  }

  const completePO = (poId: string) => {
    const po = getPurchaseOrder(poId)
    if (!po) return

    const updatedPO = {
      ...po,
      status: 'Completed' as const,
      completedAt: new Date().toISOString(),
    }
    updatePurchaseOrder(poId, updatedPO)
  }

  const cancelPO = (poId: string, reason: string) => {
    const po = getPurchaseOrder(poId)
    if (!po) return

    const updatedPO = {
      ...po,
      status: 'Cancelled' as const,
      cancellationReason: reason,
    }
    updatePurchaseOrder(poId, updatedPO)
  }

  return { sendPO, confirmPO, startReceiving, completePO, cancelPO }
}

export function useGRNWorkflow() {
  const { getGoodsReceipt, updateGoodsReceipt } = useProcurementStore()

  const submitGRN = (grnId: string) => {
    const grn = getGoodsReceipt(grnId)
    if (!grn) return

    const updatedGRN = {
      ...grn,
      status: 'Submitted' as const,
    }
    updateGoodsReceipt(grnId, updatedGRN)
  }

  const completeReceiving = (grnId: string) => {
    const grn = getGoodsReceipt(grnId)
    if (!grn) return

    const updatedGRN = {
      ...grn,
      status: 'Received' as const,
    }
    updateGoodsReceipt(grnId, updatedGRN)
  }

  const startQC = (grnId: string, inspector: string) => {
    const grn = getGoodsReceipt(grnId)
    if (!grn) return

    const updatedGRN = {
      ...grn,
      status: 'QC In Progress' as const,
      qcStatus: 'Pending' as const,
      qcStartedAt: new Date().toISOString(),
      qcInspector: inspector,
    }
    updateGoodsReceipt(grnId, updatedGRN)
  }

  const completeQC = (grnId: string) => {
    const grn = getGoodsReceipt(grnId)
    if (!grn) return

    const updatedGRN = {
      ...grn,
      status: 'Completed' as const,
      qcStatus: 'Pass' as const,
      qcCompletedAt: new Date().toISOString(),
    }
    updateGoodsReceipt(grnId, updatedGRN)
  }

  const rejectQC = (grnId: string, reason: string) => {
    const grn = getGoodsReceipt(grnId)
    if (!grn) return

    const updatedGRN = {
      ...grn,
      status: 'Rejected' as const,
      qcStatus: 'Fail' as const,
      rejectionReason: reason,
    }
    updateGoodsReceipt(grnId, updatedGRN)
  }

  return { submitGRN, completeReceiving, startQC, completeQC, rejectQC }
}
