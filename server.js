cream// ============================================================================
// Bardani Ultra AI - Complete Single-File Express Server & Frontend App
// Run: npm init -y && npm i express multer cors
// Start: node server.js (Ensure GEMINI_API_KEY environment variable is set)
// ============================================================================

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Max 10MB per photo to support high-resolution reference images
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Image-capable Gemini models in order of priority with automatic fallback
const GEMINI_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image-preview"
];

const SCENES = {
  none: "CRITICAL 100% BACKGROUND LOCK: Strictly preserve the exact original background, room walls, lighting, indoor/outdoor setting, and environment directly from Photo 1 with 100% fidelity. Do NOT alter, do NOT replace, and do NOT blur the background.",
  same_bg: "CRITICAL 100% BACKGROUND LOCK: Maintain the exact original background, room walls, lighting, indoor/outdoor setting, and atmosphere directly from Photo 1 with 100% fidelity. Seamlessly integrate the subjects into this exact authentic background.",
  plain: "a clean neutral studio backdrop with soft ambient lighting and zero background clutter",
  beach: "a scenic tropical sunset beach with gentle ocean waves and warm golden-hour glow",
  temple: "an ornate ancient Indian heritage temple courtyard with warm natural sunlight",
  cafe: "an aesthetic modern boutique cafe interior with cozy warm ambient lighting",
  mountain: "a breathtaking mountain viewpoint with rolling hills and soft natural daylight",
  city: "a vibrant modern city boulevard with soft blurred bokeh street lights",
  village: "a picturesque rural village path surrounded by lush green trees and warm sunbeams",
  wedding: "an opulent Indian royal wedding mandap with festive floral decor"
};

const VEHICLES = {
  none: "",
  bullet: "sitting proudly on a classic Royal Enfield Bullet motorcycle",
  r15: "leaning against a sleek Yamaha R15 sports motorcycle",
  ktm: "beside a modern KTM Duke motorcycle",
  splendor: "seated naturally on a Hero Splendor motorcycle",
  thar: "standing confidently beside a rugged Mahindra Thar 4x4",
  scorpio: "standing beside a Mahindra Scorpio SUV",
  fortuner: "beside a premium Toyota Fortuner SUV",
  open_jeep: "standing beside an open classic 4x4 jeep"
};

const POSES = {
  none: "natural relaxed posture and facial expression directly matching the reference photograph",
  kissing: "romantic couple pose, a gentle passionate kiss, holding each other warmly and intimately",
  forehead_kiss: "boy gently kissing the girl on her forehead while holding her closely in a sweet loving embrace",
  hug: "tight warm romantic hug together, arms around each other, sharing happy natural smiles",
  looking_eyes: "standing face-to-face very close, deeply gazing into each other's eyes with loving smiles",
  cheek_to_cheek: "standing cheek-to-cheek, both looking at the camera with warm candid smiles",
  lift_arms: "boy lifting the girl in his arms romantically with cheerful expressions",
  forehead_touch: "touching foreheads gently in a tender intimate moment with eyes closed peacefully",
  back_hug: "boy warmly hugging the girl from behind holding her waist gently",
  bike_back_hug: "on motorcycle, girl hugging boy tightly from behind with wind in her hair",
  propose_knee: "boy down on one knee offering a rose in a heartfelt romantic proposal",
  hand_in_hand: "holding hands lovingly while walking together, gazing affectionately at each other",
  side_by_side: "standing close side by side, boy's arm gently resting around her waist",
  shoulder_lean: "girl gently resting her head on boy's shoulder in a warm loving posture",
  waist_hold: "boy's hands gently around her waist, looking close with gentle smiles",
  selfie: "holding phone camera taking a high-resolution candid cute couple selfie",
  standing: "confident natural standing posture, looking directly at the camera with authentic expression"
};

const OUTFITS_MALE = {
  none: "CLOTHING PRESERVATION: Strictly preserve the man's exact original clothing, garments, colors, collar, and fabric directly from Photo 1 with 100% fidelity. Do NOT change, recolor, or replace his clothes.",
  shirtjeans: "wearing a crisp button-down collared shirt and stylish dark blue denim jeans",
  kurta: "wearing an elegant designer Indian silk kurta pajama with subtle embroidery",
  suit: "wearing a sharp tailored formal blazer suit with crisp matching trousers",
  sherwani: "wearing a regal royal embroidered festive sherwani",
  casual: "wearing a modern casual streetwear t-shirt and clean cargo trousers",
  hoodie: "wearing a cozy modern hoodie and casual denim jeans"
};

const OUTFITS_FEMALE = {
  none: "Strictly preserve her original natural clothing, dress styling and colors without alteration.",
  salwar: "wearing an authentic designer embroidered salwar suit with a flowing dupatta",
  top_jeans: "wearing a stylish contemporary top and high-waisted denim jeans",
  saree: "wearing a gorgeous traditional Indian silk saree with intricate golden borders",
  lehenga: "wearing a festive designer lehenga choli with rich handwork",
  kurti_jeans: "wearing an elegant traditional kurti paired with modern jeans",
  anarkali: "wearing a graceful flowing long anarkali suit",
  western: "wearing an elegant contemporary western dress",
  rajasthani: "wearing a traditional Rajasthani poshak with ornate jewelry"
};

const GIRL_TYPES = {
  none: "a natural, beautiful complementary partner",
  indian: "a beautiful Indian girl",
  russian: "a beautiful Russian girl",
  american: "a stylish American girl",
  korean: "a cute modern Korean girl",
  japanese: "an elegant Japanese girl",
  chinese: "a graceful Chinese girl",
  british: "a charming British girl",
  french: "a chic Parisian French girl",
  italian: "a gorgeous Italian girl",
  spanish: "a beautiful Spanish girl",
  brazilian: "a stunning Brazilian girl",
  mexican: "a charming Mexican girl",
  german: "a beautiful German girl",
  ukrainian: "a lovely Ukrainian girl",
  canadian: "a cheerful Canadian girl",
  australian: "a stylish Australian girl",
  turkish: "a stunning Turkish girl",
  arabic: "an elegant Arab / Dubai girl",
  egyptian: "a beautiful Egyptian girl",
  nepali: "a sweet traditional Nepali girl",
  thai: "a charming Thai girl",
  vietnamese: "a lovely Vietnamese girl",
  indonesian: "a sweet Indonesian girl",
  swedish: "a fair Scandinavian Swedish girl",
  polish: "a charming Polish girl",
  college: "a cute college girl",
  school: "a cute teen girl with friendly smile",
  model: "a high-fashion runway model girl"
};

const STYLES = {
  none: "authentic unedited camera photograph, true skin tones, natural authentic lighting, zero artificial filters",
  ultra_4k: "ultra realistic 4K HDR photograph, hyper-detailed skin texture and pores, authentic eyes, sharp focus, natural lighting",
  const vehicleText = (opts.vehicle && opts.vehicle !== "none" && VEHICLES[opts.vehicle]) ? ${VEHICLES[opts.vehicle]} : "";
  cinematic: "cinematic 35mm film still, warm authentic movie lighting, realistic depth of field",
  studio_hd: "professional clean studio portrait, balanced highlights, crisp high definition details",
  dslr_portrait: "shot on 85mm f/1.4 lens, natural skin tones, sharp focus on facial features, authentic bokeh"
};

function buildPrompt(opts, hasGirlUpload, isCoupleMode) {
  const sceneText = SCENES[opts.scene] || SCENES.none;
  
  const vehicleText = (opts.vehicle && opts.vehicle !== "none" && VEHICLES[opts.vehicle] ? VEHICLES[opts.vehicle] : "";
  
  const styleText = STYLES[opts.style] || STYLES.ultra_4k;

  // Strict 100% Face preservation without assuming specific facial hair
  const faceLockBoy = "CRITICAL MANDATORY 100% EXACT FACE REPLICATION: The man's face MUST be a 100% identical replica of the man in Photo 1. Replicate his exact natural facial features, bone structure, facial geometry, eyes, nose, lips, facial hair or clean-shaven status exactly as in the photo, natural hairstyle, hairline, skin tone, and expression with ZERO morphing, ZERO distortion, and ZERO beautification or face replacement. The generated person must look undeniably like the exact same individual.";
  const faceLockGirl = "CRITICAL MANDATORY 100% EXACT GIRL FACE PRESERVATION: The woman's face MUST be a 100% exact replica of Photo 2. Replicate her exact facial landmarks, eyes, smile, bone structure, eyebrows, skin tone, and hair without any morphing or blending.";

  const maleOutfitText = OUTFITS_MALE[opts.maleOutfit] || OUTFITS_MALE.none;

  if (isCoupleMode) {
    const femaleOutfitText = OUTFITS_FEMALE[opts.femaleOutfit] || OUTFITS_FEMALE.none;

    if (hasGirlUpload) {
      return [
        `Ultra realistic photographic portrait of this couple.`,
        faceLockBoy,
        faceLockGirl,
        `Couple interaction & pose: ${poseText}.`,
        maleOutfitText,
        femaleOutfitText,
        vehicleText,
        `Environment & Background: ${sceneText}.`,
        `Style: ${styleText}. Photorealistic, anatomically accurate hands and natural posture, zero watermark.`
      ].filter(Boolean).join(" ");
    } else {
      const girlType = GIRL_TYPES[opts.girlType] || GIRL_TYPES.indian;
      return [
        `Ultra realistic romantic couple photograph of this man and ${girlType}.`,
        faceLockBoy,
        `The woman naturally complements his appearance.`,
        `Couple pose: ${poseText}.`,
        maleOutfitText,
        femaleOutfitText,
        vehicleText,
        `Environment & Background: ${sceneText}.`,
        `Style: ${styleText}. High photorealism, natural skin tones, zero morphing, zero artifacts.`
      ].filter(Boolean).join(" ");
    }
  }

  // Solo Mode
  return [
    `Ultra realistic solo photograph of the man.`,
    faceLockBoy,
    `Pose: ${poseText}.`,
    maleOutfitText,
    vehicleText,
    `Environment & Background: ${sceneText}.`,
    `Style: ${styleText}. Natural authentic skin texture, sharp details, zero artifacts, zero watermark.`
  ].filter(Boolean).join(" ");
}

async function callGeminiImageAPI(prompt, imageParts, apiKey) {
  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE"]
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const msg = data.error?.message || `HTTP ${response.status}`;
        lastError = new Error(`Model [${model}] failed: ${msg}`);
        console.warn(`[Bardani AI Warning] ${lastError.message}`);
        continue;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData || p.inline_data);
      const img = imagePart?.inlineData || imagePart?.inline_data;

      if (img && img.data) {
        const mime = img.mimeType || img.mime_type || "image/jpeg";
        return `data:${mime};base64,${img.data}`;
      } else {
        lastError = new Error(`Model [${model}] responded without returning an image.`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Bardani AI Network Error] ${model}:`, err.message);
    }
  }

  throw lastError || new Error("All Gemini image models failed to generate.");
}

app.post("/api/generate", upload.fields([{ name: "photo1" }, { name: "photo2" }]), async (req, res) => {
  try {
    const apiKey = req.body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY उपलब्ध नहीं है। कृपया .env सेट करें या ऐप में API Key दर्ज करें।" 
      });
    }

    if (req.body.consent !== "true") {
      return res.status(400).json({ error: "Consent checkbox tick karein (Photo use permission zaroori hai)." });
    }

    const photo1 = req.files?.photo1?.[0];
    const photo2 = req.files?.photo2?.[0];

    if (!photo1) {
      return res.status(400).json({ error: "Boy (Photo 1) अपलोड करना आवश्यक है।" });
    }

    let opts = {};
    try {
      opts = JSON.parse(req.body.options || "{}");
    } catch (e) {
      opts = {};
    }

    const isCouple = opts.mode === "couple";
    const hasGirlUpload = isCouple && Boolean(photo2);
    const count = Math.min(Math.max(parseInt(req.body.count || "1", 10), 1), 2);

    const prompt = buildPrompt(opts, hasGirlUpload, isCouple);
    console.log(`[Bardani AI] Generating with prompt:`, prompt);

    // Format parts matching Gemini REST API specs (camelCase inlineData and mimeType)
    const imageParts = [];
    imageParts.push({
      inlineData: {
        mimeType: photo1.mimetype || "image/jpeg",
        data: photo1.buffer.toString("base64")
      }
    });

    if (hasGirlUpload) {
      imageParts.push({
        inlineData: {
          mimeType: photo2.mimetype || "image/jpeg",
          data: photo2.buffer.toString("base64")
        }
      });
    }

    const generatedImages = [];
    for (let i = 0; i < count; i++) {
      try {
        const imageBase64 = await callGeminiImageAPI(prompt, imageParts, apiKey);
        generatedImages.push(imageBase64);
      } catch (genErr) {
        console.error(`Generation variation #${i + 1} failed:`, genErr.message);
        if (i === 0) {
          return res.status(502).json({ error: genErr.message });
        }
      }
    }

    if (!generatedImages.length) {
      return res.status(502).json({ error: "AI image create nahi ho paayi. Dusra pose ya setting try karein." });
    }

    res.json({ success: true, count: generatedImages.length, images: generatedImages });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message || "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bardani Ultra AI</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen py-6 px-3 sm:px-4 selection:bg-rose-500 selection:text-white">
  <div class="max-w-6xl mx-auto space-y-5">
    
    <!-- Header with Pig Vector Logo -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
      <div class="flex items-center gap-3.5">
        
        <!-- Official Cute Pig SVG Badge -->
        <div class="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-400 shadow-xl shadow-rose-500/30 shrink-0">
          <svg class="w-full h-full rounded-full" viewBox="0 0 500 500">
            <defs>
              <linearGradient id="pigBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff1f2"/>
                <stop offset="40%" stop-color="#fecdd3"/>
                <stop offset="100%" stop-color="#fda4af"/>
              </linearGradient>
              <linearGradient id="pigSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fce7f3"/>
                <stop offset="50%" stop-color="#f472b6"/>
                <stop offset="100%" stop-color="#ec4899"/>
              </linearGradient>
              <linearGradient id="pigSnout" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fb7185"/>
                <stop offset="100%" stop-color="#be123c"/>
              </linearGradient>
            </defs>
            <circle cx="250" cy="250" r="240" fill="url(#pigBg)"/>
            <circle cx="250" cy="250" r="232" fill="none" stroke="#fb7185" stroke-width="8" stroke-dasharray="16 8"/>
            <path d="M125 185 C85 95, 160 55, 195 125 Z" fill="url(#pigSkin)"/>
            <path d="M375 185 C415 95, 340 55, 305 125 Z" fill="url(#pigSkin)"/>
            <ellipse cx="250" cy="270" rx="160" ry="145" fill="url(#pigSkin)"/>
            <ellipse cx="160" cy="298" rx="25" ry="16" fill="#f43f5e" opacity="0.38"/>
            <ellipse cx="340" cy="298" rx="25" ry="16" fill="#f43f5e" opacity="0.38"/>
            <ellipse cx="185" cy="230" rx="19" ry="25" fill="#1e1b4b"/>
            <circle cx="178" cy="220" r="8.5" fill="#ffffff"/>
            <ellipse cx="315" cy="230" rx="19" ry="25" fill="#1e1b4b"/>
            <circle cx="308" cy="220" r="8.5" fill="#ffffff"/>
            <ellipse cx="250" cy="295" rx="65" ry="46" fill="url(#pigSnout)"/>
            <ellipse cx="225" cy="296" rx="11" ry="16" fill="#881337"/>
            <ellipse cx="275" cy="296" rx="11" ry="16" fill="#881337"/>
            <path d="M225 358 Q250 378 275 358" stroke="#881337" stroke-width="6" fill="none" stroke-linecap="round"/>
          </svg>
        </div>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">
              BARDANI <span class="text-rose-500">ULTRA AI</span>
            </h1>
            <span class="px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-400 text-[11px] font-bold uppercase tracking-wider">
              फाउंडर व ऑफिशियल लोगो ✓
            </span>
          </div>
          <p class="text-slate-400 text-xs mt-0.5">
            अल्ट्रा रियलिस्टिक 4K/8K सोलो और रोमांटिक कपल फोटो जनरेटर (100% Face & Clothes Match)
          </p>
        </div>
      </div>

      <!-- Controls: API Key & Live Badge -->
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          🟢 LIVE
        </span>
        <button id="btnToggleKey" type="button" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700">
          🔑 Custom Key
        </button>
      </div>
    </div>

    <!-- API Key Input Drawer -->
    <div id="keyBox" class="hidden bg-slate-900 border border-slate-800 p-3 rounded-xl max-w-lg mx-auto flex items-center gap-2">
      <input type="password" id="customApiKey" placeholder="Enter GEMINI_API_KEY if needed..." class="w-full bg-slate-950 border border-slate-700 text-xs px-3 py-2 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500">
      <button id="btnClearKey" class="text-xs text-rose-400 hover:text-rose-300 px-2">Clear</button>
    </div>

    <!-- Error Banner -->
    <div id="errorBox" class="hidden bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs p-3.5 rounded-xl shadow-lg"></div>

  </div>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Bardani AI] Server running on port ${PORT}`);
});
  
