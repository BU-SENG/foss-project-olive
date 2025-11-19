import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Initialize Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, fullName, role, hallId, deptId } = await req.json()

    // 2. Add to Whitelist (For records)
    await supabaseAdmin.from('admin_whitelist').upsert({
      email, role, full_name: fullName, hall_id: hallId || null, department_id: deptId || null
    }, { onConflict: 'email' })

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName }
    })

    if (authError) throw authError
    const userId = authData.user.id

    // =========================================================
    // 4. THE FORCE FIX (Override whatever the Trigger did)
    // =========================================================
    
    // A. Remove "Student" Role & Profile (if Trigger created them)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
    await supabaseAdmin.from('students').delete().eq('id', userId)

    // B. Insert CORRECT Role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role: role })
    
    if (roleError) throw roleError

    // C. Insert CORRECT Profile
    let profileError;
    if (role === 'hall_admin') {
      const { error } = await supabaseAdmin.from('hall_admins').insert({
        id: userId,
        full_name: fullName,
        hall_admin_id: 'HA-' + userId.slice(0,6).toUpperCase(),
        hall_id: hallId
      })
      profileError = error
    } else if (role === 'hod') {
      const { error } = await supabaseAdmin.from('hods').insert({
        id: userId,
        full_name: fullName,
        department_id: deptId
      })
      profileError = error
    } else if (role === 'security') {
      const { error } = await supabaseAdmin.from('security_personnel').insert({
        id: userId,
        full_name: fullName,
        security_id: 'SEC-' + userId.slice(0,6).toUpperCase()
      })
      profileError = error
    }

    if (profileError) throw profileError

    return new Response(JSON.stringify({ message: 'Official created and verified' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})