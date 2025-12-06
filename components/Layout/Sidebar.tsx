'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  FiHome,
  FiImage,
  FiSettings,
  FiLogOut,
  FiUser,
  FiPlus,
  FiList,
  FiCheckCircle,
} from 'react-icons/fi'

interface SidebarProps {
  role: 'client' | 'editor'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const clientMenu = [
    { name: 'Dashboard', icon: FiHome, path: '/client/dashboard' },
    { name: 'My Albums', icon: FiImage, path: '/client/albums' },
    { name: 'Profile', icon: FiUser, path: '/client/profile' },
  ]

  const editorMenu = [
    { name: 'Dashboard', icon: FiHome, path: '/editor/dashboard' },
    { name: 'Create Album', icon: FiPlus, path: '/editor/create' },
    { name: 'All Albums', icon: FiList, path: '/editor/albums' },
    { name: 'Pending Approval', icon: FiCheckCircle, path: '/editor/pending' },
    { name: 'Settings', icon: FiSettings, path: '/editor/settings' },
  ]

  const menu = role === 'client' ? clientMenu : editorMenu

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="w-64 bg-dark-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-dark-700">
        <h1 className="text-2xl font-bold">PicCur</h1>
        <p className="text-sm text-dark-400 mt-1">Album Design System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white'
              }`}
            >
              <Icon className="text-lg" />
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center space-x-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <FiUser className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

