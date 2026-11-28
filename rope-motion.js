// A single moving centreline: feed the cord, form a loop, pass the end through,
// then pull it taut. Every visible strand follows that same geometry.
export const ropeDuration = 3800;

const tight = [
  [40,605],[250,555],[470,360],[690,240],[910,290],[1110,360],
  [1250,340],[1370,205],[1470,170],[1560,225],[1575,340],
  [1510,440],[1380,470],[1260,425],[1220,330],[1240,245],
  [1320,225],[1430,260],[1560,300],[1740,240],[1950,100],[2130,85],
];
const open = tight.map((_, i) => {
  const t = i / (tight.length - 1);
  return [40 + 2090 * t, 605 - 520 * t - 110 * Math.sin(Math.PI * 2 * t)];
});
const loose = [
  [40,605],[250,555],[470,360],[690,240],[910,290],[1080,345],
  [1220,250],[1370,100],[1580,90],[1720,270],[1630,540],
  [1400,590],[1140,500],[1090,290],[1220,135],[1430,155],
  [1580,285],[1680,430],[1790,410],[1910,300],[2040,190],[2130,85],
];
const threaded = loose.map(p => [...p]);
threaded.splice(17, 5, [1540,280],[1630,310],[1580,400],[1440,410],[1330,335]);
const smooth = t => t * t * (3 - 2 * t);
const lerp = (a,b,t) => a + (b-a) * t;
const mix = (a,b,t) => a.map((p,i) => [lerp(p[0],b[i][0],t),lerp(p[1],b[i][1],t)]);
const number = n => n.toFixed(2);
const path = points => points.map((p,i) => `${i ? 'L' : 'M'}${number(p[0])} ${number(p[1])}`).join(' ');

function sample(points) {
  const result = [];
  for (let i=0; i<points.length-1; i++) {
    const a=points[Math.max(0,i-1)], b=points[i], c=points[i+1], d=points[Math.min(points.length-1,i+2)];
    for (let j=0;j<12;j++) {
      const t=j/12, t2=t*t, t3=t2*t;
      result.push([0,1].map(k => .5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3)));
    }
  }
  result.push(points.at(-1));
  return result;
}

function arc(points) {
  const lengths=[0];
  for (let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
  const total=lengths.at(-1);
  const at = s => {
    s=Math.max(0,Math.min(total,s));
    let lo=0, hi=lengths.length-1;
    while (hi-lo>1) { const m=(lo+hi)>>1; if (lengths[m]<s) lo=m; else hi=m; }
    const t=(s-lengths[lo])/(lengths[hi]-lengths[lo] || 1);
    const dx=points[hi][0]-points[lo][0], dy=points[hi][1]-points[lo][1], length=Math.hypot(dx,dy)||1;
    return {x:lerp(points[lo][0],points[hi][0],t),y:lerp(points[lo][1],points[hi][1],t),nx:-dy/length,ny:dx/length};
  };
  return {lengths,total,at};
}

function braid(at,from,to) {
  let dark='', light='';
  const stroke = s => {
    const a=at(s-8),b=at(s),c=at(s+8),r=19;
    return `M${number(a.x-a.nx*r)} ${number(a.y-a.ny*r)} Q${number(b.x+5*b.nx)} ${number(b.y+5*b.ny)} ${number(c.x+c.nx*r)} ${number(c.y+c.ny*r)} `;
  };
  for (let s=Math.ceil((from+10)/18)*18;s<to-10;s+=18) { dark+=stroke(s); light+=stroke(s+3); }
  return {dark,light};
}

function crossings(points,lengths) {
  const result=[];
  for (let i=0;i<points.length-1;i++) for (let j=i+9;j<points.length-1;j++) {
    if (lengths[j]-lengths[i]<120) continue;
    const a=points[i],b=points[i+1],c=points[j],d=points[j+1];
    const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-c[0],vy=d[1]-c[1];
    const cross=ux*vy-uy*vx;
    if (Math.abs(cross)<.001) continue;
    const dx=c[0]-a[0],dy=c[1]-a[1];
    const t=(dx*vy-dy*vx)/cross,u=(dx*uy-dy*ux)/cross;
    if (t<=0||t>=1||u<=0||u>=1) continue;
    const early=lerp(lengths[i],lengths[i+1],t),late=lerp(lengths[j],lengths[j+1],u);
    if (!result.some(p=>Math.abs(p.late-late)<70)) result.push({early,late});
  }
  return result;
}

export function ropeGeometry(progress) {
  const p=Math.max(0,Math.min(1,progress));
  let controls,phase;
  if (p<.18) { controls=open; phase='feed'; }
  else if (p<.48) { controls=mix(open,loose,smooth((p-.18)/.30)); phase='loop'; }
  else if (p<.74) { controls=mix(loose,threaded,smooth((p-.48)/.26)); phase='thread'; }
  else { controls=mix(threaded,tight,smooth((p-.74)/.26)); phase=p===1?'complete':'tighten'; }
  const points=sample(controls), {lengths,total,at}=arc(points);
  const visible=total*smooth(Math.min(1,p/.18));
  const shown=points.filter((_,i)=>lengths[i]<visible);
  const end=at(visible); shown.push([end.x,end.y]);
  const ribs=braid(at,0,visible);
  const passes=crossings(points,lengths).map((c,i)=>{
    // Alternating over/under passes keep the cord readable at the crossings.
    const centre=i%2?c.late:c.early;
    if (visible<c.late+35) return null;
    const from=Math.max(0,centre-43),to=Math.min(total,centre+43),segment=[];
    for(let s=from;s<=to;s+=4) { const a=at(s); segment.push([a.x,a.y]); }
    return {body:path(segment),...braid(at,from,to)};
  }).filter(Boolean);
  return {body:shown.length>1?path(shown):'',...ribs,passes,phase,points,visibleLength:visible};
}

export function createRopeMotion(svg) {
  const strand=svg.querySelector('[data-rope-strand]');
  const overpasses=svg.querySelector('[data-rope-overpasses]');
  let frameId=0;
  const paint = progress => {
    const geometry=ropeGeometry(progress);
    strand.querySelectorAll('[data-rope-body]').forEach(el=>el.setAttribute('d',geometry.body));
    strand.querySelector('[data-rope-dark]').setAttribute('d',geometry.dark);
    strand.querySelector('[data-rope-light]').setAttribute('d',geometry.light);
    while (overpasses.children.length<geometry.passes.length) {
      const layer=strand.cloneNode(true);
      layer.removeAttribute('data-rope-strand');
      overpasses.append(layer);
    }
    [...overpasses.children].forEach((layer,i)=>{
      const pass=geometry.passes[i];
      layer.setAttribute('display',pass?'inline':'none');
      if (!pass) return;
      layer.querySelectorAll('[data-rope-body]').forEach(el=>el.setAttribute('d',pass.body));
      layer.querySelector('[data-rope-dark]').setAttribute('d',pass.dark);
      layer.querySelector('[data-rope-light]').setAttribute('d',pass.light);
    });
    svg.dataset.ropePhase=geometry.phase;
  };
  const finish = () => { cancelAnimationFrame(frameId); frameId=0; paint(1); };
  finish();
  return {
    finish,
    play() {
      cancelAnimationFrame(frameId);
      const start=performance.now();
      paint(0);
      const tick=now=>{
        const progress=Math.min(1,(now-start)/ropeDuration);
        paint(progress);
        frameId=progress<1?requestAnimationFrame(tick):0;
      };
      frameId=requestAnimationFrame(tick);
    },
  };
}
