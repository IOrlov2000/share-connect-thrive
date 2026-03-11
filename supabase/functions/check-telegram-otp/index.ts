import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { link_token } = await req.json();

    if (!link_token) {
      return new Response(JSON.stringify({ error: 'link_token обязателен' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: otpRecord } = await supabase
      .from('phone_otp')
      .select('*')
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .or(`telegram_chat_id.eq.pending:${link_token},telegram_chat_id.like.confirm:${link_token}:%,telegram_chat_id.like.sent:${link_token}:%,telegram_chat_id.like.rejected:${link_token}:%`)
      .maybeSingle();

    if (!otpRecord) {
      return new Response(JSON.stringify({ status: 'expired' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (otpRecord.telegram_chat_id?.startsWith(`sent:${link_token}:`)) {
      return new Response(JSON.stringify({ status: 'sent', phone: otpRecord.phone }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (otpRecord.telegram_chat_id?.startsWith(`rejected:${link_token}:`)) {
      return new Response(JSON.stringify({ status: 'rejected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'pending' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
