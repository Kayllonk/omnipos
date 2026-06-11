import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Search, Plus, Minus, Trash2, ShoppingCart, ScanLine, CreditCard, Banknote, QrCode } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../auth/AuthContext'

const api = axios.create({ baseURL: '' })

export default function POSPage() {
  const { token, user, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const [payment, setPayment] = useState('cash')
  const [active, setActive] = useState('Caixa')

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const load = async () => {
    const [p, c] = await Promise.all([
      api.get('/api/products/full', { headers }),
      api.get('/api/products/categories', { headers }).catch(() => ({ data: [] }))
    ])
    setProducts(p.data)
    setCategories(Array.isArray(c.data) ? c.data : [])
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const q = query.toLowerCase()
    const okCategory = category === 'all' || p.category === category
    const okQuery = [p.name, p.sku, p.barcode || '', p.category || ''].join(' ').toLowerCase().includes(q)
    return okCategory && okQuery
  })

  const add = (product) => {
    setCart(prev => {
      const found = prev.find(i => i.id === product.id)
      if (found) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.sale_price } : i)
      }
      return [...prev, { ...product, quantity: 1, subtotal: product.sale_price }]
    })
  }

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const quantity = Math.max(1, i.quantity + delta)
      return { ...i, quantity, subtotal: quantity * i.sale_price }
    }))
  }

  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  const finishSale = async () => {
    if (!cart.length) return alert('Carrinho vazio')
    await api.post('/api/sales', {
      payment_method: payment,
      operator: user?.username || '',
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.quantity,
        unit_price: i.sale_price,
        subtotal: i.subtotal,
        product_name: i.name
      }))
    }, { headers })
    setCart([])
    await load()
    alert('Venda finalizada')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        <Sidebar active={active} onChange={setActive} onLogout={logout} />

        <main className="space-y-4">
          <Topbar user={user} />

          <div className="grid xl:grid-cols-[1.4fr_0.9fr] gap-4">
            <section className="glass rounded-3xl p-5">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar por nome, SKU, barcode..."
                    className="w-full bg-panel2 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-panel2 border border-white/10 rounded-2xl px-4 py-3"
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <button
                    key={product.id}
                    onClick={() => add(product)}
                    className="text-left rounded-3xl p-4 bg-white/5 hover:bg-white/10 border border-white/5 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-lg leading-tight">{product.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{product.sku}</div>
                      </div>
                      <ScanLine className="w-5 h-5 text-cyan" />
                    </div>

                    <div className="mt-4 text-3xl font-black text-primary">
                      R$ {Number(product.sale_price || 0).toFixed(2)}
                    </div>

                    <div className="mt-2 text-sm text-slate-300">
                      Estoque: <span className={product.stock <= product.min_stock ? 'text-amber-300' : 'text-emerald-300'}>{product.stock}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {product.category && <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs">{product.category}</span>}
                      {product.barcode && <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs">{product.barcode}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <aside className="glass rounded-3xl p-5 sticky top-4 h-fit">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-6 h-6 text-cyan" />
                <h3 className="text-xl font-bold">Carrinho</h3>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                {cart.length === 0 && <div className="text-slate-400 py-10 text-center">Nenhum item adicionado</div>}
                {cart.map(item => (
                  <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.sku}</div>
                      </div>
                      <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}>
                        <Trash2 className="w-4 h-4 text-red-300" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => changeQty(item.id, -1)} className="p-2 rounded-xl bg-white/5"><Minus className="w-4 h-4" /></button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => changeQty(item.id, 1)} className="p-2 rounded-xl bg-white/5"><Plus className="w-4 h-4" /></button>
                      <div className="ml-auto font-black text-primary">R$ {item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total</div>
                    <div className="text-4xl font-black text-white">R$ {total.toFixed(2)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={() => setPayment('cash')} className={`rounded-2xl py-3 flex items-center justify-center gap-2 ${payment === 'cash' ? 'bg-green text-white' : 'bg-white/5'}`}>
                    <Banknote className="w-4 h-4" /> Dinheiro
                  </button>
                  <button onClick={() => setPayment('pix')} className={`rounded-2xl py-3 flex items-center justify-center gap-2 ${payment === 'pix' ? 'bg-green text-white' : 'bg-white/5'}`}>
                    <QrCode className="w-4 h-4" /> PIX
                  </button>
                  <button onClick={() => setPayment('credit')} className={`rounded-2xl py-3 flex items-center justify-center gap-2 ${payment === 'credit' ? 'bg-green text-white' : 'bg-white/5'}`}>
                    <CreditCard className="w-4 h-4" /> Crédito
                  </button>
                  <button onClick={() => setPayment('debit')} className={`rounded-2xl py-3 flex items-center justify-center gap-2 ${payment === 'debit' ? 'bg-green text-white' : 'bg-white/5'}`}>
                    <CreditCard className="w-4 h-4" /> Débito
                  </button>
                </div>

                <button
                  onClick={finishSale}
                  className="mt-4 w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-cyan text-white font-bold shadow-glow"
                >
                  Finalizar venda
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}