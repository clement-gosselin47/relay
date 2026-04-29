import { CATEGORY } from '../../lib/tokens'

interface CategoryTileProps {
  cat: string
  size?: number
  filled?: boolean
}

export function CategoryTile({ cat, size = 40, filled = false }: CategoryTileProps) {
  const def = CATEGORY[cat] ?? CATEGORY.autre
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.4,
      background: filled ? def.color : `${def.color}88`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.52,
      flexShrink: 0,
    }}>
      {def.emoji}
    </div>
  )
}
