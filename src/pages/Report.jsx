import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, FileText, X } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { db } from '../firebase'
import { sideLabel } from '../constants'
import { summarizeGifts } from '../utils'
import Navbar from '../components/Navbar'

const COLORS = ['#7c3aed', '#c026d3', '#4f46e5', '#db2777', '#8b5cf6', '#a21caf', '#0ea5e9']

function relLabel(g) {
  return g.relationship === 'Khác' ? g.relationshipCustom || 'Khác' : g.relationship
}
function giftLabel(g) {
  return g.giftType === 'Khác' ? g.giftTypeCustom || 'Khác' : g.giftType
}
function unitLabel(g) {
  return g.unit === 'Khác' ? g.unitCustom : g.unit
}
function statusLabel(g) {
  return g.status === 'Khác' ? g.statusCustom : g.status
}

export default function Report() {
  const { id } = useParams()
  const [wedding, setWedding] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // { side, relationship }

  useEffect(() => {
    const unsubW = onSnapshot(doc(db, 'weddings', id), (snap) => {
      setWedding({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    const unsubG = onSnapshot(collection(db, 'weddings', id, 'guests'), (snap) => {
      setGuests(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsubW()
      unsubG()
    }
  }, [id])

  const groomGuests = useMemo(() => guests.filter((g) => g.side === 'groom'), [guests])
  const brideGuests = useMemo(() => guests.filter((g) => g.side === 'bride'), [guests])

  const groomRelData = useMemo(() => buildRelData(groomGuests), [groomGuests])
  const brideRelData = useMemo(() => buildRelData(brideGuests), [brideGuests])

  const groomSummary = useMemo(() => summarizeGifts(groomGuests), [groomGuests])
  const brideSummary = useMemo(() => summarizeGifts(brideGuests), [brideGuests])
  const totalSummary = useMemo(() => summarizeGifts(guests), [guests])

  const selectedGuests = useMemo(() => {
    if (!selected) return []
    const pool = selected.side === 'groom' ? groomGuests : brideGuests
    return pool.filter((g) => relLabel(g) === selected.relationship)
  }, [selected, groomGuests, brideGuests])

  if (loading || !wedding) {
    return (
      <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950">
        <Navbar />
        <p className="p-8 text-gray-500 dark:text-purple-300">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to={`/wedding/${id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-300"
        >
          <ArrowLeft size={15} /> Quay lại
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-gray-800 dark:text-white">Báo cáo tổng hợp</h1>
            <p className="text-sm text-gray-500 dark:text-purple-300">{wedding.name}</p>
          </div>
          <Link
            to={`/wedding/${id}/print`}
            className="flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-violet-900"
          >
            <FileText size={16} /> Xuất PDF
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Tổng số khách" value={guests.length} />
          <StatCard label="Nhà Trai" value={groomGuests.length} />
          <StatCard label="Nhà Gái" value={brideGuests.length} />
        </div>

        <p className="mb-2 text-sm text-gray-500 dark:text-purple-300">
          💡 Bấm vào một phần biểu đồ bên dưới để xem danh sách khách theo mối quan hệ đó.
        </p>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Nhà Trai — Phân loại theo mối quan hệ">
            {groomRelData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={groomRelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                    cursor="pointer"
                    onClick={(entry) => setSelected({ side: 'groom', relationship: entry.name })}
                  >
                    {groomRelData.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Nhà Gái — Phân loại theo mối quan hệ">
            {brideRelData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={brideRelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                    cursor="pointer"
                    onClick={(entry) => setSelected({ side: 'bride', relationship: entry.name })}
                  >
                    {brideRelData.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {selected && (
          <div className="mb-6 rounded-xl border-2 border-purple-400 bg-white p-4 shadow-sm dark:border-purple-700 dark:bg-violet-900/40">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-gray-800 dark:text-white">
                {sideLabel(selected.side)} — Mối quan hệ: {selected.relationship} ({selectedGuests.length} khách)
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  to={`/wedding/${id}/print-list?side=${selected.side}&relationship=${encodeURIComponent(selected.relationship)}`}
                  className="flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-90"
                >
                  <FileText size={14} /> Xuất PDF danh sách này
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 dark:hover:bg-violet-800"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-purple-100/70 text-left text-gray-600 dark:bg-violet-900/60 dark:text-purple-200">
                    <th className="px-2 py-2 font-semibold">Tên khách</th>
                    <th className="px-2 py-2 font-semibold">Loại quà</th>
                    <th className="px-2 py-2 font-semibold">Số lượng</th>
                    <th className="px-2 py-2 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGuests.map((g) => (
                    <tr key={g.id} className="border-t border-purple-100 dark:border-purple-900/50">
                      <td className="px-2 py-2 font-medium text-gray-800 dark:text-white">{g.name}</td>
                      <td className="px-2 py-2 text-gray-600 dark:text-purple-200">{giftLabel(g)}</td>
                      <td className="px-2 py-2 text-gray-600 dark:text-purple-200">
                        {g.quantity} {unitLabel(g)}
                      </td>
                      <td className="px-2 py-2 text-gray-600 dark:text-purple-200">{statusLabel(g)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard title="Nhà Trai" items={groomSummary} />
          <SummaryCard title="Nhà Gái" items={brideSummary} />
          <SummaryCard title="Tổng cộng cả hai bên" items={totalSummary} highlight />
        </div>
      </main>
    </div>
  )
}

function buildRelData(guests) {
  const map = {}
  guests.forEach((g) => {
    const rel = relLabel(g)
    map[rel] = (map[rel] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-purple-200/60 bg-white p-4 text-center shadow-sm dark:border-purple-900/60 dark:bg-violet-900/40">
      <p className="font-display text-2xl font-extrabold gradient-text">{value}</p>
      <p className="text-xs text-gray-500 dark:text-purple-300">{label}</p>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-purple-200/60 bg-white p-4 shadow-sm dark:border-purple-900/60 dark:bg-violet-900/40">
      <h3 className="mb-2 font-display text-sm font-bold text-gray-700 dark:text-purple-200">{title}</h3>
      {children}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-gray-400 dark:text-purple-400">
      Chưa có dữ liệu để hiển thị
    </div>
  )
}

function SummaryCard({ title, items, highlight }) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? 'border-purple-400 gradient-bg text-white'
          : 'border-purple-200/60 bg-white dark:border-purple-900/60 dark:bg-violet-900/40'
      }`}
    >
      <h3 className={`mb-2 font-display text-sm font-bold ${highlight ? 'text-white' : 'text-gray-700 dark:text-purple-200'}`}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p className={`text-sm ${highlight ? 'text-purple-100' : 'text-gray-400 dark:text-purple-400'}`}>Chưa có dữ liệu</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((s) => (
            <li key={s.key} className={highlight ? 'text-white' : 'text-gray-600 dark:text-purple-200'}>
              {s.key}: <b>{s.total}</b>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
