import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../auth/AuthContext'

const api = axios.create({ baseURL: '' })

export default function ReportsPage() {
  const { token, user, logout } = useAuth()
  const [active, setActive] = useState('Relatórios')
  const [data, setData] = useState(null)

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  useEffect(() => {
    api.get('/api/reports/summary', { headers }).then(r => setData(r.data))
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <Sidebar active={active} onChange={setActive} onLogout={logout} />
        <main className="space-y-4">
          <Topbar user={user} />

          <section className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-3xl p-5">
              <div className="text-slate-400 text-sm">Produtos</div>
              <div className="text-4xl font-black mt-2">{data?.products_count || 0}</div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="text-slate-400 text-sm">Vendas</div>
              <div className="text-4xl font-black mt-2">{data?.sales_count || 0}</div>
            </div>
            <div className="glass rounded-3xl p-5">
              <div className="text-slate-400 text-sm">Receita</div>
              <div className="text-4xl font-black mt-2">R$ {Number(data?.revenue || 0).toFixed(2)}</div>
            </div>
          </section>

          <section className="glass rounded-3xl p-5">
            <h3 className="text-2xl font-bold mb-4">Itens com estoque baixo</h3>
            <div className="space-y-3">
              {(data?.low_stock_items || []).map(item => (
                <div key={item.id} className="rounded-2xl bg-white/5 p-4 flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-amber-300">{item.stock} / {item.min_stock}</span>
                </div>
              ))}
              {(!data?.low_stock_items || data.low_stock_items.length === 0) && (
                <div className="text-slate-400">Nenhum alerta encontrado.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}