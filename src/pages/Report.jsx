import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, FileText } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '../firebase'
import { useTheme } from '../contexts/ThemeContext'
import { summarizeGifts } from '../utils'
import Navbar from '../components/Navbar'

const COLORS = ['#7c3aed', '#c026d3', '#4f46e5', '#db2777', '#8b5cf6', '#a21caf', '#0ea5e9']

export default function Report() {
  const { id } = useParams()
  const { dark } = useTheme()
  const [wedding, setWedding] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

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

  const sideChartData = useMemo(
    () => [
      { name: 'Nhà Trai', value: groomGuests.length },
      { name: 'Nhà Gái', value: brideGuests.length },
    ],
    [groomGuests, brideGuests],
  )

  const relationshipChartData = useMemo(() => {
    const map = {}
    guests.forEach((g) => {
      const rel = g.relationship === 'Khác' ? g.relationshipCustom || 'Khác' : g.relationship
      map[rel] = (map[rel] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [guests])

  const giftTypeBySideData = useMemo(() => {
    const label = (g) => (g.giftType === 'Khác' ? g.giftTypeCustom || 'Khác' : g.giftType)
    const types = Array.from(new Set(guests.map(label)))
    return types.map((type) => ({
      type,
      'Nhà Trai': groomGuests.filter((g) => label(g) === type).length,
      'Nhà Gái': brideGuests.filter((g) => label(g) === type).length,
    }))
  }, [guests, groomGuests, brideGuests])

  const groomSummary = useMemo(() => summarizeGifts(groomGuests), [groomGuests])
  const brideSummary = useMemo(() => summarizeGifts(brideGuests), [brideGuests])
  const totalSummary = useMemo(() => summarizeGifts(guests), [guests])

  const axisColor = dark ? '#d8b4fe' : '#6b21a8'
  const gridColor = dark ? '#4c1d95' : '#e9d5ff'

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

        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Tỷ lệ khách Nhà Trai / Nhà Gái">
            {guests.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sideChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {sideChartData.map((entry, i) => (
                      <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Phân loại khách theo mối quan hệ">
            {guests.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={relationshipChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {relationshipChartData.map((entry, i) => (
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

        <ChartCard title="So sánh loại quà giữa hai bên">
          {guests.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={giftTypeBySideData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="type" tick={{ fill: axisColor, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Nhà Trai" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nhà Gái" fill="#c026d3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard title="Nhà Trai" items={groomSummary} />
          <SummaryCard title="Nhà Gái" items={brideSummary} />
          <SummaryCard title="Tổng cộng cả hai bên" items={totalSummary} highlight />
        </div>
      </main>
    </div>
  )
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
