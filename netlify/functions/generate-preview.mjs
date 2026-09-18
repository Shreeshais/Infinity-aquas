// Netlify Serverless Function for AI Bottle Wrap Generation
// Powered by OpenRouter: google/gemini-3.1-flash-lite-image (Nano Banana 2 Lite)
// Compatible with both Netlify Functions v1 and v2 runtimes

async function callOpenRouter(apiKey, body) {
  const model = process.env.OPENROUTER_MODEL
    || body.model
    || 'google/gemini-3.1-flash-lite-image';

  const samples = Number(body.samples) || 1;
  const direction = (body.direction || '').trim();
  const ratio = (body.aspect_ratio || body.response_format?.aspect_ratio) === '3:2' ? '3:2' : '2:3';

  // Build the prompt for Google Gemini
  const bottleCountText = `${samples} clear PET plastic drinking water bottle${samples === 1 ? '' : 's'}`;
  const promptText = `Create a photorealistic studio product mockup of ${bottleCountText} with the provided brand logo faithfully applied as a full waterproof bottle wrap. Preserve the uploaded artwork clearly and do not invent a different brand. Upright on dark premium studio reflective background. Visual direction: ${direction || 'clean, modern, luxury and premium'}. High resolution 1K commercial product photography, no extra text or watermark.`;

  // Provide the uploaded logo as input_reference so Gemini sees and paints the real logo
  const inputReferences = [];
  const imgPart = Array.isArray(body.input) ? body.input.find(p => p.type === 'image') : null;
  if (imgPart && imgPart.data) {
    const mime = imgPart.mime_type || 'image/png';
    inputReferences.push({
      type: 'image_url',
      image_url: {
        url: `data:${mime};base64,${imgPart.data}`
      }
    });
  }

  const payload = {
    model,
    prompt: promptText,
    aspect_ratio: ratio,
    n: 1
  };

  if (inputReferences.length > 0) {
    payload.input_references = inputReferences;
  }

  const response = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://infinityaquas.com',
      'X-Title': 'Infinity Aquas AI Bottle Visualiser'
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const raw = await response.text().catch(() => '');
    throw new Error(`OpenRouter returned status ${response.status}: ${raw.slice(0, 150)}`);
  }

  const json = await response.json();
  if (!response.ok || json.error || Array.isArray(json)) {
    let errMsg = '';
    if (Array.isArray(json)) {
      errMsg = json.map(e => e.message || JSON.stringify(e)).join(', ');
    } else if (json.error) {
      errMsg = typeof json.error === 'string' ? json.error : (json.error.message || JSON.stringify(json.error));
    } else {
      errMsg = `OpenRouter error (${response.status})`;
    }
    throw new Error(errMsg);
  }

  const imageObj = json.data?.[0];
  if (!imageObj) {
    throw new Error('OpenRouter did not return any image data.');
  }

  const base64 = imageObj.b64_json || imageObj.image || '';
  const mimeType = imageObj.media_type || 'image/png';

  if (!base64 && imageObj.url) {
    const imgRes = await fetch(imageObj.url);
    const buf = await imgRes.arrayBuffer();
    return {
      status: 200,
      data: {
        outputs: [
          {
            type: 'image',
            data: Buffer.from(buf).toString('base64'),
            mime_type: imgRes.headers.get('content-type') || 'image/png'
          }
        ]
      }
    };
  }

  return {
    status: 200,
    data: {
      outputs: [
        {
          type: 'image',
          data: base64,
          mime_type: mimeType
        }
      ]
    }
  };
}

async function handleRequest(body) {
  const openrouterKey = process.env.OPENROUTER_API_KEY
    || process.env.OPENROUTER_KEY
    || process.env.OR_API_KEY;

  if (!openrouterKey) {
    return {
      status: 500,
      data: {
        error: {
          message: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY in your Netlify Site Configuration -> Environment Variables.'
        }
      }
    };
  }

  try {
    return await callOpenRouter(openrouterKey, body);
  } catch (err) {
    console.error('OpenRouter generation failed:', err);
    return {
      status: 500,
      data: {
        error: {
          message: err.message || 'Error communicating with OpenRouter'
        }
      }
    };
  }
}

// Netlify Functions v2 handler
export default async (req, context) => {
  // If invoked with v1 event
  if (!req || typeof req.json !== 'function') {
    return handler(req, context);
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method Not Allowed' } }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await req.json().catch(() => ({}));
  const result = await handleRequest(body);
  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Netlify Functions v1 backward-compatible handler
export const handler = async (event, context) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'Method Not Allowed' } })
    };
  }

  const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
  const result = await handleRequest(body);
  return {
    statusCode: result.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data)
  };
};
