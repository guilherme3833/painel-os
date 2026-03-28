import { useState, useEffect } from 'react'

export default function ContadorAnimado({ valor, duracao = 1200 }) {
  const [atual, setAtual] = useState(0)
  useEffect(() => {
    if (!valor) { setAtual(0); return }
    let inicio = null
    const animar = (ts) => {
      if (!inicio) inicio = ts
      const p = Math.min((ts - inicio) / duracao, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setAtual(Math.floor(ease * valor))
      if (p < 1) requestAnimationFrame(animar)
    }
    requestAnimationFrame(animar)
  }, [valor])
  return atual.toLocaleString('pt-BR')
}
