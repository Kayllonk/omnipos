import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Package2, BarChart3, Users, Settings, LogOut } from 'lucide-react'

const items = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Caixa', icon: ShoppingBag, path: '/caixa' },
  { label: 'Estoque', icon: Package2, path: '/estoque' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Usuários', icon: Users, path: '/usuarios' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' }
]

export default function Sidebar({ active = 'Dashboard', onLogout }) {
  const location = useLocation()

  return (
    <aside className="glass rounded-3xl p-4 h-[calc(100vh-2rem)] sticky top-4 flex flex-col">
      <div className="p-4 mb-4">
        <div className="text-sm text-slate-400">OmniPOS PRO</div>
        <div className="text-2xl font-black text-primary">Painel</div>
      </div>

      <nav className="space-y-2 flex-1">
        {items.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path || active === label
          return (
            <Link
              key={label}
              to={path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                isActive ? 'bg-primary text-white shadow-glow' : 'hover:bg-white/5 text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={onLogout}
        className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 text-red-200 hover:bg-red-500/20"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-semibold">Sair</span>
      </button>
    </aside>
  )
}