const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MealItem = {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

const MAX_BASE64_CHARS = 6_000_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured on server' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image_base64, mime_type } = (await req.json()) as {
      image_base64?: string;
      mime_type?: string;
    };

    if (!image_base64?.trim()) {
      return new Response(JSON.stringify({ error: 'image_base64 required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const base64 = image_base64.replace(/^data:image\/\w+;base64,/, '');
    if (base64.length > MAX_BASE64_CHARS) {
      return new Response(JSON.stringify({ error: 'Image too large' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const mime = mime_type?.startsWith('image/') ? mime_type : 'image/jpeg';
    const dataUrl = `data:${mime};base64,${base64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a nutrition assistant. Identify each distinct food visible in the meal photo. Estimate realistic portions and macros. Return JSON only: {"items":[{"name","quantity","unit","calories","protein_g","carbs_g","fat_g","fiber_g"}]}. Use simple names (e.g. Apple, Banana). quantity/unit should match what you estimate (piece, g, cup).',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this meal photo and list every food item with estimated nutrition.',
              },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText || 'OpenAI error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content) as { items?: MealItem[] };
    const items = (parsed.items ?? []).filter((i) => i.name && Number.isFinite(i.calories));

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
