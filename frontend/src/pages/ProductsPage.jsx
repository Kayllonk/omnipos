import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ProductModal from '../components/ProductModal'
import { useAuth } from '../auth/AuthContext'
import { Plus, Pencil, Trash2, Search, Package2 } from 'lucide-react'

const api = axios.create({ baseURL: '' })

export default function ProductsPage() {
  const { token, user, logout } = useAuth()
  const [active, setActive] = useState('Estoque')
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/products/full', { headers })
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [headers])

  const filtered = items.filter(p => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return [p.name, p.sku, p.barcode || '', p.category || ''].join(' ').toLowerCase().includes(q)
  })

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setModalOpen(true)
  }

  const saveProduct = async (form) => {
    if (editing?.id) {
      await api.put(`/api/products/${editing.id}`, form, { headers })
    } else {
      await api.post('/api/products', form, { headers })
    }
    setModalOpen(false)
    setEditing(null)
    await load()
  }

  const remove = async (id) => {
    const ok = confirm('Deseja excluir este produto?')
    if (!ok) return
    await api.delete(`/api/products/${id}`, { headers })
    await load()
  }

  return (
    <div className="min-h-screen p-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <Sidebar active={active} onChange={setActive} onLogout={logout} />

        <main className="space-y-4">
          <Topbar user={user} />

          <section className="glass rounded-3xl p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-2xl font-bold">Produtos</h3>
                <p className="text-sm text-slate-400">Gerencie o catálogo, preços e estoque</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full sm:w-72 bg-panel2 border border-white/10 rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={openCreate}
                  className="px-4 py-3 rounded-2xl bg-primary text-white font-semibold flex items-center gap-2 justify-center"
                >
                  <Plus className="w-4 h-4" /> Novo produto
                </button>
              </div>
            </div>

            <div className="mb-4 grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Total de produtos</div>
                <div className="mt-2 text-3xl font-black">{items.length}</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Resultados filtrados</div>
                <div className="mt-2 text-3xl font-black">{filtered.length}</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs text-slate-400">Modo</div>
                <div className="mt-2 text-lg font-bold text-cyan flex items-center gap-2">
                  <Package2 className="w-5 h-5" /> Estoque completo
                </div>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-left">
                <thead className="text-slate-400 text-sm">
                  <tr>
                    <th className="py-3">Nome</th>
                    <th>SKU</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        Carregando...
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.map(p => {
                    const low = Number(p.stock || 0) <= Number(p.min_stock || 0)
                    return (
                      <tr key={p.id} className="border-t border-white/5">
                        <td className="py-4 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-cyan">
                              <Package2 className="w-5 h-5" />
                            </div>
                            <div>
                              <div>{p.name}</div>
                              <div className="text-xs text-slate-400">{p.barcode || 'sem barcode'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{p.sku}</td>
                        <td>{p.category || '-'}</td>
                        <td>R$ {Number(p.sale_price || 0).toFixed(2)}</td>
                        <td>
                          <span className={low ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
                            {p.stock}
                          </span>
                          <span className="text-slate-400 text-xs"> / {p.min_stock}</span>
                        </td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${low ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                            {low ? 'Estoque baixo' : 'OK'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(p.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-200 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {!loading && filtered.length === 0 && (
                <div className="py-10 text-center text-slate-400">
                  Nenhum produto encontrado.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveProduct}
        initial={editing}
      />
    </div>
  )
}