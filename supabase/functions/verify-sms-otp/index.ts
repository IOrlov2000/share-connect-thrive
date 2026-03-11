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

    // Mark as verified
    await supabase.from('phone_otp').update({ verified: true }).eq('id', otpRecord.id);

    // Create or sign in user via admin API
    // Check if user with this phone exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.phone === phone);

    let session;

    if (existingUser) {
      // Generate magic link / sign in token
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: existingUser.email || `${phone.replace('+', '')}@phone.local`,
      });
      
      if (error) throw new Error(error.message);
      
      // Sign in with the token
      const { data: signInData, error: signInError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { phone_confirm: true }
      );
      
      // Generate session directly
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        phone,
        password: otpRecord.id, // won't work, need different approach
      });

      // Use admin to create a session
      session = null;
    }

    // Better approach: create user if not exists, then return a custom token
    // Let's use a simpler method - sign up/in with phone+password where password is managed internally

    // Check if user exists by looking up profiles with this phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('phone', phone)
      .single();

    let userId: string;
    const internalPassword = `sms_${phone}_${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!.slice(-16)}`;

    if (profile) {
      userId = profile.user_id;
      // Update phone_confirm
      await supabase.auth.admin.updateUserById(userId, { phone_confirm: true });
    } else {
      // Create new user
      const email = `${phone.replace('+', '')}@phone.user`;
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        phone,
        password: internalPassword,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { display_name: phone },
      });

      if (createError) throw new Error(createError.message);
      userId = newUser.user!.id;
    }

    // Generate a session token for the user  
    // Use signInWithPassword with the internal password
    const userEmail = `${phone.replace('+', '')}@phone.user`;
    
    // Make sure password is set
    await supabase.auth.admin.updateUserById(userId, { 
      password: internalPassword,
      email: userEmail,
    });

    // Clean up OTP
    await supabase.from('phone_otp').delete().eq('phone', phone);

    return new Response(JSON.stringify({ 
      success: true, 
      email: userEmail,
      password: internalPassword,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка верификации' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
