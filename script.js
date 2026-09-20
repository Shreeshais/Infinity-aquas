const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer:fine)').matches;
const header = document.getElementById('header');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const preloader = document.getElementById('preloader');
const heroBottle = document.getElementById('heroBottle');
const heroStage = document.getElementById('heroStage');

function finishLoading(){
  preloader?.remove();
  document.body.classList.remove('locked');
  if(window.ScrollTrigger) ScrollTrigger.refresh();
}
window.addEventListener('load',()=>{
  if(reduceMotion || !window.gsap){finishLoading();return}
  gsap.timeline().to('.loader-track span',{width:'100%',duration:.65,ease:'power2.inOut'})
    .to('.preloader',{yPercent:-100,duration:.8,ease:'power3.inOut',onComplete:finishLoading});
});
document.body.classList.add('locked');
setTimeout(()=>{if(document.body.classList.contains('locked')) finishLoading()},4500);

let scrollTicking = false;
let lastScrollY = 0;

function updateHeaderOnScroll() {
  const currentScrollY = Math.max(0, window.scrollY);
  const isMenuOpen = navLinks?.classList.contains('open');

  header?.classList.toggle('scrolled', currentScrollY > 10);

  if (isMenuOpen || currentScrollY <= 60) {
    // Always show at top or when menu is open
    header?.classList.remove('header-hidden');
  } else if (currentScrollY > lastScrollY) {
    // Scrolling DOWN — hide
    header?.classList.add('header-hidden');
  } else {
    // Scrolling UP — show
    header?.classList.remove('header-hidden');
  }

  lastScrollY = currentScrollY;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateHeaderOnScroll);
    scrollTicking = true;
  }
}, { passive: true });

function closeMenu(){
  navLinks?.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
}
menuBtn?.addEventListener('click',()=>{
  const open=navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded',String(open));
  if(open) header?.classList.remove('header-hidden');
});
navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);

  if(!reduceMotion){
    gsap.utils.toArray('.reveal').forEach((el,i)=>{
      gsap.fromTo(el,
        { y: 20 },
        { y: 0, duration: 0.7, ease: 'power2.out', delay: (i % 4) * 0.03,
          scrollTrigger: { trigger: el, start: 'top 95%', once: true }
        }
      );
    });
    gsap.from('.hero-copy',{opacity:0,y:28,duration:1,ease:'power3.out',delay:.15});
    gsap.from('.hero-stage',{opacity:0,y:18,duration:1.05,ease:'power3.out',delay:.05});
    gsap.to(heroBottle,{y:-18,rotation:-3,x:7,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.orbit-one',{rotation:3,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.orbit-two',{rotation:14,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.orbit-three',{rotation:-9,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.stage-copy-one',{y:45,x:10,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.stage-copy-two',{y:-30,x:-10,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    if(window.innerWidth > 660){
      gsap.to('.side-number',{y:-35,scrollTrigger:{trigger:'.idea',start:'top bottom',end:'bottom top',scrub:1}});
    }
  }
}

if(finePointer && !reduceMotion && window.gsap){
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2;
      const y=e.clientY-r.top-r.height/2;
      gsap.to(btn,{x:x*.13,y:y*.13,duration:.35,ease:'power2.out'});
    });
    btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:.45,ease:'elastic.out(1,.45)'}));
  });

  heroStage?.addEventListener('mousemove',e=>{
    const r=heroStage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    gsap.to(heroBottle,{rotation:4+x*4,x:x*14,y:-8+y*10,duration:.5,ease:'power2.out'});
  });
  heroStage?.addEventListener('mouseleave',()=>gsap.to(heroBottle,{rotation:4,x:0,y:0,duration:.7,ease:'power3.out'}));
}

const filters=[...document.querySelectorAll('.filter')];
filters.forEach(btn=>btn.addEventListener('click',()=>{
  filters.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const filter=btn.dataset.filter;
  document.querySelectorAll('.project').forEach(card=>{
    const show=filter==='all'||card.dataset.cat===filter;
    card.hidden=!show;
  });
  if(window.ScrollTrigger) ScrollTrigger.refresh();
}));

const modal=document.getElementById('projectModal');
const modalArt=document.getElementById('modalArt');
const modalType=document.getElementById('modalType');
const modalTitle=document.getElementById('modalTitle');
const modalCopy=document.getElementById('modalCopy');

const artColors={
  brand:'linear-gradient(135deg,#da9abd,#f2c8a0)',
  wedding:'linear-gradient(135deg,#f5ebd9,#d8c29d)',
  event:'linear-gradient(135deg,#22483c,#10241e)',
  campaign:'linear-gradient(135deg,#63745d,#2e3c31)'
};
let lastFocused=null;
const modalBottleImg=document.getElementById('modalBottleImg');
const modalArtBottle=document.querySelector('.modal-art-bottle');

function openModal(button){
  const card=button.closest('.project');
  lastFocused=button;
  modalType.textContent=button.dataset.type;
  modalTitle.textContent=button.dataset.title;
  modalCopy.textContent=button.dataset.copy;
  modalArt.style.background=artColors[card?.dataset.cat]||artColors.brand;

  const imgSrc=button.dataset.img||button.querySelector('.real-bottle')?.getAttribute('src');
  if(imgSrc){
    modalBottleImg.src=imgSrc;
    modalBottleImg.alt=button.dataset.title;
    modalBottleImg.style.display='block';
    if(modalArtBottle) modalArtBottle.style.display='none';
  } else {
    modalBottleImg.style.display='none';
    if(modalArtBottle) modalArtBottle.style.display='';
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('locked');
  modal.querySelector('.modal-close')?.focus();
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('locked');
  lastFocused?.focus();
}
document.querySelectorAll('.project-button').forEach(btn=>btn.addEventListener('click',()=>openModal(btn)));
document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});

document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const id=link.getAttribute('href');
    const target=id&&document.querySelector(id);
    if(!target)return;
    e.preventDefault();
    target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
  });
});

// AI FEATURE HIDDEN (client request — no API key) — DO NOT REMOVE
/* ── AI bottle visualiser ────────────────────────────────────────── */
if (false) { // BEGIN AI FEATURE HIDDEN
(function(){
  const form = document.getElementById('visualiserForm');
  if(!form) return;

  const fileInput = document.getElementById('brandAsset');
  const dropzone = document.getElementById('assetDropzone');
  const assetLabel = document.getElementById('assetLabel');
  const previewLogo = document.getElementById('previewLogo');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const prompt = document.getElementById('visualiserPrompt');
  const promptCount = document.getElementById('promptCount');
  const status = document.getElementById('visualiserStatus');
  const submit = document.getElementById('generatePreview');
  const generatedImage = document.getElementById('generatedPreviewImage');
  const previewCaption = document.getElementById('previewCaption');
  const sampleSelect = document.getElementById('sampleSelect');
  const ratioSelect = document.getElementById('ratioSelect');
  const maxBytes = 5 * 1024 * 1024;
  let selectedFile = null;
  let selectedSamples = Number(sampleSelect?.value || 1);
  let selectedRatio = ratioSelect?.value || '2:3';

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('error', isError);
  };
  const setFile = file => {
    if(!file) return;
    if(!['image/png','image/jpeg'].includes(file.type)) {
      setStatus('Please upload a PNG or JPG image.', true);
      return;
    }
    if(file.size > maxBytes) {
      setStatus('That image is larger than 5 MB. Please choose a smaller file.', true);
      return;
    }
    selectedFile = file;
    assetLabel.textContent = file.name;
    generatedImage.hidden = true;
    previewContainer?.classList.remove('has-generated');
    previewContainer?.classList.remove('is-generating');
    const reader = new FileReader();
    reader.onload = () => {
      previewLogo.src = reader.result;
      previewLogo.hidden = false;
      previewPlaceholder.hidden = true;
      previewCaption.textContent = 'Your label is shown on the bottle';
      setStatus('Logo loaded. Add creative direction, then generate your concept.');
    };
    reader.readAsDataURL(file);
  };
  fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  ['dragenter','dragover'].forEach(eventName => dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  }));
  ['dragleave','drop'].forEach(eventName => dropzone.addEventListener(eventName, event => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  }));
  dropzone.addEventListener('drop', event => setFile(event.dataTransfer.files[0]));

  sampleSelect?.addEventListener('change', () => {
    selectedSamples = Number(sampleSelect.value);
  });

  ratioSelect?.addEventListener('change', () => {
    selectedRatio = ratioSelect.value;
  });

  /* Bespoke custom dropdown controls */
  document.querySelectorAll('.custom-select-wrap').forEach(wrap => {
    const select = wrap.querySelector('select');
    const trigger = wrap.querySelector('.custom-select-trigger');
    const menu = wrap.querySelector('.custom-select-menu');
    const label = wrap.querySelector('.trigger-label');
    const triggerIcon = wrap.querySelector('.trigger-icon');
    const options = wrap.querySelectorAll('.custom-select-option');
    if(!select || !trigger || !menu) return;

    const closeAll = () => {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
        w.classList.remove('is-open');
        w.querySelector('.custom-select-menu')?.setAttribute('hidden', '');
        w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
    };

    const toggle = (force) => {
      const willOpen = force !== undefined ? force : menu.hidden;
      if(willOpen) {
        closeAll();
        menu.removeAttribute('hidden');
        wrap.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      } else {
        menu.setAttribute('hidden', '');
        wrap.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-value');
        if(!val) return;

        options.forEach(o => {
          const isSelected = o === opt;
          o.classList.toggle('selected', isSelected);
          o.setAttribute('aria-selected', String(isSelected));
        });

        const strongText = opt.querySelector('strong')?.textContent || opt.textContent.trim();
        if(label) {
          if(wrap.id === 'ratioSelectWrap') {
            label.textContent = `${strongText} (${val})`;
          } else {
            label.textContent = strongText;
          }
        }

        if(triggerIcon) {
          if(wrap.id === 'ratioSelectWrap') {
            triggerIcon.className = `trigger-icon ratio-preview-icon ${val === '3:2' ? 'ratio-landscape' : 'ratio-portrait'}`;
          } else if(wrap.id === 'sampleSelectWrap') {
            triggerIcon.innerHTML = `<span class="pill-icon">${val}</span>`;
          }
        }

        select.value = val;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        toggle(false);
        trigger.focus();
      });
    });

    trigger.addEventListener('keydown', (e) => {
      if(['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        toggle(true);
      } else if(e.key === 'Escape') {
        toggle(false);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if(!e.target.closest('.custom-select-wrap')) {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
        w.classList.remove('is-open');
        w.querySelector('.custom-select-menu')?.setAttribute('hidden', '');
        w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
      document.querySelectorAll('.custom-select-wrap.is-open').forEach(w => {
        w.classList.remove('is-open');
        w.querySelector('.custom-select-menu')?.setAttribute('hidden', '');
        w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
  prompt.addEventListener('input', () => { promptCount.textContent = prompt.value.length; });

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const outputImage = response => {
    if(!response) return null;
    if(response.output_image?.data) return response.output_image;
    if(response.outputImage?.data) return response.outputImage;
    if(response.image?.data) return response.image;
    if(typeof response.output_image === 'string') return { data: response.output_image, mime_type: 'image/jpeg' };
    if(typeof response.outputImage === 'string') return { data: response.outputImage, mime_type: 'image/jpeg' };

    if(Array.isArray(response.outputs)) {
      const imgOut = response.outputs.find(o => o.type === 'image' || o.data || o.image);
      if(imgOut) {
        return {
          data: imgOut.data || imgOut.image?.data || (typeof imgOut === 'string' ? imgOut : null),
          mime_type: imgOut.mime_type || imgOut.mimeType || 'image/jpeg'
        };
      }
    }

    if(Array.isArray(response.steps)) {
      for(const step of response.steps) {
        if(Array.isArray(step.outputs)) {
          const imgOut = step.outputs.find(o => o.type === 'image' || o.data || o.image);
          if(imgOut) {
            return {
              data: imgOut.data || imgOut.image?.data,
              mime_type: imgOut.mime_type || imgOut.mimeType || 'image/jpeg'
            };
          }
        }
      }
    }

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
    if(part) {
      const inline = part.inlineData || part.inline_data;
      return { data: inline.data, mime_type: inline.mimeType || inline.mime_type || 'image/jpeg' };
    }

    if(response.predictions?.[0]?.bytesBase64Encoded) {
      return { data: response.predictions[0].bytesBase64Encoded, mime_type: 'image/jpeg' };
    }

    return null;
  };

  /* ── ChatGPT-Style Dot Matrix Wave Loading Animation (High Performance) ─── */
  const matrixOverlay = document.getElementById('previewMatrixOverlay');
  const matrixCanvas = document.getElementById('matrixWaveCanvas');
  const previewContainer = document.getElementById('visualiserPreview');
  let waveAnimFrameId = null;
  let waveStartTime = null;

  // Pre-allocated arrays and constants for 0-GC 60/120fps rendering on mobile
  const NUM_BINS = 16;
  const TWO_PI = Math.PI * 2;
  const bucketCounts = new Int32Array(NUM_BINS);
  let bucketX = Array.from({ length: NUM_BINS }, () => new Float32Array(500));
  let bucketY = Array.from({ length: NUM_BINS }, () => new Float32Array(500));
  const bucketRadii = new Float32Array(NUM_BINS);
  const bucketColors = new Array(NUM_BINS);

  let gridPoints = [];
  let currentDpr = 1;
  let wavelength = 260;

  function initWaveBuckets(dpr) {
    currentDpr = dpr;
    const minRadius = 1.15 * dpr;
    const maxRadius = 4.3 * dpr;
    wavelength = 260 * dpr;

    for (let b = 0; b < NUM_BINS; b++) {
      const t = b / (NUM_BINS - 1);
      bucketRadii[b] = minRadius + (maxRadius - minRadius) * t;
      const alpha = (0.12 + 0.76 * t).toFixed(3);
      bucketColors[b] = `rgba(230, 238, 248, ${alpha})`;
    }
  }

  function computeGridPoints(w, h, dpr) {
    const spacing = 22 * dpr;
    const cols = Math.ceil(w / spacing);
    const rows = Math.ceil(h / spacing);
    const offsetX = (w - (cols - 1) * spacing) / 2;
    const offsetY = (h - (rows - 1) * spacing) / 2;
    const totalPoints = cols * rows;

    if (bucketX[0].length < totalPoints) {
      const cap = Math.max(totalPoints + 100, 1000);
      bucketX = Array.from({ length: NUM_BINS }, () => new Float32Array(cap));
      bucketY = Array.from({ length: NUM_BINS }, () => new Float32Array(cap));
    }

    gridPoints = new Array(totalPoints);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      const y = offsetY + r * spacing;
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * spacing;
        gridPoints[idx++] = {
          x,
          y,
          proj: (x + y) * 0.7071
        };
      }
    }
  }

  function resizeWaveCanvas() {
    if (!matrixCanvas || !matrixOverlay) return;
    const rect = matrixOverlay.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));

    if (matrixCanvas.width !== w || matrixCanvas.height !== h || currentDpr !== dpr) {
      matrixCanvas.width = w;
      matrixCanvas.height = h;
      initWaveBuckets(dpr);
      computeGridPoints(w, h, dpr);
    }
  }

  function renderWaveFrame(now) {
    if (!matrixCanvas) return;
    const ctx = matrixCanvas.getContext('2d');
    if (!ctx) return;

    if (!waveStartTime) waveStartTime = now;
    const elapsed = (now - waveStartTime) / 1000;

    const w = matrixCanvas.width;
    const h = matrixCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const pointsLen = gridPoints.length;
    if (pointsLen === 0) return;

    const invWavelength = 1 / wavelength;
    const timeTerm = elapsed * 0.42;
    const binMax = NUM_BINS - 1;

    bucketCounts.fill(0);

    for (let i = 0; i < pointsLen; i++) {
      const p = gridPoints[i];
      const phase = p.proj * invWavelength - timeTerm;
      const sinVal = Math.sin(phase * TWO_PI);
      const norm = (sinVal + 1) * 0.5;
      const intensity = Math.pow(norm, 3.4);
      const bin = (intensity * binMax + 0.5) | 0;

      const idx = bucketCounts[bin]++;
      bucketX[bin][idx] = p.x;
      bucketY[bin][idx] = p.y;
    }

    for (let b = 0; b < NUM_BINS; b++) {
      const count = bucketCounts[b];
      if (count === 0) continue;

      const r = bucketRadii[b];
      const xs = bucketX[b];
      const ys = bucketY[b];

      ctx.beginPath();
      for (let j = 0; j < count; j++) {
        const px = xs[j];
        const py = ys[j];
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, TWO_PI);
      }
      ctx.fillStyle = bucketColors[b];
      ctx.fill();
    }

    if (!reduceMotion) {
      waveAnimFrameId = requestAnimationFrame(renderWaveFrame);
    }
  }

  function startWaveAnimation() {
    if (waveAnimFrameId) cancelAnimationFrame(waveAnimFrameId);
    waveStartTime = null;
    resizeWaveCanvas();
    waveAnimFrameId = requestAnimationFrame(renderWaveFrame);
    window.addEventListener('resize', resizeWaveCanvas);
  }

  function stopWaveAnimation() {
    if (waveAnimFrameId) {
      cancelAnimationFrame(waveAnimFrameId);
      waveAnimFrameId = null;
    }
    window.removeEventListener('resize', resizeWaveCanvas);
    if (matrixCanvas) {
      const ctx = matrixCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  }

  function startMatrixAnimation() {
    if (generatedImage) generatedImage.hidden = true;
    previewContainer?.classList.remove('has-generated');
    previewContainer?.classList.add('is-generating');
    if (matrixOverlay) {
      matrixOverlay.hidden = false;
      matrixOverlay.removeAttribute('hidden');
    }
    startWaveAnimation();
    if (previewCaption) {
      previewCaption.dataset.prevText = previewCaption.textContent;
      previewCaption.textContent = 'Synthesizing bottle wrap concept…';
    }
  }

  function stopMatrixAnimation(success = false) {
    stopWaveAnimation();
    if (matrixOverlay) {
      matrixOverlay.hidden = true;
      matrixOverlay.setAttribute('hidden', '');
    }
    previewContainer?.classList.remove('is-generating');
    if (success) {
      previewContainer?.classList.add('has-generated');
    } else {
      previewContainer?.classList.remove('has-generated');
      if (previewCaption && previewCaption.dataset.prevText) {
        previewCaption.textContent = previewCaption.dataset.prevText;
        delete previewCaption.dataset.prevText;
      }
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!selectedFile) {
      setStatus('Upload your logo or label before generating a preview.', true);
      fileInput.focus();
      return;
    }

    submit.disabled = true;
    setStatus('Generating AI bottle concept with Gemini…');
    startMatrixAnimation();

    let success = false;
    try {
      const imageData = await toBase64(selectedFile);
      const direction = prompt.value.trim() || 'clean, premium, modern and print-ready';
      const samplesCount = Number(selectedSamples) || 1;

      const requestPayload = {
        model: 'google/gemini-3.1-flash-lite-image',
        samples: samplesCount,
        direction,
        aspect_ratio: selectedRatio,
        input: [
          { type: 'text', text: direction },
          { type: 'image', mime_type: selectedFile.type, data: imageData }
        ]
      };

      const response = await fetch('/.netlify/functions/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await response.text().catch(() => '');
        if (response.status === 504 || rawText.includes('504')) {
          throw new Error('AI image generation timed out. Please try again in a few moments.');
        }
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data?.error?.message || 'Could not generate this preview.');
      }

      const image = outputImage(data);
      if (!image?.data) {
        throw new Error('Gemini returned no preview image.');
      }

      generatedImage.src = `data:${image.mime_type || 'image/png'};base64,${image.data}`;
      generatedImage.hidden = false;
      previewCaption.textContent = `${samplesCount} bottle${samplesCount === 1 ? '' : 's'} · AI concept preview`;
      setStatus('Your AI bottle concept is ready.');
      success = true;
    } catch(error) {
      console.error('AI bottle preview failed:', error);
      setStatus(error.message || 'We could not generate a preview. Please try again.', true);
    } finally {
      stopMatrixAnimation(success);
      submit.disabled = false;
    }
  });
})();
} // END AI FEATURE HIDDEN

const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  const dateInput = quoteForm.querySelector('#date');
  if (dateInput) {
    const todayObj = new Date();
    const yyyy = todayObj.getFullYear();
    const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
    const dd = String(todayObj.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.max = `${yyyy + 2}-12-31`;
  }

  quoteForm.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const status = document.getElementById('formStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const type = String(formData.get('type') || '').trim();
    const qty = String(formData.get('qty') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const showError = (msg, inputName) => {
      if (status) {
        status.textContent = msg;
        status.style.color = '#c0392b';
      }
      if (inputName) {
        form.querySelector(`[name="${inputName}"]`)?.focus();
      }
    };

    if (!name) {
      showError('Please enter your name.', 'name');
      return;
    }
    if (!phone) {
      showError('Please enter your WhatsApp / phone number.', 'phone');
      return;
    }
    if (!email) {
      showError('Please enter your email address.', 'email');
      return;
    }
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address.', 'email');
      return;
    }
    if (!type) {
      showError('Please select a project type.', 'type');
      return;
    }
    if (!qty) {
      showError('Please enter the required quantity.', 'qty');
      return;
    }

    if (!date) {
      showError('Please select a required-by date.', 'date');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const selectedDate = new Date(year, month, day);

    if (isNaN(selectedDate.getTime()) || parts.length !== 3 || year < 1000) {
      showError('Please enter a valid date.', 'date');
      return;
    }

    if (selectedDate < today) {
      showError('Required-by date cannot be in the past.', 'date');
      return;
    }

    const currentYear = today.getFullYear();
    if (year > currentYear + 2) {
      showError(`Please select a realistic date (up to ${currentYear + 2}).`, 'date');
      return;
    }

    if (!message) {
      showError('Please enter a description for your project.', 'message');
      return;
    }

    if (status) {
      status.textContent = '';
      status.style.color = '';
    }

    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending enquiry...';
    }

    try {
      if (!formData.has('form-name')) {
        formData.append('form-name', 'project-enquiry');
      }

      const response = await fetch('/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData).toString()
      });

      if (!response.ok) {
        throw new Error(`Submission failed (HTTP ${response.status}). Please check if the form is registered in Netlify.`);
      }

      if (status) {
        status.textContent = "Enquiry sent successfully. We'll get back to you shortly.";
        status.style.color = '#1b6e3f';
      }
      form.reset();
    } catch (err) {
      console.error('Form submission error:', err);
      if (status) {
        status.textContent = 'Something went wrong. Please try again.';
        status.style.color = '#c0392b';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    }
  });

  quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => {
      const status = document.getElementById('formStatus');
      if (status && status.textContent && status.style.color === 'rgb(192, 57, 43)') {
        status.textContent = '';
        status.style.color = '';
      }
    });
  });
}

/* ── Process rows — scroll-triggered active state (bidirectional) ──── */
(function(){
  const rows = [...document.querySelectorAll('[data-proc]')];
  if(!rows.length) return;

  if(reduceMotion){
    rows.forEach(r => r.classList.add('in-view'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -30px 0px' });

  rows.forEach(r => obs.observe(r));
})();
