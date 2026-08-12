import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { ArrowLeft, Printer } from 'lucide-react'
import { db } from '../firebase'
import { sideLabel } from '../constants'
import { summarizeGifts } from '../utils'
import Navbar from '../components/Navbar'

function relLabel(g) {
  return g.relationship === 'Khác' ? g.relationshipCustom || 'Khác' : g.relationship
}

export default function PrintGuestList() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const side = searchParams.get('side')
  const relationship = searchParams.get('relationship') || ''

  const [wedding, setWedding] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const exportedAt = useMemo(() => new Date(), [])

  useEffect(() => {
    async function load() {
      const wSnap = await getDoc(doc(db, 'weddings', id))
      setWedding({ id: wSnap.id, ...wSnap.data() })
      const gSnap = await getDocs(collection(db, 'weddings', id, 'guests'))
      const list = gSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
      setGuests(list)
      setLoading(false)
    }
    load()
  }, [id])

  const filtered = useMemo(
    () => guests.filter((g) => g.side === side && relLabel(g) === relationship),
    [guests, side, relationship],
  )
  const summary = useMemo(() => summarizeGifts(filtered), [filtered])

  if (loading || !wedding) {
    return (
      <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950">
        <Navbar />
        <p className="p-8 text-gray-500 dark:text-purple-300">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950 print:min-h-0 print:bg-white">
      <Navbar />
      <div className="no-print mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link
          to={`/wedding/${id}/report`}
          className="flex items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-300"
        >
          <ArrowLeft size={15} /> Quay lại báo cáo
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg gradient-bg px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-90"
        >
          <Printer size={16} /> In / Lưu PDF
        </button>
      </div>

      <div id="print-area" className="mx-auto max-w-4xl bg-white p-8 text-gray-900 shadow-sm print:shadow-none">
        <div className="mb-6 border-b-2 border-purple-600 pb-4 text-center">
          <h1 className="font-display text-2xl font-extrabold text-purple-700">DANH SÁCH KHÁCH MỜI</h1>
          <p className="mt-1 text-lg font-semibold">{wedding.name}</p>
          <p className="text-sm text-gray-600">
            {sideLabel(side)} · Mối quan hệ: {relationship}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Ngày xuất báo cáo: {exportedAt.toLocaleDateString('vi-VN')} · Thời gian: {exportedAt.toLocaleTimeString('vi-VN')}
          </p>
        </div>

        <h2 className="mb-3 rounded bg-purple-100 px-3 py-1.5 font-display text-base font-bold text-purple-800">
          {sideLabel(side)} — {relationship} ({filtered.length} khách)
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left">
              <th className="py-1.5 pr-2 w-8">STT</th>
              <th className="py-1.5 pr-2">Tên khách</th>
              <th className="py-1.5 pr-2">Loại quà</th>
              <th className="py-1.5 pr-2">Số lượng</th>
              <th className="py-1.5 pr-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">
                  Không có khách nào
                </td>
              </tr>
            ) : (
              filtered.map((g, i) => (
                <tr key={g.id} className="border-b border-gray-200">
                  <td className="py-1.5 pr-2">{i + 1}</td>
                  <td className="py-1.5 pr-2 font-medium">{g.name}</td>
                  <td className="py-1.5 pr-2">{g.giftType === 'Khác' ? g.giftTypeCustom : g.giftType}</td>
                  <td className="py-1.5 pr-2">
                    {g.quantity} {g.unit === 'Khác' ? g.unitCustom : g.unit}
                  </td>
                  <td className="py-1.5 pr-2">{g.status === 'Khác' ? g.statusCustom : g.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {summary.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="font-semibold">Tổng kết:</p>
            <ul className="list-disc pl-5">
              {summary.map((s) => (
                <li key={s.key}>
                  {s.key}: {s.total}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-10 pt-6 text-center text-sm">
          <div>
            <p className="mb-16">Người lập báo cáo</p>
            <p className="font-medium">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="mb-16">Xác nhận</p>
            <p className="font-medium">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
