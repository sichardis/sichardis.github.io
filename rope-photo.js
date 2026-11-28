// Original photographic pixels, revealed in path order. No final-image replacement.
const clamp01 = value => Math.max(0, Math.min(1, value));

export function revealPhotoPixels(photo, times, underTimes, bridgeIds, patches, progress, output, originalBlend = null) {
  for (let i = 0, p = 0; i < times.length; i++, p += 4) {
    const patch = patches[bridgeIds[i] - 1];
    const arrival = patch ? clamp01((progress - underTimes[i]) / .004) : 0;
    const main = Math.max(clamp01((progress - times[i]) / .004), arrival * (originalBlend?.[i] || 0));
    const under = arrival * (1 - main);
    const mainAlpha = photo[p + 3] * main;
    const underAlpha = patch ? Math.min(photo[p + 3], patch[p + 3]) * under : 0;
    const alpha = mainAlpha + underAlpha;
    for (let c = 0; c < 3; c++) {
      output[p + c] = underAlpha ? (photo[p + c] * mainAlpha + patch[p + c] * underAlpha) / alpha : photo[p + c];
    }
    output[p + 3] = alpha;
  }
}

export function createPhotoRope(canvas, photoUrl, timelineUrl, underpassUrl = './assets/identity-rope-underpass-uv.png?v=smooth-photo-joins-20261128') {
  const photo = new Image();
  const timeline = new Image();
  const uvImage = new Image();
  const coverageImage = new Image();
  photo.src = photoUrl;
  timeline.src = timelineUrl;
  uvImage.src = underpassUrl;
  coverageImage.src = './assets/identity-rope-underpass-coverage.png?v=smooth-photo-joins-20261128';
  let prepared;
  let progress = 1;
  let frame = 0;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Photographic rope canvas unavailable');
  function surface(width, height) {
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    return element;
  }
  function prepare() {
    const width = Math.min(2172, Math.max(600, Math.round((canvas.clientWidth || 1080) * Math.min(devicePixelRatio || 1, 2))));
    const height = Math.round(width / 3);
    canvas.width = width;
    canvas.height = height;
    const source = surface(width, height);
    const ctx = source.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(photo, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(timeline, 0, 0, width, height);
    const map = ctx.getImageData(0, 0, width, height).data;
    const times = new Float32Array(width * height);
    const underTimes = new Float32Array(width * height);
    const bridgeIds = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < times.length; i++, p += 4) {
      times[i] = ((map[p] << 4) | (map[p + 1] >> 4)) / 4095;
      underTimes[i] = (((map[p + 1] >> 2) & 3) * 256 + map[p + 2]) / 1023;
      bridgeIds[i] = map[p + 1] & 3;
    }
    // Warp only the small occluded pieces, sampling original photographic
    // fibers along the same curve instead of joining rigid rectangular crops.
    ctx.clearRect(0,0,width,height);
    ctx.drawImage(uvImage,0,0,width,height);
    const uv = ctx.getImageData(0,0,width,height).data;
    ctx.clearRect(0,0,width,height);
    ctx.drawImage(coverageImage,0,0,width,height);
    const coverage = ctx.getImageData(0,0,width,height).data;
    const originalSurface = surface(2172,724);
    const originalContext = originalSurface.getContext('2d',{willReadFrequently:true});
    originalContext.drawImage(photo,0,0);
    const original = originalContext.getImageData(0,0,2172,724).data;
    const patch = new Uint8ClampedArray(pixels.length);
    const originalBlend = new Float32Array(bridgeIds.length);
    for(let i=0,p=0;i<bridgeIds.length;i++,p+=4) {
      if(!bridgeIds[i]) continue;
      const packed=(uv[p]<<16)|(uv[p+1]<<8)|uv[p+2];
      const x=(packed>>11)/2, y=(packed&2047)/2;
      const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
      for(let c=0;c<4;c++) {
        const a=original[(y0*2172+x0)*4+c],b=original[(y0*2172+Math.min(2171,x0+1))*4+c];
        const d=original[(Math.min(723,y0+1)*2172+x0)*4+c],e=original[(Math.min(723,y0+1)*2172+Math.min(2171,x0+1))*4+c];
        patch[p+c]=(a*(1-fx)+b*fx)*(1-fy)+(d*(1-fx)+e*fx)*fy;
      }
      patch[p+3] *= coverage[p]/255;
      originalBlend[i] = coverage[p+1]/255;
    }
    const patches = [patch,patch,patch];
    prepared = {pixels, times, underTimes, bridgeIds, patches, originalBlend, output:context.createImageData(width, height)};
  }
  function render(value) {
    progress = clamp01(value);
    if (!prepared) return;
    const {pixels,times,underTimes,bridgeIds,patches,originalBlend,output} = prepared;
    revealPhotoPixels(pixels,times,underTimes,bridgeIds,patches,progress,output.data,originalBlend);
    context.putImageData(output, 0, 0);
    canvas.dataset.progress = progress.toFixed(4);
  }
  function cancel() { cancelAnimationFrame(frame); frame = 0; }
  function play(duration = 4200) {
    cancel();
    render(0);
    const start = performance.now();
    const tick = now => {
      render((now - start) / duration);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else frame = 0;
    };
    frame = requestAnimationFrame(tick);
  }
  const ready = Promise.all([photo.decode(), timeline.decode(), uvImage.decode(), coverageImage.decode()]).then(() => {
    prepare();
    render(1);
    canvas.hidden = false;
    canvas.parentElement.querySelector('[data-rope-fallback]')?.setAttribute('hidden','');
    new ResizeObserver(() => {
      if (!canvas.clientWidth) return;
      const width = Math.min(2172, Math.max(600, Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1,2))));
      if (width !== canvas.width) { prepare(); render(progress); }
    }).observe(canvas);
  });
  return {ready, render, play, cancel};
}
