import { useState, useEffect } from 'react'
import { ouvirLogs } from '../firebase'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ACOES = {
  login:                    { label: 'Login',                    cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  atribuiu_os:              { label: 'Atribuiu OS',              cor: 'text-indigo-400  bg-indigo-500/10  border-indigo-500/20'  },
  removeu_atribuicao:       { label: 'Removeu atribuição',       cor: 'text-rose-400   bg-rose-500/10   border-rose-500/20'    },
  reordenou_fila:           { label: 'Reordenou fila',           cor: 'text-amber-400  bg-amber-500/10  border-amber-500/20'   },
  alterou_role:             { label: 'Alterou perfil de usuário',cor: 'text-violet-400 bg-violet-500/10 border-violet-500/20'  },
  criou_convite:            { label: 'Criou convite',            cor: 'text-cyan-400   bg-cyan-500/10   border-cyan-500/20'    },
  deletou_convite:          { label: 'Deletou convite',          cor: 'text-rose-400   bg-rose-500/10   border-rose-500/20'    },
  criou_usuario:            { label: 'Criou usuário',            cor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'},
  alterou_perfil:           { label: 'Alterou permissões',       cor: 'text-violet-400 bg-violet-500/10 border-violet-500/20'  },
  configurou_falta_agua:    { label: 'Configurou Falta d\'água', cor: 'text-blue-400   bg-blue-500/10   border-blue-500/20'    },
  alterou_nome:             { label: 'Alterou nome',             cor: 'text-slate-400  bg-white/5       border-white/10'       },
}

function badgeAcao(acao) {
  const cfg = ACOES[acao] || { label: acao, cor: 'text-slate-400 bg-white/5 border-white/10' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cor}`}>
      {cfg.label}
    </span>
  )
}

function formatarDataHora(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatarDetalhes(detalhes) {
  if (!detalhes || Object.keys(detalhes).length === 0) return null
  return Object.entries(detalhes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
}

export default function Logs() {
  const [logs, setLogs]         = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroAcao, setFiltroAcao]       = useState('')
  const [filtroBusca, setFiltroBusca]     = useState('')

  useEffect(() => {
    const unsubscribe = ouvirLogs(data => {
      setLogs(data)
      setCarregando(false)
    })
    return () => unsubscribe()
  }, [])

  const usuarios = [...new Map(logs.map(l => [l.uid, l.nome])).entries()]
    .map(([uid, nome]) => ({ uid, nome }))
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))

  const logsFiltrados = logs.filter(l => {
    if (filtroUsuario && l.uid !== filtroUsuario) return false
    if (filtroAcao && l.acao !== filtroAcao) return false
    if (filtroBusca) {
      const txt = filtroBusca.toLowerCase()
      const emNome = (l.nome || '').toLowerCase().includes(txt)
      const emDetalhes = JSON.stringify(l.detalhes || {}).toLowerCase().includes(txt)
      if (!emNome && !emDetalhes) return false
    }
    return true
  })

  function exportarExcel() {
    const dados = logsFiltrados.map(l => ({
      'Data/Hora': formatarDataHora(l.criadoEm),
      'Usuário': l.nome || l.uid,
      'Ação': ACOES[l.acao]?.label || l.acao,
      'Detalhes': formatarDetalhes(l.detalhes) || '',
    }))
    const ws = XLSX.utils.json_to_sheet(dados)
    ws['!cols'] = [{ wch: 18 }, { wch: 24 }, { wch: 26 }, { wch: 50 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Logs')
    XLSX.writeFile(wb, `logs_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  function exportarPDF() {
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Log de Atividades', 14, 15)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Exportado em ${new Date().toLocaleString('pt-BR')} · ${logsFiltrados.length} registros`, 14, 22)

    autoTable(doc, {
      startY: 28,
      head: [['Data/Hora', 'Usuário', 'Ação', 'Detalhes']],
      body: logsFiltrados.map(l => [
        formatarDataHora(l.criadoEm),
        l.nome || l.uid,
        ACOES[l.acao]?.label || l.acao,
        formatarDetalhes(l.detalhes) || '',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], fontSize: 8, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 40 }, 2: { cellWidth: 48 }, 3: { cellWidth: 'auto' } },
    })

    doc.save(`logs_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const temFiltro = filtroUsuario || filtroAcao || filtroBusca

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto fade-up">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-white">Log de Atividades</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {carregando ? 'Carregando...' : `${logsFiltrados.length}${temFiltro ? `/${logs.length}` : ''} registro${logsFiltrados.length !== 1 ? 's' : ''} · últimos 300 dias`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-indigo-400">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/>
            </svg>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Filtros</span>
          </div>
          {temFiltro && (
            <button onClick={() => { setFiltroUsuario(''); setFiltroAcao(''); setFiltroBusca('') }}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpar tudo
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
            <span className="text-xs font-semibold text-slate-400 px-1">Busca</span>
            <div className={`flex items-center gap-1.5 bg-black/20 border rounded-xl px-3 py-2 transition-colors ${filtroBusca ? 'border-indigo-500/60' : 'border-white/10'} focus-within:border-indigo-500/60`}>
              <input value={filtroBusca} onChange={e => setFiltroBusca(e.target.value)}
                placeholder="Nome, detalhe..."
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full" />
              {filtroBusca && (
                <button onClick={() => setFiltroBusca('')} className="text-slate-500 hover:text-slate-300 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400 px-1">Usuário</span>
            <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}
              className={`bg-black/20 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${filtroUsuario ? 'border-indigo-500/60 text-indigo-300' : 'border-white/10 text-slate-400'}`}>
              <option value="">Todos</option>
              {usuarios.map(u => <option key={u.uid} value={u.uid}>{u.nome || u.uid}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400 px-1">Ação</span>
            <select value={filtroAcao} onChange={e => setFiltroAcao(e.target.value)}
              className={`bg-black/20 border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${filtroAcao ? 'border-indigo-500/60 text-indigo-300' : 'border-white/10 text-slate-400'}`}>
              <option value="">Todas</option>
              {Object.entries(ACOES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Exportar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <span className="text-xs text-slate-500 mr-1">Exportar lista atual:</span>
          <button onClick={exportarExcel} disabled={logsFiltrados.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
            </svg>
            Excel
          </button>
          <button onClick={exportarPDF} disabled={logsFiltrados.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-sm font-medium text-rose-400 hover:bg-rose-500/25 transition-all disabled:opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-white/[0.03] rounded-xl" />
          ))}
        </div>
      ) : logsFiltrados.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-600 text-sm">Nenhum registro encontrado</div>
      ) : (
        <div className="flex flex-col gap-1">
          {logsFiltrados.map(l => (
            <div key={l.id} className="flex items-start gap-3 px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="shrink-0 w-32 text-[11px] text-slate-600 mt-0.5 leading-tight">
                {formatarDataHora(l.criadoEm)}
              </div>
              <div className="shrink-0 w-36 text-xs text-slate-300 font-medium truncate mt-0.5">
                {l.nome || l.uid}
              </div>
              <div className="shrink-0">
                {badgeAcao(l.acao)}
              </div>
              {formatarDetalhes(l.detalhes) && (
                <div className="text-xs text-slate-500 min-w-0 truncate mt-0.5">
                  {formatarDetalhes(l.detalhes)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
