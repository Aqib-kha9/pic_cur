'use client'

import { FiBell, FiSearch, FiMenu } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiMenu className="text-xl" />
          </button>
        )}
        {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search albums..."
            className="bg-transparent outline-none text-sm w-64"
          />
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <FiBell className="text-xl text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

