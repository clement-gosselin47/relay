// Relay — Edge Function: notify-help
// Triggered via Supabase Database Webhook on help_offers INSERT
//
// Setup in Supabase Dashboard → Database → Webhooks → New webhook:
//   Table: help_offers  |  Event: INSERT  |  URL: https://<project>.supabase.co/functions/v1/notify-help
//
// Required secrets (supabase secrets set):
//   SUPABASE_URL          = https://<project>.supabase.co
//   SUPABASE_SERVICE_KEY  = sb_secret_...
//   RESEND_API_KEY        = re_...
//   VAPID_PRIVATE_KEY     = (generate with: npx web-push generate-vapid-keys)
//   VAPID_PUBLIC_KEY      = (same command)
//   FROM_EMAIL            = noreply@yourdomain.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const RESEND_KEY    = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL    = Deno.env.get('FROM_EMAIL') ?? 'Relay <noreply@relay.app>'
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    const record  = payload.record ?? payload // webhook sends {record, ...}

    const { request_id, helper_id } = record

    // Fetch request + author
    const { data: request, error: reqErr } = await supabase
      .from('requests')
      .select('*, author:profiles!author_id(id, name, email, push_subscription)')
      .eq('id', request_id)
      .single()

    if (reqErr || !request) {
      return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 })
    }

    // Fetch helper profile
    const { data: helper } = await supabase
      .from('profiles')
      .select('name, filiere')
      .eq('id', helper_id)
      .single()

    const author      = request.author as { id: string; name: string; email: string; push_subscription: object | null }
    const helperName  = helper?.name ?? 'Quelqu\'un'
    const requestTitle = request.title

    const notifTitle = `${helperName} veut t'aider !`
    const notifBody  = `"${requestTitle}"`

    // ── Send email via Resend ──────────────────────────────
    if (RESEND_KEY && author.email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to:   [author.email],
          subject: notifTitle,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
              <h1 style="font-size: 24px; margin-bottom: 8px;">✋ ${notifTitle}</h1>
              <p style="font-size: 16px; color: #444; margin-bottom: 24px;">
                Pour ta demande : <strong>${requestTitle}</strong>
              </p>
              <p style="font-size: 14px; color: #666;">
                ${helperName}${helper?.filiere ? ` (${helper.filiere})` : ''} est prêt·e à t'aider.
                Retrouve-le·la à l'emplacement indiqué.
              </p>
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                Relay — Entraide flash entre étudiants
              </div>
            </div>
          `,
        }),
      })
    }

    // ── Send Web Push ──────────────────────────────────────
    if (VAPID_PRIVATE && VAPID_PUBLIC && author.push_subscription) {
      try {
        const { sendNotification, setVapidDetails } = await import('https://esm.sh/web-push@3')
        setVapidDetails('mailto:noreply@relay.app', VAPID_PUBLIC, VAPID_PRIVATE)
        await sendNotification(
          author.push_subscription,
          JSON.stringify({ title: notifTitle, body: notifBody, url: '/' })
        )
      } catch (pushErr) {
        console.error('Push failed:', pushErr)
        // Non-fatal — email already sent
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-help error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
