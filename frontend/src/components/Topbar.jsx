import { Menu, Bell, Search, UserCircle2 } from 'lucide-react'

export default function Topbar({ user }) {
  return (
    <header className="glass rounded-3xl px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-slate-400">Bem-vindo de volta</div>
        <div className="text-xl font-bold">{user?.full_name || user?.username || 'Usuário'}</div>
      </div>

      <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full bg-panel2 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10">
          <Bell className="w-5 h-5 text-slate-200" />
        </button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/5">
          <UserCircle2 className="w-7 h-7 text-cyan" />
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight">{user?.username || 'admin'}</div>
            <div className="text-xs text-slate-400 leading-tight">{user?.role || 'admin'}</div>
          </div>
        </div>
      </div>
    </header>
  )
}