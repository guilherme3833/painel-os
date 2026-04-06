import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../contexts/AuthContext'
import { ouvirFilaOS, salvarFilaOS, ouvirAtribuicoes, atribuirOS, removerAtribuicaoOS, listarUsuarios, listarPerfis } from '../firebase'

const API = 'https://automacao.octek.com.br/webhook/os/fila'

function dataLocal(iso) {
  if (!iso) return '—'
  const s = String(iso).split('T')[0]
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}

function diasEspera(iso) {
  if (!iso) return 0
  const s = String(iso).split('T')[0]
  const [y, m, d] = s.split('-')
  const abertura = new Date(Number(y), Number(m) - 1, Number(d))
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  return Math.floor((hoje - abertura) / 86400000)
}

function BadgeDias({ dias }) {
  const cor = dias >= 30
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : dias >= 15
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-slate-700/40 text-slate-500 border-slate-600/30'
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cor}`}>
      {dias}d
    </span>
  )
}

function barraEspera(dias) {
  if (dias >= 30) return 'bg-rose-500'
  if (dias >= 15) return 'bg-amber-500'
  return 'bg-indigo-500'
}

// ── Item arrastável ────────────────────────────────────────────────────────────
// ── Combobox com busca ─────────────────────────────────────────────────────────
function ComboServico({ opcoes, valor, onChange }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  const filtradas = opcoes.filter(o => o.toLowerCase().includes(busca.toLowerCase()))

  useEffect(() => {
    function fechar(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  function selecionar(v) { onChange(v); setBusca(''); setAberto(false) }
  function limpar() { onChange(''); setBusca(''); setAberto(false) }

  return (
    <div ref={ref} className="relative">
      <div className={`flex items-center gap-1 bg-white/[0.04] border rounded-xl px-2.5 py-1.5 transition-colors ${aberto ? 'border-indigo-500/40' : 'border-white/[0.08]'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-600 shrink-0">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={aberto ? busca : (valor || '')}
          onChange={e => { setBusca(e.target.value); setAberto(true) }}
          onFocus={() => { setAberto(true); setBusca('') }}
          placeholder="Filtrar serviço..."
          className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-40"
        />
        {valor && !aberto && (
          <button onClick={limpar} className="text-slate-600 hover:text-slate-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {aberto && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[#1a2236] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            <button onClick={limpar}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${!valor ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-white/[0.04]'}`}>
              Todos os serviços
            </button>
            {filtradas.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-600">Nenhum resultado</p>
            ) : filtradas.map(s => (
              <button key={s} onClick={() => selecionar(s)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${valor === s ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Modal de atribuição ────────────────────────────────────────────────────────
function ModalAtribuir({ os, atribuicaoAtual, onAtribuir, onRemover, onFechar }) {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([listarUsuarios(), listarPerfis()]).then(([users, perfis]) => {
      const perfisMap = new Map(perfis.map(p => [p.id, p]))
      const filtrados = users.filter(u => {
        const perfil = perfisMap.get(u.roleId)
        if (!perfil?.permissoes?.fila_os?.aceitar_atribuicao) return false
        const servicos = perfil.servicos_fila || []
        if (servicos.length === 0) return true
        return servicos.includes(os.servico)
      })
      setUsuarios(filtrados)
      setCarregando(false)
    }).catch(() => setCarregando(false))
  }, [os.servico])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onFechar()}>
      <div className="bg-[#141c2e] border border-white/[0.08] rounded-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <p className="text-sm font-semibold text-white">Atribuir OS {os.numero}</p>
            <p className="text-xs text-slate-500 mt-0.5">Selecione quem vai atender</p>
          </div>
          <button onClick={onFechar} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 max-h-72 overflow-y-auto">
          {carregando ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">Nenhum usuário com permissão de receber atribuições.</p>
          ) : (
            <div className="space-y-1">
              {atribuicaoAtual && (
                <button onClick={onRemover}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-rose-500/10 transition-all group">
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-rose-400">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                  <span className="text-xs text-rose-400">Remover atribuição</span>
                </button>
              )}
              {usuarios.map(u => {
                const selecionado = atribuicaoAtual?.uid === u.uid
                return (
                  <button key={u.uid} onClick={() => onAtribuir(u.uid, u.nome || u.email)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selecionado ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-white/[0.04] border border-transparent'
                    }`}>
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-indigo-400">
                      {(u.nome || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">{u.nome || u.email}</p>
                      {u.nome && <p className="text-[10px] text-slate-600 truncate">{u.email}</p>}
                    </div>
                    {selecionado && <span className="ml-auto text-indigo-400 text-xs shrink-0">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ItemOS({ os, posicao, podeReordenar, podeAtribuir, atribuicao, onAtribuir, onTopo, onSubir, onDescer, onFim }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: os.codigo })
  const [expandido, setExpandido] = useState(false)

  const dias = diasEspera(os.data_abertura)
  const barra = barraEspera(dias)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-start gap-3 rounded-xl border overflow-hidden transition-all ${
        isDragging
          ? 'border-indigo-500/50 bg-indigo-500/5'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]'
      }`}>

      {/* Barra colorida lateral */}
      <div className={`w-1 self-stretch shrink-0 ${barra}`} />

      {/* Posição */}
      <div className="shrink-0 w-7 h-7 mt-2.5 rounded-lg bg-white/[0.06] flex items-center justify-center">
        <span className="text-xs font-bold text-slate-400">{posicao}</span>
      </div>

      {/* Handle drag */}
      {podeReordenar ? (
        <button {...attributes} {...listeners}
          className="text-slate-700 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none p-1 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
        </button>
      ) : (
        <div className="w-6 shrink-0" />
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 py-2.5">
        {/* Linha superior: número + data + espera */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
            OS {os.numero}
          </span>
          <span className="text-xs text-slate-600">{dataLocal(os.data_abertura)}</span>
          <BadgeDias dias={dias} />
        </div>

        {/* Serviço */}
        {os.servico && (
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Serviço</span>
            <span className="text-xs font-medium text-amber-400 truncate">{os.servico}</span>
          </div>
        )}

        {/* Endereço */}
        {os.endereco_final && (
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Endereço</span>
            <span className="text-xs text-slate-300 truncate">{os.endereco_final}</span>
          </div>
        )}

        {/* Descrição clicável */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Descrição</span>
          <button onClick={() => setExpandido(e => !e)} className="text-left min-w-0 flex-1 group">
            <p className={`text-xs text-slate-400 group-hover:text-slate-200 transition-colors ${expandido ? '' : 'truncate'}`}>
              {os.descricao || '—'}
            </p>
            {!expandido && os.descricao?.length > 60 && (
              <span className="text-[10px] text-slate-600 group-hover:text-indigo-400 transition-colors">ver mais</span>
            )}
          </button>
        </div>

        {/* Atribuído a */}
        {atribuicao && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider shrink-0">Atribuído</span>
            <span className="text-xs text-emerald-400 font-medium">{atribuicao.nome}</span>
          </div>
        )}
      </div>

      {/* Botões de posição */}
      {podeReordenar && (
        <div className="flex flex-col gap-0.5 pr-3 py-2 justify-center shrink-0">
          {/* Ir para o topo */}
          <button onClick={onTopo} title="Primeiro da fila"
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M11 5.83L7.41 9.41 6 8l6-6 6 6-1.41 1.41L13 5.83V21h-2z"/>
            </svg>
          </button>
          {/* Subir uma posição */}
          <button onClick={onSubir} title="Subir uma posição"
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          {/* Descer uma posição */}
          <button onClick={onDescer} title="Descer uma posição"
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {/* Ir para o fim */}
          <button onClick={onFim} title="Último da fila"
            className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:text-slate-400 hover:bg-white/[0.06] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M13 18.17L16.59 14.59 18 16l-6 6-6-6 1.41-1.41L11 18.17V3h2z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Botão atribuir */}
      {podeAtribuir && (
        <button onClick={onAtribuir} title="Atribuir OS"
          className={`shrink-0 self-center mr-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
            atribuicao ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-600 hover:text-slate-300 hover:bg-white/[0.06]'
          }`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function FilaOS() {
  const { temPermissao, servicosPermitidos } = useAuth()
  const podeReordenar = temPermissao('fila_os', 'reordenar')
  const podeAtribuir  = temPermissao('fila_os', 'atribuir')

  const [lista, setLista]                 = useState([])
  const [atribuicoes, setAtribuicoes]     = useState({})
  const [filtroServico, setFiltroServico] = useState('')
  const [carregando, setCarregando]       = useState(true)
  const [atualizando, setAtualizando]     = useState(false)
  const [salvando, setSalvando]           = useState(false)
  const [erro, setErro]                   = useState('')
  const [osAtribuindo, setOsAtribuindo]   = useState(null)
  const osListRef  = useRef([])
  const ordemRef   = useRef([])
  const timerRef   = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function aplicarOrdem(osList, ordem) {
    if (!ordem.length) return osList
    const mapa = new Map(ordem.map((id, i) => [Number(id), i]))
    return [...osList].sort((a, b) => {
      const ia = mapa.has(Number(a.codigo)) ? mapa.get(Number(a.codigo)) : Infinity
      const ib = mapa.has(Number(b.codigo)) ? mapa.get(Number(b.codigo)) : Infinity
      if (ia !== ib) return ia - ib
      return new Date(a.data_abertura) - new Date(b.data_abertura)
    })
  }

  // Busca OS do MySQL
  const buscarOS = useCallback(async (silencioso = false) => {
    if (silencioso) setAtualizando(true)
    else setCarregando(true)
    try {
      const res = await fetch(API).then(r => r.json())
      const osList = Array.isArray(res) ? res : []
      osListRef.current = osList
      setLista(aplicarOrdem(osList, ordemRef.current))
    } catch (e) {
      setErro('Erro ao carregar OS: ' + e.message)
    } finally {
      setCarregando(false)
      setAtualizando(false)
    }
  }, [])

  // Listener realtime — ordem
  useEffect(() => {
    const unsubscribe = ouvirFilaOS(ordem => {
      ordemRef.current = ordem
      setLista(aplicarOrdem(osListRef.current, ordem))
    })
    return () => unsubscribe()
  }, [])

  // Listener realtime — atribuições
  useEffect(() => {
    const unsubscribe = ouvirAtribuicoes(data => setAtribuicoes(data))
    return () => unsubscribe()
  }, [])

  useEffect(() => { buscarOS() }, [buscarOS])

  // Polling MySQL a cada 1 minuto
  useEffect(() => {
    timerRef.current = setInterval(() => buscarOS(true), 60000)
    return () => clearInterval(timerRef.current)
  }, [buscarOS])

  async function salvar(novaLista) {
    setLista(novaLista)
    setSalvando(true)
    try {
      await salvarFilaOS(novaLista.map(o => Number(o.codigo)))
    } catch (e) {
      setErro('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function moverPara(codigo, destino) {
    const idx = lista.findIndex(o => Number(o.codigo) === Number(codigo))
    if (idx === -1) return
    const novaLista = [...lista]
    const [item] = novaLista.splice(idx, 1)
    if (destino === 'topo') novaLista.unshift(item)
    else novaLista.push(item)
    await salvar(novaLista)
  }

  async function moverUma(codigo, direcao) {
    const idx = lista.findIndex(o => Number(o.codigo) === Number(codigo))
    if (idx === -1) return
    if (direcao === 'subir' && idx === 0) return
    if (direcao === 'descer' && idx === lista.length - 1) return
    const novaLista = arrayMove(lista, idx, direcao === 'subir' ? idx - 1 : idx + 1)
    await salvar(novaLista)
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lista.findIndex(o => Number(o.codigo) === Number(active.id))
    const newIndex = lista.findIndex(o => Number(o.codigo) === Number(over.id))
    const novaLista = arrayMove(lista, oldIndex, newIndex)

    setLista(novaLista)
    setSalvando(true)
    try {
      await salvarFilaOS(novaLista.map(o => Number(o.codigo)))
    } catch (e) {
      setErro('Erro ao salvar: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  const listaPermitida = servicosPermitidos.length
    ? lista.filter(o => servicosPermitidos.includes(o.servico))
    : lista
  const servicos = [...new Set(listaPermitida.map(o => o.servico).filter(Boolean))].sort()
  const listaFiltrada = filtroServico ? listaPermitida.filter(o => o.servico === filtroServico) : listaPermitida

  return (
    <>
      {osAtribuindo && (
        <ModalAtribuir
          os={osAtribuindo}
          atribuicaoAtual={atribuicoes[String(osAtribuindo.codigo)]}
          onAtribuir={async (uid, nome) => {
            await atribuirOS(osAtribuindo.codigo, uid, nome)
            setOsAtribuindo(null)
          }}
          onRemover={async () => {
            await removerAtribuicaoOS(osAtribuindo.codigo)
            setOsAtribuindo(null)
          }}
          onFechar={() => setOsAtribuindo(null)}
        />
      )}
      <div className="px-6 py-6 max-w-3xl mx-auto fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Fila de OS</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            {carregando ? 'Carregando...' : `${listaFiltrada.length}${filtroServico ? `/${lista.length}` : ''} ordens abertas`}
            {atualizando && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />}
            {salvando && <span className="text-indigo-400 text-xs animate-pulse">Salvando...</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>{'< 15d'}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>15–30d</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/>{'> 30d'}</span>
          </div>
          {servicos.length > 0 && (
            <ComboServico opcoes={servicos} valor={filtroServico} onChange={setFiltroServico} />
          )}
          <button onClick={() => buscarOS()} disabled={carregando}
            className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50">
            Atualizar
          </button>

        </div>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{erro}</div>
      )}

      {podeReordenar && !carregando && lista.length > 0 && (
        <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
          Arraste para reordenar · clique na descrição para expandir
        </p>
      )}

      {carregando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-600 text-sm">Nenhuma OS encontrada</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={listaFiltrada.map(o => o.codigo)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {listaFiltrada.map((os, i) => (
                <ItemOS key={os.codigo} os={os} posicao={i + 1} podeReordenar={podeReordenar}
                  podeAtribuir={podeAtribuir}
                  atribuicao={atribuicoes[String(os.codigo)]}
                  onAtribuir={() => setOsAtribuindo(os)}
                  onTopo={() => moverPara(os.codigo, 'topo')}
                  onSubir={() => moverUma(os.codigo, 'subir')}
                  onDescer={() => moverUma(os.codigo, 'descer')}
                  onFim={() => moverPara(os.codigo, 'fim')} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
    </>
  )
}
