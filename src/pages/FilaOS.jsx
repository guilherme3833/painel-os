import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
import { buscarFilaOS, salvarFilaOS } from '../firebase'

const API = 'https://automacao.octek.com.br/webhook/os/fila'

function dataLocal(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function diasEspera(iso) {
  if (!iso) return 0
  const [y, m, d] = iso.split('T')[0].split('-')
  const abertura = new Date(Number(y), Number(m) - 1, Number(d))
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.floor((hoje - abertura) / 86400000)
}

function BadgeDias({ dias }) {
  const cor = dias >= 30 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    : dias >= 15 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cor}`}>
      {dias}d
    </span>
  )
}

// ── Item arrastável ────────────────────────────────────────────────────────────
function ItemOS({ os, posicao, podeReordenar, ativo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: os.codigo })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-3 bg-white/[0.03] border rounded-xl px-4 py-3 transition-colors ${
        isDragging ? 'border-indigo-500/40' : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}>

      {/* Posição */}
      <span className="text-xs text-slate-600 w-5 text-right shrink-0">{posicao}</span>

      {/* Handle drag */}
      {podeReordenar && (
        <button {...attributes} {...listeners}
          className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
        </button>
      )}

      {/* Número OS */}
      <span className="text-sm font-bold text-indigo-400 shrink-0 w-14">#{os.numero}</span>

      {/* Descrição */}
      <span className="text-sm text-slate-300 flex-1 min-w-0 truncate">{os.descricao || '—'}</span>

      {/* Data + espera */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-500">{dataLocal(os.data_abertura)}</span>
        <BadgeDias dias={diasEspera(os.data_abertura)} />
      </div>
    </div>
  )
}

// ── Card overlay durante drag ──────────────────────────────────────────────────
function CardOverlay({ os, posicao }) {
  return (
    <div className="flex items-center gap-3 bg-[#1e2a40] border border-indigo-500/40 rounded-xl px-4 py-3 shadow-2xl">
      <span className="text-xs text-slate-600 w-5 text-right shrink-0">{posicao}</span>
      <div className="text-slate-600 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
        </svg>
      </div>
      <span className="text-sm font-bold text-indigo-400 shrink-0 w-14">#{os.numero}</span>
      <span className="text-sm text-slate-300 flex-1 min-w-0 truncate">{os.descricao || '—'}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-slate-500">{dataLocal(os.data_abertura)}</span>
        <BadgeDias dias={diasEspera(os.data_abertura)} />
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function FilaOS() {
  const { temPermissao } = useAuth()
  const podeReordenar = temPermissao('fila_os', 'reordenar')

  const [lista, setLista] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const [resOS, ordemSalva] = await Promise.all([
        fetch(API).then(r => r.json()),
        buscarFilaOS(),
      ])

      const osList = Array.isArray(resOS) ? resOS : []

      // Aplica ordem salva; OS novas (sem posição) vão ao final por data
      if (ordemSalva.length > 0) {
        const mapaOrdem = new Map(ordemSalva.map((id, i) => [id, i]))
        osList.sort((a, b) => {
          const ia = mapaOrdem.has(a.codigo) ? mapaOrdem.get(a.codigo) : Infinity
          const ib = mapaOrdem.has(b.codigo) ? mapaOrdem.get(b.codigo) : Infinity
          if (ia !== ib) return ia - ib
          return new Date(a.data_abertura) - new Date(b.data_abertura)
        })
      }

      setLista(osList)
    } catch (e) {
      setErro('Erro ao carregar: ' + e.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = lista.findIndex(o => o.codigo === active.id)
    const newIndex = lista.findIndex(o => o.codigo === over.id)
    const novaLista = arrayMove(lista, oldIndex, newIndex)

    setLista(novaLista)
    setSalvando(true)
    try {
      await salvarFilaOS(novaLista.map(o => o.codigo))
    } catch (e) {
      setErro('Erro ao salvar ordem: ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  const activeOS = activeId ? lista.find(o => o.codigo === activeId) : null
  const activePos = activeOS ? lista.indexOf(activeOS) + 1 : 0

  return (
    <div className="px-6 py-6 max-w-3xl mx-auto fade-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white">Fila de OS</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {carregando ? 'Carregando...' : `${lista.length} ordens abertas`}
            {salvando && <span className="ml-2 text-indigo-400 animate-pulse">Salvando...</span>}
          </p>
        </div>
        <button onClick={carregar} disabled={carregando}
          className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all disabled:opacity-50">
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{erro}</div>
      )}

      {/* Legenda */}
      {podeReordenar && !carregando && lista.length > 0 && (
        <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
          </svg>
          Arraste para reordenar
        </p>
      )}

      {/* Lista */}
      {carregando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-600 text-sm">Nenhuma OS aberta</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={lista.map(o => o.codigo)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {lista.map((os, i) => (
                <ItemOS key={os.codigo} os={os} posicao={i + 1} podeReordenar={podeReordenar} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeOS && <CardOverlay os={activeOS} posicao={activePos} />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
