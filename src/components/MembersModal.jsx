import { useState } from 'react'
import { arrayRemove, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { Trash2, UserPlus, X } from 'lucide-react'
import { db } from '../firebase'
import { ROLE_LABELS } from '../constants'

export default function MembersModal({ wedding, currentUserId, onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const memberIds = wedding.memberIds || []
  const roles = wedding.roles || {}
  const memberInfo = wedding.memberInfo || {}

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setError('Không tìm thấy người dùng với email này. Người đó cần đăng ký tài khoản trước.')
        return
      }
      const userDoc = snap.docs[0]
      const uid = userDoc.id
      const data = userDoc.data()

      await updateDoc(doc(db, 'weddings', wedding.id), {
        memberIds: arrayUnion(uid),
        [`roles.${uid}`]: role,
        [`memberInfo.${uid}`]: { email: data.email, name: data.name || data.email },
      })
      setEmail('')
    } catch (err) {
      setError('Đã có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(uid) {
    if (uid === wedding.ownerId) return
    await updateDoc(doc(db, 'weddings', wedding.id), {
      memberIds: arrayRemove(uid),
    })
  }

  async function handleRoleChange(uid, newRole) {
    await updateDoc(doc(db, 'weddings', wedding.id), {
      [`roles.${uid}`]: newRole,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fadeIn rounded-2xl bg-white p-6 shadow-2xl dark:bg-violet-950">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-gray-800 dark:text-white">Quản lý thành viên</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-5 flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email thành viên (đã có tài khoản)"
            className="min-w-[200px] flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
          >
            <option value="editor">Biên tập</option>
            <option value="viewer">Chỉ xem</option>
          </select>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            <UserPlus size={16} /> Thêm
          </button>
        </form>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          {memberIds.map((uid) => (
            <div
              key={uid}
              className="flex items-center justify-between rounded-lg border border-purple-100 px-3 py-2 dark:border-purple-900"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {memberInfo[uid]?.name || memberInfo[uid]?.email || uid}
                  {uid === currentUserId && ' (Bạn)'}
                </p>
                <p className="text-xs text-gray-400 dark:text-purple-400">{memberInfo[uid]?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {uid === wedding.ownerId ? (
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-violet-800 dark:text-purple-200">
                    {ROLE_LABELS.owner}
                  </span>
                ) : (
                  <>
                    <select
                      value={roles[uid] || 'viewer'}
                      onChange={(e) => handleRoleChange(uid, e.target.value)}
                      className="rounded-lg border border-purple-200 bg-white px-2 py-1 text-xs outline-none dark:border-purple-800 dark:bg-violet-900 dark:text-white"
                    >
                      <option value="editor">Biên tập</option>
                      <option value="viewer">Chỉ xem</option>
                    </select>
                    <button
                      onClick={() => handleRemove(uid)}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      title="Xóa khỏi đám cưới"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
