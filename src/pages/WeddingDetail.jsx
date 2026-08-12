import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, FileText, Plus, Users } from 'lucide-react'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import GuestTable from '../components/GuestTable'
import GuestFormModal from '../components/GuestFormModal'
import MembersModal from '../components/MembersModal'

export default function WeddingDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [wedding, setWedding] = useState(null)
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState(null)
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    const unsubW = onSnapshot(doc(db, 'weddings', id), (snap) => {
      if (!snap.exists()) {
        navigate('/')
        return
      }
      setWedding({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    const unsubG = onSnapshot(collection(db, 'weddings', id, 'guests'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'))
      setGuests(list)
    })
    return () => {
      unsubW()
      unsubG()
    }
  }, [id, navigate])

  const role = wedding?.roles?.[currentUser.uid]
  const canEdit = role === 'owner' || role === 'editor'
  const isOwner = role === 'owner'

  const stats = useMemo(() => {
    const groom = guests.filter((g) => g.side === 'groom').length
    const bride = guests.filter((g) => g.side === 'bride').length
    return { groom, bride, total: guests.length }
  }, [guests])

  function openEdit(guest) {
    setEditingGuest(guest)
    setShowGuestModal(true)
  }

  function openNew() {
    setEditingGuest(null)
    setShowGuestModal(true)
  }

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
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline dark:text-purple-300">
          <ArrowLeft size={15} /> Quay lại danh sách
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-gray-800 dark:text-white">{wedding.name}</h1>
            <p className="text-sm text-gray-500 dark:text-purple-300">
              {wedding.groomName} &amp; {wedding.brideName}
              {wedding.date && ` · Ngày cưới: ${wedding.date}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <button
                onClick={() => setShowMembers(true)}
                className="flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-violet-900"
              >
                <Users size={16} /> Thành viên
              </button>
            )}
            <Link
              to={`/wedding/${id}/print`}
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-violet-900"
            >
              <FileText size={16} /> Xuất báo cáo A4
            </Link>
            {canEdit && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-90"
              >
                <Plus size={16} /> Thêm quà cưới
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard label="Tổng số khách" value={stats.total} />
          <StatCard label="Nhà Trai" value={stats.groom} />
          <StatCard label="Nhà Gái" value={stats.bride} />
        </div>

        <GuestTable weddingId={id} guests={guests} canEdit={canEdit} onEdit={openEdit} />
      </main>

      {showGuestModal && (
        <GuestFormModal weddingId={id} guest={editingGuest} onClose={() => setShowGuestModal(false)} />
      )}
      {showMembers && (
        <MembersModal wedding={wedding} currentUserId={currentUser.uid} onClose={() => setShowMembers(false)} />
      )}
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
