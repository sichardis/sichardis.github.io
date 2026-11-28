// Original photographic pixels, revealed in path order. No final-image replacement.
const clamp01 = value => Math.max(0, Math.min(1, value));

export function revealPhotoPixels(photo, times, underTimes, bridgeIds, patches, progress, output) {
  for (let i = 0, p = 0; i < times.length; i++, p += 4) {
    const main = clamp01((progress - times[i]) / .0025);
    const patch = patches[bridgeIds[i] - 1];
    const under = patch ? clamp01((progress - underTimes[i]) / .0025) * (1 - main) : 0;
    const mainAlpha = photo[p + 3] * main;
    const underAlpha = patch ? patch[p + 3] * under : 0;
    const alpha = mainAlpha + underAlpha;
    for (let c = 0; c < 3; c++) {
      output[p + c] = underAlpha ? (photo[p + c] * mainAlpha + patch[p + c] * underAlpha) / alpha : photo[p + c];
    }
    output[p + 3] = alpha;
  }
}

export function createPhotoRope(canvas, photoUrl, timelineUrl) {
  const photo = new Image();
  const timeline = new Image();
  photo.src = photoUrl;
  timeline.src = timelineUrl;
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
    const patches = [[1245,350,-16],[1385,255,-62],[1590,305,70]].map(([x,y,angle]) => {
      const layer = surface(width, height);
      const layerContext = layer.getContext('2d', {willReadFrequently:true});
      layerContext.scale(width / 2172, height / 724);
      layerContext.translate(x, y);
      layerContext.rotate(angle * Math.PI / 180);
      layerContext.translate(-1050, -328);
      layerContext.drawImage(photo, 935, 275, 245, 115, 935, 275, 245, 115);
      return layerContext.getImageData(0, 0, width, height).data;
    });
    prepared = {pixels, times, underTimes, bridgeIds, patches, output:context.createImageData(width, height)};
  }
  function render(value) {
    progress = clamp01(value);
    if (!prepared) return;
    const {pixels,times,underTimes,bridgeIds,patches,output} = prepared;
    revealPhotoPixels(pixels,times,underTimes,bridgeIds,patches,progress,output.data);
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
  const ready = Promise.all([photo.decode(), timeline.decode()]).then(() => {
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
