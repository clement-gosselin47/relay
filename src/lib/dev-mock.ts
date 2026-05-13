import type { Profile, Request, Conversation, Message } from '../types'

export const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export const MOCK_PROFILE: Profile = {
  id: 'dev-user-001',
  name: 'Camille Dev',
  email: 'camille@ynov.com',
  filiere: 'Dev Web',
  skills: ['React', 'TypeScript', 'Figma'],
  available: true,
  campus_radius: 'campus',
  push_subscription: null,
  created_at: new Date().toISOString(),
}

const now = Date.now()

// ── Mock Messages ─────────────────────────────────────────────

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-001': [
    { id: 'm-001', conversation_id: 'conv-001', sender_id: 'dev-user-001', content: 'Hey Lucas ! Je t\'apporte le câble, je suis au 2ème, j\'arrive dans 2 min 🙌', read: true,  created_at: new Date(now - 11 * 60 * 1000).toISOString() },
    { id: 'm-002', conversation_id: 'conv-001', sender_id: 'dev-user-002', content: 'Oh top ! T\'es une star sérieusement, la soutenance commence dans 8 min 😅', read: true,  created_at: new Date(now - 10 * 60 * 1000).toISOString() },
    { id: 'm-003', conversation_id: 'conv-001', sender_id: 'dev-user-001', content: 'Haha pas de stress, j\'arrive !', read: true,  created_at: new Date(now -  9 * 60 * 1000).toISOString() },
    { id: 'm-004', conversation_id: 'conv-001', sender_id: 'dev-user-002', content: 'Merci bcp ça s\'est bien passé 🎉', read: true,  created_at: new Date(now -  4 * 60 * 1000).toISOString() },
    { id: 'm-005', conversation_id: 'conv-001', sender_id: 'dev-user-002', content: 'Café offert quand tu veux 😄', read: false, created_at: new Date(now -  3 * 60 * 1000).toISOString() },
  ],
  'conv-002': [
    { id: 'm-006', conversation_id: 'conv-002', sender_id: 'dev-user-001', content: 'Salut Inès ! Je peux jeter un œil à ton Figma, je suis à la cafèt aussi', read: true, created_at: new Date(now - 7 * 60 * 1000).toISOString() },
    { id: 'm-007', conversation_id: 'conv-002', sender_id: 'dev-user-003', content: 'Super ! Je t\'envoie le lien du prototype', read: true, created_at: new Date(now - 6 * 60 * 1000).toISOString() },
    { id: 'm-008', conversation_id: 'conv-002', sender_id: 'dev-user-003', content: 'https://figma.com/proto/... — surtout regarde l\'onboarding step 2', read: true, created_at: new Date(now - 6 * 60 * 1000).toISOString() },
    { id: 'm-009', conversation_id: 'conv-002', sender_id: 'dev-user-001', content: 'Le contraste du CTA en step 2 est un peu faible, sinon le flow est clair 👌', read: true, created_at: new Date(now - 5 * 60 * 1000).toISOString() },
    { id: 'm-010', conversation_id: 'conv-002', sender_id: 'dev-user-003', content: 'Ah oui tu as raison, je corrige ça !', read: true, created_at: new Date(now - 4 * 60 * 1000).toISOString() },
  ],
  'conv-003': [
    { id: 'm-011', conversation_id: 'conv-003', sender_id: 'dev-user-001', content: 'Je peux regarder le bug, envoie ton code', read: true,  created_at: new Date(now - 58 * 60 * 1000).toISOString() },
    { id: 'm-012', conversation_id: 'conv-003', sender_id: 'dev-user-004', content: 'Voilà : `useEffect(() => { fetchData() }, [userId])` — ça re-render en boucle', read: true,  created_at: new Date(now - 57 * 60 * 1000).toISOString() },
    { id: 'm-013', conversation_id: 'conv-003', sender_id: 'dev-user-001', content: 'Le problème c\'est que fetchData est recréée à chaque render, entoure-la dans un useCallback', read: true,  created_at: new Date(now - 55 * 60 * 1000).toISOString() },
    { id: 'm-014', conversation_id: 'conv-003', sender_id: 'dev-user-004', content: 'Oh putain c\'est ça 😂 merci !!', read: true,  created_at: new Date(now - 54 * 60 * 1000).toISOString() },
    { id: 'm-015', conversation_id: 'conv-003', sender_id: 'dev-user-004', content: 'T\'as sauvé ma journée, pour de vrai', read: false, created_at: new Date(now - 52 * 60 * 1000).toISOString() },
    { id: 'm-016', conversation_id: 'conv-003', sender_id: 'dev-user-004', content: 'Du coup j\'ai aussi un autre truc bizarre si t\'as 5 min ?', read: false, created_at: new Date(now - 50 * 60 * 1000).toISOString() },
  ],
}

const lastMsg = (convId: string) => {
  const msgs = MOCK_MESSAGES[convId]
  return msgs[msgs.length - 1]
}
const unread = (convId: string) => MOCK_MESSAGES[convId].filter(m => !m.read && m.sender_id !== 'dev-user-001').length

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    request_id: 'req-001',
    requester_id: 'dev-user-002',
    helper_id: 'dev-user-001',
    created_at: new Date(now - 12 * 60 * 1000).toISOString(),
    request: { title: 'Câble HDMI pour soutenance dans 10 min' },
    requester: { id: 'dev-user-002', name: 'Lucas Martin', filiere: 'Dev Web' },
    helper:    { id: 'dev-user-001', name: 'Camille Dev',  filiere: 'Dev Web' },
    last_message: lastMsg('conv-001'),
    unread_count: unread('conv-001'),
  },
  {
    id: 'conv-002',
    request_id: 'req-002',
    requester_id: 'dev-user-003',
    helper_id: 'dev-user-001',
    created_at: new Date(now - 8 * 60 * 1000).toISOString(),
    request: { title: 'Avis rapide sur mon flow Figma avant rendu' },
    requester: { id: 'dev-user-003', name: 'Inès Dubois', filiere: 'Design UX' },
    helper:    { id: 'dev-user-001', name: 'Camille Dev', filiere: 'Dev Web' },
    last_message: lastMsg('conv-002'),
    unread_count: unread('conv-002'),
  },
  {
    id: 'conv-003',
    request_id: 'req-003',
    requester_id: 'dev-user-004',
    helper_id: 'dev-user-001',
    created_at: new Date(now - 60 * 60 * 1000).toISOString(),
    request: { title: 'Bug React bizarre sur un useEffect, qui peut aider ?' },
    requester: { id: 'dev-user-004', name: 'Tom Lefevre',  filiere: 'Dev Logiciel' },
    helper:    { id: 'dev-user-001', name: 'Camille Dev',  filiere: 'Dev Web' },
    last_message: lastMsg('conv-003'),
    unread_count: unread('conv-003'),
  },
]

export const MOCK_REQUESTS: Request[] = [
  {
    id: 'req-001',
    author_id: 'dev-user-002',
    title: 'Câble HDMI pour soutenance dans 10 min',
    description: 'J\'ai besoin d\'un câble HDMI pour brancher mon Mac à la TV de la salle B204.',
    categories: ['cable'],
    target_filieres: ['Dev Web', 'Design UX'],
    location: 'Bât. B · Salle 204',
    urgent: true,
    duration_min: 15,
    expires_at: new Date(now + 12 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date(now - 3 * 60 * 1000).toISOString(),
    author: {
      id: 'dev-user-002',
      name: 'Lucas Martin',
      email: 'lucas@ynov.com',
      filiere: 'Dev Web',
      skills: [],
      available: true,
      campus_radius: 'campus',
      push_subscription: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'req-002',
    author_id: 'dev-user-003',
    title: 'Avis rapide sur mon flow Figma avant rendu',
    description: 'J\'ai un doute sur ma hiérarchie visuelle, besoin d\'un regard extérieur.',
    categories: ['design'],
    target_filieres: ['Design UX'],
    location: 'Cafétéria RDC',
    urgent: false,
    duration_min: null,
    expires_at: null,
    status: 'active',
    created_at: new Date(now - 8 * 60 * 1000).toISOString(),
    author: {
      id: 'dev-user-003',
      name: 'Inès Dubois',
      email: 'ines@ynov.com',
      filiere: 'Design UX',
      skills: ['Figma', 'UX Research'],
      available: true,
      campus_radius: 'campus',
      push_subscription: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'req-003',
    author_id: 'dev-user-004',
    title: 'Bug React bizarre sur un useEffect, qui peut aider ?',
    description: null,
    categories: ['code'],
    target_filieres: ['Dev Web', 'Dev Logiciel'],
    location: 'Open space · 3ème étage',
    urgent: true,
    duration_min: 30,
    expires_at: new Date(now + 25 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date(now - 1 * 60 * 1000).toISOString(),
    author: {
      id: 'dev-user-004',
      name: 'Tom Lefevre',
      email: 'tom@ynov.com',
      filiere: 'Dev Logiciel',
      skills: ['Python', 'C++'],
      available: false,
      campus_radius: 'building',
      push_subscription: null,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'req-004',
    author_id: 'dev-user-005',
    title: 'Quelqu\'un a ses notes du cours d\'archi logicielle ?',
    description: 'J\'étais absent la semaine dernière, besoin du cours sur les design patterns.',
    categories: ['cours'],
    target_filieres: ['Dev Logiciel'],
    location: 'Bibliothèque',
    urgent: false,
    duration_min: null,
    expires_at: null,
    status: 'active',
    created_at: new Date(now - 22 * 60 * 1000).toISOString(),
    author: {
      id: 'dev-user-005',
      name: 'Sara Aziz',
      email: 'sara@ynov.com',
      filiere: 'Dev Logiciel',
      skills: [],
      available: true,
      campus_radius: 'promo',
      push_subscription: null,
      created_at: new Date().toISOString(),
    },
  },
]
