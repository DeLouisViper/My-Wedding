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
