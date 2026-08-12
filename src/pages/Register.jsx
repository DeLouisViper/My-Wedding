import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(mapError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg-soft px-4">
      <div className="w-full max-w-md animate-fadeIn rounded-2xl border border-purple-200/50 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-purple-900/50 dark:bg-violet-950/80">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl gradient-bg text-white shadow-lg">
            <Heart size={26} fill="white" />
          </span>
          <h1 className="font-display text-2xl font-extrabold gradient-text">Tạo tài khoản mới</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-purple-300">
            Bắt đầu quản lý quà cưới của bạn
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Họ và tên</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              placeholder="ban@vidu.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-purple-200">Nhập lại mật khẩu</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm outline-none ring-purple-400 focus:ring-2 dark:border-purple-800 dark:bg-violet-900 dark:text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-bg px-4 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            <UserPlus size={17} />
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-purple-300">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-purple-600 hover:underline dark:text-purple-300">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

function mapError(code) {
  const map = {
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu quá yếu.',
  }
  return map[code] || 'Đã có lỗi xảy ra, vui lòng thử lại.'
}
