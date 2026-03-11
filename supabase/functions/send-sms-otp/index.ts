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
    const { phone } = await req.json();
    
    if (!phone || !/^\+7\d{10}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'Неверный формат номера. Используйте +7XXXXXXXXXX' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Delete old OTPs for this phone
    await supabase.from('phone_otp').delete().eq('phone', phone);

    // Insert new OTP
    const { error: insertError } = await supabase.from('phone_otp').insert({
      phone,
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      throw new Error(`DB error: ${insertError.message}`);
    }

    // Send SMS via SMS Aero
    const smsEmail = Deno.env.get('SMSAERO_EMAIL')!;
    const smsApiKey = Deno.env.get('SMSAERO_API_KEY')!;
    const authToken = btoa(`${smsEmail}:${smsApiKey}`);

    const phoneDigits = phone.replace('+', '');
    const message = `Ваш код подтверждения: ${code}`;

    const smsBody = JSON.stringify({
      number: phoneDigits,
      text: message,
      sign: "SMS Aero",
      channel: "DIRECT",
    });

    const smsResponse = await fetch(
      `https://gate.smsaero.ru/v2/sms/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: smsBody,
      }
    );

    const smsData = await smsResponse.json();
    console.log('SMS Aero response:', JSON.stringify(smsData));

    if (!smsResponse.ok || !smsData.success) {
      throw new Error(`SMS Aero error: ${JSON.stringify(smsData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Ошибка отправки SMS' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
