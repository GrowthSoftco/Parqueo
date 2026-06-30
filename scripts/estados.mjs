import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

// Tintes de estado (fondo/borde) → color-mix translúcido que se adapta
// al tema. El color de texto/ícono vivo (#22c55e, etc.) NO se toca.
const MAP = {
  '#0f2a1a': 'color-mix(in srgb, #22c55e 16%, transparent)',
  '#0f1f2a': 'color-mix(in srgb, #3b82f6 16%, transparent)',
  '#2a230f': 'color-mix(in srgb, #f59e0b 16%, transparent)',
  '#2a0f0f': 'color-mix(in srgb, #ef4444 16%, transparent)',
  '#1a4a2a': 'color-mix(in srgb, #22c55e 32%, transparent)',
  '#1a334a': 'color-mix(in srgb, #3b82f6 32%, transparent)',
  '#4a3a1a': 'color-mix(in srgb, #f59e0b 32%, transparent)',
  '#4a1a1a': 'color-mix(in srgb, #ef4444 32%, transparent)',
  '#3a1a1a': 'color-mix(in srgb, #ef4444 32%, transparent)',
}

const files = execSync('git ls-files "src/**/*.tsx"', { encoding: 'utf8' }).trim().split('\n')
let n = 0, fn = 0
for (const f of files) {
  let s = readFileSync(f, 'utf8')
  const before = s
  for (const [hex, mix] of Object.entries(MAP)) {
    s = s.replace(new RegExp(hex, 'gi'), () => { n++; return mix })
  }
  if (s !== before) { writeFileSync(f, s); fn++ }
}
console.log(`Archivos: ${fn} · reemplazos: ${n}`)
