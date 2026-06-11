import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../auth/AuthContext'

const api = axios.create({ baseURL: '' })

export default function InventoryPage() {
  const { token, user, logout } = useAuth()
  const [active, setActive] = useState('Estoque')
  const [items, setItems] = useState([])

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    api.get('/api/products/full', { headers }).then(r => setItems(r.data))
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <Sidebar active={active} onChange={setActive} onLogout={logout} />
        <main className="space-y-4">
          <Topbar user={user} />

          <section className="glass rounded-3xl p-5">
            <h3 className="text-2xl font-bold mb-4">Controle de estoque</h3>
            <div className="grid gap-3">
              {items.map(p => (
                <div key={p.id} className="rounded-2xl bg-white/5 p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.sku} • {p.category || '-'}</div>
                  </div>
                  <div className={p.stock <= p.min_stock ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
                    {p.stock} un.
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}