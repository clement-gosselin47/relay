import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Request } from '../types'

interface HistoryItem {
  id: string
  created_at: string
  request: Pick<Request, 'id' | 'title' | 'categories'>
}

interface ProfileStats {
  helpsGiven: number
  requestsMade: number
}

export function useProfile(userId: string | undefined) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stats, setStats] = useState<ProfileStats>({ helpsGiven: 0, requestsMade: 0 })

  useEffect(() => {
    if (!userId) return

    async function load() {
      const [{ data: offers }, { count: reqCount }] = await Promise.all([
        supabase
          .from('help_offers')
          .select('id, created_at, request:requests(id, title, categories)')
          .eq('helper_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('requests')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', userId),
      ])

      if (offers) {
        setHistory(offers as unknown as HistoryItem[])
        setStats({ helpsGiven: offers.length, requestsMade: reqCount ?? 0 })
      }
    }

    load()
  }, [userId])

  async function toggleAvailable(profile: Profile, value: boolean) {
    await supabase
      .from('profiles')
      .update({ available: value })
      .eq('id', profile.id)
  }

  async function updateCampusRadius(profile: Profile, radius: string) {
    await supabase.from('profiles').update({ campus_radius: radius }).eq('id', profile.id)
  }

  async function updateSkills(profile: Profile, skills: string[]) {
    await supabase.from('profiles').update({ skills }).eq('id', profile.id)
  }

  async function updateProfileInfo(profile: Profile, name: string, filiere: string) {
    await supabase.from('profiles').update({ name, filiere }).eq('id', profile.id)
  }

  async function uploadAvatar(profile: Profile, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
    return url
  }

  return { history, stats, toggleAvailable, updateCampusRadius, updateSkills, updateProfileInfo, uploadAvatar }
}
