import { useState } from 'react'
import { X } from 'lucide-react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { GIFT_TYPES, RELATIONSHIPS, SIDES, STATUSES, UNITS } from '../constants'

const emptyForm = {
  name: '',
  side: 'groom',
  relationship: RELATIONSHIPS[0],
  relationshipCustom: '',
  giftType: GIFT_TYPES[0],
  giftTypeCustom: '',
  quantity: '',
  unit: UNITS[0],
  unitCustom: '',
  status: STATUSES[0],
  statusCustom: '',
  note: '',
}

export default function GuestFormModal({ weddingId, guest, onClose }) {
  const [form, setForm] = useState(guest ? { ...emptyForm, ...guest } : emptyForm)
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        side: form.side,
        relationship: form.relationship,
        relationshipCustom: form.relationship === 'Khác' ? form.relationshipCustom.trim() : '',
        giftType: form.giftType,
        giftTypeCustom: form.giftType === 'Khác' ? form.giftTypeCustom.trim() : '',
        quantity: form.quantity,
        unit: form.unit,
        unitCustom: form.unit === 'Khác' ? form.unitCustom.trim() : '',
        status: form.status,
        statusCustom: form.status === 'Khác' ? form.statusCustom.trim() : '',
        note: form.note?.trim() || '',
        updatedAt: serverTimestamp(),
      }
      if (guest) {
        await updateDoc(doc(db, 'weddings', weddingId, 'guests', guest.id), payload)
      } else {
        await addDoc(collection(db, 'weddings', weddingId, 'guests'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fadeIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-violet-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">
            {guest ? 'Sửa thông tin quà cưới' : 'Thêm thông tin quà cưới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Tên khách</Label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputCls}
              placeholder="Nguyễn Văn B"
            />
          </div>

          <div>
            <Label>Thuộc về</Label>
            <div className="flex gap-2">
              {SIDES.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => set('side', s.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.side === s.value
                      ? 'gradient-bg text-white shadow'
                      : 'border-purple-200 text-gray-600 dark:border-purple-800 dark:text-purple-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Mối quan hệ</Label>
            <select value={form.relationship} onChange={(e) => set('relationship', e.target.value)} className={inputCls}>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {form.relationship === 'Khác' && (
              <input
                value={form.relationshipCustom}
                onChange={(e) => set('relationshipCustom', e.target.value)}
                placeholder="Nhập mối quan hệ..."
                className={`${inputCls} mt-2`}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Loại quà</Label>
              <select value={form.giftType} onChange={(e) => set('giftType', e.target.value)} className={inputCls}>
                {GIFT_TYPES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {form.giftType === 'Khác' && (
                <input
                  value={form.giftTypeCustom}
                  onChange={(e) => set('giftTypeCustom', e.target.value)}
                  placeholder="Nhập loại quà..."
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>
            <div>
              <Label>Số lượng</Label>
              <input
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="VD: 5"
                className={inputCls}
              />
              <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={`${inputCls} mt-2`}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {form.unit === 'Khác' && (
                <input
                  value={form.unitCustom}
                  onChange={(e) => set('unitCustom', e.target.value)}
                  placeholder="Nhập đơn vị..."
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>
          </div>

          <div>
            <Label>Trạng thái</Label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {form.status === 'Khác' && (
              <input
                value={form.statusCustom}
                onChange={(e) => set('statusCustom', e.target.value)}
                placeholder="Nhập trạng thái..."
                className={`${inputCls} mt-2`}
              />
            )}
          </div>

          <div>
            <Label>Ghi chú (không bắt buộc)</Label>
            <textarea
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              rows={2}
              className={inputCls}
              placeholder="Ghi chú thêm..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg gradient-bg px-4 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : guest ? 'Cập nhật' : 'Thêm khách'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white'

function Label({ children }) {
  return <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">{children}</label>
}
