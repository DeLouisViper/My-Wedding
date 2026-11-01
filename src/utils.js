// Gộp nhóm quà theo Loại quà + Đơn vị và cộng dồn số lượng
export function summarizeGifts(guests) {
  const map = {}
  guests.forEach((g) => {
    const type = g.giftType === 'Khác' ? g.giftTypeCustom || 'Khác' : g.giftType
    const unit = g.unit === 'Khác' ? g.unitCustom : g.unit
    const key = `${type} (${unit || 'không rõ đơn vị'})`
    const qty = parseFloat(g.quantity)
    if (!map[key]) map[key] = 0
    if (!isNaN(qty)) map[key] += qty
  })
  return Object.entries(map).map(([key, total]) => ({ key, total }))
}

// Tỷ giá quy đổi các đơn vị tiền mặt có sẵn sang VNĐ
// (Trăm = trăm nghìn đồng, Triệu = một triệu đồng)
const CASH_UNIT_TO_VND = {
  'Triệu': 1_000_000,
  'Trăm': 100_000,
}

// Tính tổng tiền mặt quy đổi ra VNĐ từ kết quả của summarizeGifts.
// Chỉ cộng được các dòng "Tiền mặt (Triệu)" / "Tiền mặt (Trăm)" vì quy đổi được;
// đơn vị tự nhập ("Khác") không quy đổi được nên bỏ qua.
// Trả về null nếu không có dòng tiền mặt nào quy đổi được (để biết lúc nào không hiển thị).
export function cashTotalVND(summaryItems) {
  let total = 0
  let found = false
  summaryItems.forEach((item) => {
    const match = item.key.match(/^Tiền mặt \((.+)\)$/)
    if (!match) return
    const rate = CASH_UNIT_TO_VND[match[1]]
    if (rate) {
      total += item.total * rate
      found = true
    }
  })
  return found ? total : null
}

// "30,500,000" — có dấu phẩy ngăn cách hàng nghìn cho dễ nhìn
export function formatVND(amount) {
  return Math.round(amount).toLocaleString('en-US')
}

// "30.5 triệu" — gọn, tự bỏ số 0 thừa sau dấu thập phân
export function formatTrieu(amountVND) {
  const trieu = Math.round((amountVND / 1_000_000) * 100) / 100
  return `${trieu} triệu`
}
