import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore'
import { CalendarHeart, Plus, Users, X } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [weddings, setWeddings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'weddings'),
      where('memberIds', 'array-contains', currentUser.uid),
    )
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setWeddings(list)
      setLoading(false)
    })
    return unsub
  }, [currentUser.uid])

  return (
    <div className="min-h-screen bg-purple-50/40 dark:bg-violet-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-gray-800 dark:text-white">
              Danh sách đám cưới
            </h1>
            <p className="text-sm text-gray-500 dark:text-purple-300">
              Chọn một đám cưới để quản lý quà, hoặc thêm đám cưới mới
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg gradient-bg px-4 py-2.5 font-medium text-white shadow-md transition hover:opacity-90"
          >
            <Plus size={18} /> Thêm đám cưới
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-purple-300">Đang tải...</p>
        ) : weddings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-300 p-10 text-center dark:border-purple-800">
            <CalendarHeart className="mx-auto mb-3 text-purple-400" size={40} />
            <p className="text-gray-600 dark:text-purple-200">
              Bạn chưa có đám cưới nào. Nhấn "Thêm đám cưới" để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {weddings.map((w) => (
              <Link
                key={w.id}
                to={`/wedding/${w.id}`}
                className="group animate-fadeIn rounded-2xl border border-purple-200/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-purple-900/60 dark:bg-violet-900/40"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl gradient-bg text-white shadow">
                  <CalendarHeart size={20} />
                </div>
                <h3 className="font-display text-lg font-bold text-gray-800 group-hover:text-purple-600 dark:text-white">
                  {w.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-purple-300">
                  {w.groomName} &amp; {w.brideName}
                </p>
                {w.date && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-purple-400">
                    Ngày cưới: {w.date}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-purple-500 dark:text-purple-300">
                  <Users size={14} /> {w.memberIds?.length || 1} thành viên
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && <NewWeddingModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function NewWeddingModal({ onClose }) {
  const { currentUser } = useAuth()
  const [name, setName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addDoc(collection(db, 'weddings'), {
        name,
        groomName,
        brideName,
        date,
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        roles: { [currentUser.uid]: 'owner' },
        memberInfo: { [currentUser.uid]: { email: currentUser.email, name: currentUser.displayName || currentUser.email } },
        createdAt: serverTimestamp(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fadeIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-violet-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Thêm đám cưới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">
              Tên đám cưới (VD: Đám cưới Minh & Lan)
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Tên chú rể</label>
              <input
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Tên cô dâu</label>
              <input
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Ngày cưới</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg gradient-bg px-4 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Tạo đám cưới'}
          </button>
        </form>
      </div>
    </div>
  )
}
