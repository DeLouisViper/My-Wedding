import { useMemo, useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { db } from '../firebase'
import { sideLabel } from '../constants'
import ConfirmDialog from './ConfirmDialog'

export default function GuestTable({ weddingId, guests, canEdit, onEdit }) {
  const [search, setSearch] = useState('')
  const [sideFilter, setSideFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      if (sideFilter !== 'all' && g.side !== sideFilter) return false
      if (search && !g.name?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [guests, search, sideFilter])

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteDoc(doc(db, 'weddings', weddingId, 'guests', deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách..."
            className="w-full rounded-lg border border-purple-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { v: 'all', l: 'Tất cả' },
            { v: 'groom', l: 'Nhà Trai' },
            { v: 'bride', l: 'Nhà Gái' },
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setSideFilter(f.v)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                sideFilter === f.v
                  ? 'gradient-bg text-white shadow'
                  : 'border border-purple-200 text-gray-600 dark:border-purple-800 dark:text-purple-200'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-purple-200/60 dark:border-purple-900/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-purple-100/70 text-left text-gray-600 dark:bg-violet-900/50 dark:text-purple-200">
              <th className="px-3 py-2.5 font-semibold">Tên khách</th>
              <th className="px-3 py-2.5 font-semibold">Thuộc về</th>
              <th className="px-3 py-2.5 font-semibold">Mối quan hệ</th>
              <th className="px-3 py-2.5 font-semibold">Loại quà</th>
              <th className="px-3 py-2.5 font-semibold">Số lượng</th>
              <th className="px-3 py-2.5 font-semibold">Trạng thái</th>
              {canEdit && <th className="px-3 py-2.5 font-semibold text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-3 py-8 text-center text-gray-400 dark:text-purple-400">
                  Chưa có khách nào phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id} className="border-t border-purple-100 hover:bg-purple-50/60 dark:border-purple-900/50 dark:hover:bg-violet-900/30">
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-white">{g.name}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        g.side === 'groom'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                          : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-200'
                      }`}
                    >
                      {sideLabel(g.side)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-purple-200">
                    {g.relationship === 'Khác' ? g.relationshipCustom : g.relationship}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-purple-200">
                    {g.giftType === 'Khác' ? g.giftTypeCustom : g.giftType}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-purple-200">
                    {g.quantity} {g.unit === 'Khác' ? g.unitCustom : g.unit}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-purple-200">
                    {g.status === 'Khác' ? g.statusCustom : g.status}
                  </td>
                  {canEdit && (
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(g)}
                          className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-violet-800"
                          title="Sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(g)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          title="Xóa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa thông tin khách?"
          message={`Bạn có chắc muốn xóa "${deleteTarget.name}" khỏi danh sách? Hành động này không thể hoàn tác.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
