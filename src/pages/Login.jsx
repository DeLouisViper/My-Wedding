import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
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
          <h1 className="font-display text-2xl font-extrabold gradient-text">Quản Lý Đám Cưới</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-purple-300">
            Đăng nhập để tiếp tục quản lý quà cưới
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg gradient-bg px-4 py-2.5 font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            <LogIn size={17} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-purple-300">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-purple-600 hover:underline dark:text-purple-300">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}

function mapError(code) {
  const map = {
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/user-not-found': 'Tài khoản không tồn tại.',
    'auth/wrong-password': 'Sai mật khẩu.',
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần, vui lòng thử lại sau.',
  }
  return map[code] || 'Đã có lỗi xảy ra, vui lòng thử lại.'
}
