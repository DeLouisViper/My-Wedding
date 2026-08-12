import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="no-print sticky top-0 z-30 border-b border-purple-200/50 bg-white/70 backdrop-blur-md dark:border-purple-900/50 dark:bg-violet-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg text-white shadow-md">
            <Heart size={18} fill="white" />
          </span>
          <span className="gradient-text font-extrabold">Quản Lý Đám Cưới</span>
        </Link>

        <div className="flex items-center gap-3">
          {currentUser && (
            <span className="hidden text-sm text-gray-600 dark:text-purple-200 sm:inline">
              Xin chào, <b>{currentUser.displayName || currentUser.email}</b>
            </span>
          )}
          <button
            onClick={toggleTheme}
            title="Đổi giao diện sáng / tối"
            className="rounded-full border border-purple-200 p-2 text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:hover:bg-violet-900"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {currentUser && (
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-200 dark:bg-violet-900 dark:text-purple-200 dark:hover:bg-violet-800"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
