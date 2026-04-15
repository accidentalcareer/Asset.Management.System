import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Briefcase, TrendingUp, ArrowLeftRight,
  LineChart, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/assets',       icon: Briefcase,       label: 'Assets'       },
  { to: '/sips',         icon: TrendingUp,      label: 'SIPs'         },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/projections',  icon: LineChart,       label: 'Projections'  },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col h-full bg-navy text-white
      ${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-60'}
      transition-all duration-300
    `}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
          AMS
        </div>
        {(!collapsed || mobile) && (
          <span className="font-semibold text-sm">Asset Manager</span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(c => !c)} className="ml-auto text-white/60 hover:text-white">
            <ChevronRight size={16} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-colors hover:bg-white/10
               ${isActive ? 'bg-white/15 border-l-2 border-white' : 'text-white/75'}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/70
                     hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-shrink-0"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-gray-500" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-surface p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
