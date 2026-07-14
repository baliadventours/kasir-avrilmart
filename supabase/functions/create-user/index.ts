import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      // 1. Verify caller is an admin using their own JWT
      const { data: authUser, error: authError } = await ctx.supabase.auth.getUser();
      
      if (authError || !authUser?.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      if (authUser.user.user_metadata?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admins only' }, { status: 403, headers: corsHeaders });
      }

      // 2. Parse payload
      const { email, password, name, role } = await req.json();
      if (!email || !password || !name || !role) {
        return Response.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
      }

      // 3. Create user via admin API (bypasses email confirmation)
      const { data: newUser, error: createError } = await ctx.supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role
        }
      });

      if (createError) {
        return Response.json({ error: createError.message }, { status: 400, headers: corsHeaders });
      }

      const userId = newUser.user.id;

      // 4. Insert into public.users table using supabaseAdmin
      const { error: insertError } = await ctx.supabaseAdmin
        .from('users')
        .insert([{
          id: userId,
          email,
          name,
          role
        }]);

      if (insertError) {
        return Response.json({ 
          error: `Auth user created but database insert failed: ${insertError.message}` 
        }, { status: 500, headers: corsHeaders });
      }

      return Response.json({ 
        message: 'User created successfully',
        user: { id: userId, email, name, role }
      }, { headers: corsHeaders });

    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }),
};
