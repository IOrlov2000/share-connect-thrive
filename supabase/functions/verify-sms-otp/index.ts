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
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return new Response(JSON.stringify({ error: 'Номер и код обязательны' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('phone_otp')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !otpRecord) {
      return new Response(JSON.stringify({ error: 'Неверный или просроченный код' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as verified & clean up
    await supabase.from('phone_otp').delete().eq('phone', phone);

    // Deterministic internal email and password for phone users
    const userEmail = `${phone.replace('+', '')}@phone.user`;
    const internalPassword = `sms_auth_${phone}_${serviceRoleKey.slice(-12)}`;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.phone === phone || u.email === userEmail
    );

    let userId: string;
    
    if (existingUser) {
      userId = existingUser.id;
      // Ensure password is correct and phone is confirmed
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: internalPassword,
        phone,
        phone_confirm: true,
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userEmail,
        phone,
        password: internalPassword,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { display_name: phone },
      });

      if (createError) throw new Error(createError.message);
      userId = newUser.user.id;
    }

    // Link Telegram chat_id to user if exists
    await supabase.from('telegram_chats')
      .update({ user_id: userId })
      .eq('phone', phone);

    return new Response(JSON.stringify({
      success: true,
      email: userEmail,
      password: internalPassword,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка верификации' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
