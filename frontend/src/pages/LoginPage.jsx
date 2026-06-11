import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LockKeyhole, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch {
      setError('Falha no login. Verifique usuário e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-cyan/10 to-transparent" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full shadow-glow">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-sm font-semibold">OmniPOS PRO</span>
          </div>
          <h1 className="mt-10 text-6xl font-black leading-tight">
            Gestão <span className="text-primary">inteligente</span> para varejo avançado.
          </h1>
          <p className="mt-6 text-slate-300 max-w-xl text-lg">
            Login moderno, dashboard executivo, operações rápidas e uma base pronta para crescer em módulos.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            ['Segurança', 'JWT + rotas protegidas'],
            ['Velocidade', 'Operação fluida e rápida'],
            ['Painéis', 'Visão completa do negócio'],
            ['Escala', 'Base pronta para expansão']
          ].map(([a, b]) => (
            <div key={a} className="glass rounded-2xl p-5">
              <div className="text-2xl font-black text-primary">{a}</div>
              <div className="text-sm text-slate-300 mt-1">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="glass w-full max-w-md rounded-3xl p-8 shadow-glow">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
              <LockKeyhole className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Entrar no sistema</h2>
              <p className="text-sm text-slate-300">Acesso ao painel OmniPOS PRO</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Usuário</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="mt-2 w-full bg-panel2 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Senha</label>
              <div className="mt-2 relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-panel2 border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:border-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>}

            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-cyan text-white font-bold shadow-glow disabled:opacity-70"
            >
              {loading ? 'Entrando...' : 'Acessar painel'}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-400">
            Acesso inicial: <span className="text-slate-200 font-semibold">admin / admin123</span>
          </div>
        </div>
      </div>
    </div>
  )
}