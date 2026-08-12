import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { ArrowLeft, Printer } from 'lucide-react'
import { db } from '../firebase'
import Navbar from '../components/Navbar'

export default function PrintReport() {
  const { id } = useParams()
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

  const groomGuests = guests.filter((g) => g.side === 'groom')
  const brideGuests = guests.filter((g) => g.side === 'bride')

  if (loading || !wedding) {
    return (
     <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950 print:min-h-0 print:bg-white">
        <Navbar />
        <p className="p-8 text-gray-500 dark:text-purple-300">Đang tải...</p>
      </div>
    )
  }

  return (
 <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950 print:min-h-0 print:bg-white">
      <Navbar />
      <div className="no-print mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link to={`/wedding/${id}`} className="flex items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-300">
          <ArrowLeft size={15} /> Quay lại
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
          <h1 className="font-display text-2xl font-extrabold text-purple-700">BÁO CÁO QUÀ CƯỚI</h1>
          <p className="mt-1 text-lg font-semibold">{wedding.name}</p>
          <p className="text-sm text-gray-600">
            {wedding.groomName} &amp; {wedding.brideName}
            {wedding.date && ` · Ngày cưới: ${wedding.date}`}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Ngày xuất báo cáo: {exportedAt.toLocaleDateString('vi-VN')} · Thời gian: {exportedAt.toLocaleTimeString('vi-VN')}
          </p>
        </div>

        <SideSection title="NHÀ TRAI" guests={groomGuests} />
        <div className="my-8" />
        <SideSection title="NHÀ GÁI" guests={brideGuests} />

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

function SideSection({ title, guests }) {
  const summary = useMemo(() => summarize(guests), [guests])
  return (
    <div>
      <h2 className="mb-3 rounded bg-purple-100 px-3 py-1.5 font-display text-base font-bold text-purple-800">
        {title} — {guests.length} khách
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300 text-left">
            <th className="py-1.5 pr-2 w-8">STT</th>
            <th className="py-1.5 pr-2">Tên khách</th>
            <th className="py-1.5 pr-2">Mối quan hệ</th>
            <th className="py-1.5 pr-2">Loại quà</th>
            <th className="py-1.5 pr-2">Số lượng</th>
            <th className="py-1.5 pr-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-400">Chưa có dữ liệu</td>
            </tr>
          ) : (
            guests.map((g, i) => (
              <tr key={g.id} className="border-b border-gray-200">
                <td className="py-1.5 pr-2">{i + 1}</td>
                <td className="py-1.5 pr-2 font-medium">{g.name}</td>
                <td className="py-1.5 pr-2">{g.relationship === 'Khác' ? g.relationshipCustom : g.relationship}</td>
                <td className="py-1.5 pr-2">{g.giftType === 'Khác' ? g.giftTypeCustom : g.giftType}</td>
                <td className="py-1.5 pr-2">{g.quantity} {g.unit === 'Khác' ? g.unitCustom : g.unit}</td>
                <td className="py-1.5 pr-2">{g.status === 'Khác' ? g.statusCustom : g.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {summary.length > 0 && (
        <div className="mt-2 text-sm">
          <p className="font-semibold">Tổng kết:</p>
          <ul className="list-disc pl-5">
            {summary.map((s) => (
              <li key={s.key}>{s.key}: {s.total}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function summarize(guests) {
  const map = {}
  guests.forEach((g) => {
    const type = g.giftType === 'Khác' ? g.giftTypeCustom : g.giftType
    const unit = g.unit === 'Khác' ? g.unitCustom : g.unit
    const key = `${type} (${unit || 'không rõ đơn vị'})`
    const qty = parseFloat(g.quantity)
    if (!map[key]) map[key] = 0
    if (!isNaN(qty)) map[key] += qty
  })
  return Object.entries(map).map(([key, total]) => ({ key, total }))
}
