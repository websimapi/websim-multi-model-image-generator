// entry: simple multi-model image generator using websim.imageGen
// Starts immediately, mobile-friendly single screen.

const promptEl = document.getElementById('prompt');
const modelEl = document.getElementById('model');
const generateBtn = document.getElementById('generate');
const clearBtn = document.getElementById('clear');
const placeholder = document.getElementById('placeholder');
const metaEl = document.getElementById('meta');
const aspectEl = document.getElementById('aspect');
const upDetail = document.getElementById('up-detail');
const upStyle = document.getElementById('up-style');
const upTransparent = document.getElementById('up-transparent');

function setLoading(on, text = 'Generating — please wait…') {
  generateBtn.disabled = on;
  generateBtn.textContent = on ? 'Working…' : 'Generate';
  if (on) {
    placeholder.innerHTML = `<div class="small">${text}</div>`;
    metaEl.classList.add('hidden');
  }
}

function showImage(url, infoText, filename = 'image.png') {
  placeholder.innerHTML = '';
  const img = document.createElement('img');
  img.className = 'output';
  img.src = url;
  img.alt = 'Generated image';
  placeholder.appendChild(img);

  metaEl.innerHTML = `<div class="small">${infoText}</div>`;
  const a = document.createElement('a');
  a.className = 'download';
  a.href = url;
  a.download = filename;
  a.textContent = 'Download PNG';
  metaEl.appendChild(a);
  metaEl.classList.remove('hidden');
}

// Build model-specific option presets
function buildGenerationOptions() {
  const model = modelEl.value; // nano_banana, ai_flux, schnell
  const prompt = (promptEl.value || '').trim();
  const aspect = aspectEl.value;
  const upgrades = {
    detail: upDetail.checked,
    style: upStyle.checked,
    transparent: upTransparent.checked
  };

  // Base options
  const opts = {
    prompt: prompt || 'Abstract colorful composition',
    width: 1024,
    height: 1024,
    transparent: upgrades.transparent
  };

  // Aspect mapping (common simple mapping)
  if (aspect === '16:9') { opts.width = 1600; opts.height = 900; }
  if (aspect === '9:16') { opts.width = 900; opts.height = 1600; }

  // Model presets (simulated differences)
  if (model === 'nano_banana') {
    opts.prompt = `[Nano Banana model] ${opts.prompt}`;
    opts.quality = upgrades.detail ? 'high' : 'standard';
    if (upgrades.style) opts.prompt += ' --stylize dreamlike';
  } else if (model === 'ai_flux') {
    opts.prompt = `[AI Flux] ${opts.prompt}`;
    opts.quality = upgrades.detail ? 'ultra' : 'high';
    if (upgrades.style) opts.prompt += ' --stylize cinematic';
  } else if (model === 'schnell') {
    opts.prompt = `[Schnell] ${opts.prompt}`;
    // Schnell is fast: lower default size unless detail requested
    if (!upgrades.detail) { opts.width = Math.min(opts.width, 1024); opts.height = Math.min(opts.height, 1024); }
    if (upgrades.style) opts.prompt += ' --stylize minimal';
  }

  return { opts, meta: { model, aspect, upgrades } };
}

async function generate() {
  const { opts, meta } = buildGenerationOptions();
  setLoading(true);

  try {
    // Show a short minimum loading indicator if websim.imageGen takes time (per guidance, ~10s)
    // websim is available globally in this environment.
    const result = await websim.imageGen({
      prompt: opts.prompt,
      width: opts.width,
      height: opts.height,
      transparent: opts.transparent === true ? true : undefined,
      // seed or other params could be added here per model presets
    });

    // result.url is expected to be a public URL to the generated PNG (per websim API)
    const info = `Model: ${meta.model} • ${meta.aspect} • Detail:${meta.upgrades.detail ? 'on' : 'off'} • Style:${meta.upgrades.style ? 'on' : 'off'}`;
    showImage(result.url, info, `generated_${meta.model}.png`);
  } catch (err) {
    console.error(err);
    placeholder.innerHTML = `<div class="small">Error generating image. See console for details.</div>`;
    metaEl.classList.add('hidden');
  } finally {
    setLoading(false);
  }
}

generateBtn.addEventListener('click', generate);
clearBtn.addEventListener('click', () => {
  promptEl.value = '';
  placeholder.innerHTML = 'Outputs will appear here';
  metaEl.classList.add('hidden');
});