export const SIDES = [
  { value: 'groom', label: 'Nhà Trai' },
  { value: 'bride', label: 'Nhà Gái' },
]

export const RELATIONSHIPS = ['Bạn ba mẹ', 'Họ hàng', 'Bạn bè', 'Đồng nghiệp', 'Khác']

export const GIFT_TYPES = ['Tiền mặt', 'Vàng', 'Hiện vật', 'Khác']

export const UNITS = ['Trăm', 'Triệu', 'Chỉ', 'Khác']

export const STATUSES = ['Đã cảm ơn', 'Đã mừng lại', 'Khác']

export const ROLE_LABELS = {
  owner: 'Chủ sở hữu',
  editor: 'Biên tập (thêm/sửa/xóa)',
  viewer: 'Chỉ xem',
}

export function sideLabel(side) {
  return SIDES.find((s) => s.value === side)?.label || side
}
