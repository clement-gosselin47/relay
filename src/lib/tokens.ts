export const RELAY = {
  yellow:     '#F6F5AE',
  yellowDeep: '#EDEC7A',
  ink:        '#181713',
  ink70:      'rgba(24,23,19,0.70)',
  ink55:      'rgba(24,23,19,0.55)',
  ink35:      'rgba(24,23,19,0.35)',
  bone:       '#F0EEE9',
  paper:      '#FAFAF7',
  line:       'rgba(24,23,19,0.12)',
  lineSoft:   'rgba(24,23,19,0.06)',
  display:    "'Montserrat Alternates', system-ui, sans-serif",
  body:       "'Geologica', system-ui, sans-serif",
} as const

export const CATEGORY: Record<string, { label: string; emoji: string; color: string }> = {
  cable:  { label: 'Matériel',  emoji: '🔌', color: '#E8D5FF' },
  design: { label: 'Design',    emoji: '🎨', color: '#FFD6E0' },
  code:   { label: 'Code',      emoji: '💻', color: '#D0F0FD' },
  cours:  { label: 'Cours',     emoji: '📚', color: '#D4EDDA' },
  test:   { label: 'Test UX',   emoji: '🧪', color: '#FFF3CD' },
  autre:  { label: 'Autre',     emoji: '✋', color: '#E2E3E5' },
}
