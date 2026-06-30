import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const DRY = process.argv.includes('--dry')

// Grises de superficie/borde/texto → token. Los semánticos (rojo/verde/
// ámbar/azul/morado) y los tintes de estado (#0f2a1a, etc.) NO están aquí.
const MAP = {
  // superficies / bordes
  panel: ['#0d0d0d', '#0f0f0f', '#111111', '#101010', '#0e0e0e'],
  surface: ['#131313', '#141414', '#121212'],
  surface2: ['#151515', '#161616', '#171717', '#181818'],
  surface3: ['#191919', '#1a1a1a', '#1b1b1b', '#1c1c1c'],
  border: ['#1d1d1d', '#1e1e1e', '#1f1f1f'],
  border2: ['#202020', '#212121', '#222222', '#222', '#232323', '#242424', '#252525'],
  border3: ['#262626', '#272727', '#282828', '#2a2a2a', '#2c2c2c', '#2e2e2e', '#2b2b2b'],
  // texto
  text: ['#ededed', '#eeeeee', '#eee', '#e5e5e5', '#e7e7e7', '#fafafa', '#f5f5f5', '#fefefe'],
  text2: ['#dddddd', '#ddd', '#d4d4d4', '#cccccc', '#ccc', '#cfcfcf', '#bbbbbb', '#bbb', '#aaaaaa', '#aaa', '#b4b4b4', '#c0c0c0'],
  text3: ['#999999', '#999', '#9a9a9a', '#909090', '#8a8a8a', '#888888', '#888'],
  text4: ['#7a7a7a', '#777777', '#777', '#707070', '#6e6e6e', '#666666', '#666'],
  text5: ['#5e5e5e', '#5a5a5a', '#585858', '#555555', '#555', '#4d4d4d', '#4a4a4a', '#444444', '#444', '#3f3f3f', '#3a3a3a', '#3d3d3d'],
}

const files = execSync('git ls-files "src/**/*.tsx"', { encoding: 'utf8' }).trim().split('\n').filter(Boolean)

let totalFiles = 0
let totalRepl = 0
const perToken = {}

for (const file of files) {
  let src = readFileSync(file, 'utf8')
  const before = src
  let n = 0

  const rep = (re, to, tokenName) => {
    src = src.replace(re, (m, ...g) => {
      n++
      perToken[tokenName] = (perToken[tokenName] || 0) + 1
      // si el patrón captura un grupo (espacio tras los dos puntos), respétalo
      return typeof g[0] === 'string' && to.includes('$1') ? to.replace('$1', g[0]) : to
    })
  }

  // 1) Botones blancos: background #fff → acento (con su texto)
  rep(/background:(\s*)['"]#(?:fff|ffffff)['"]/gi, "background:$1'var(--c-accent)'", 'accent')
  rep(/backgroundColor:(\s*)['"]#(?:fff|ffffff)['"]/gi, "backgroundColor:$1'var(--c-accent)'", 'accent')
  // 2) Texto negro (sobre acento)
  rep(/color:(\s*)['"]#(?:000|000000)['"]/gi, "color:$1'var(--c-on-accent)'", 'on-accent')
  // 3) Fondo negro de página → bg
  rep(/background:(\s*)['"]#(?:000|000000|0a0a0a|080808|0b0b0b|090909)['"]/gi, "background:$1'var(--c-bg)'", 'bg')
  rep(/backgroundColor:(\s*)['"]#(?:000|000000|0a0a0a)['"]/gi, "backgroundColor:$1'var(--c-bg)'", 'bg')

  // 4) Mapeo directo de grises (cualquier contexto)
  for (const [token, hexes] of Object.entries(MAP)) {
    for (const hex of hexes) {
      const re = new RegExp(hex.replace('#', '#') + '(?![0-9a-fA-F])', 'gi')
      rep(re, `var(--c-${token})`, token)
    }
  }

  // 5) Restos de blanco como color/borde/svg → texto primario
  rep(/#(?:fff|ffffff)(?![0-9a-fA-F])/gi, 'var(--c-text)', 'text')

  if (src !== before) {
    totalFiles++
    totalRepl += n
    if (!DRY) writeFileSync(file, src)
  }
}

console.log(`${DRY ? '[DRY] ' : ''}Archivos cambiados: ${totalFiles} · reemplazos: ${totalRepl}`)
console.log('Por token:', perToken)
