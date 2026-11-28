"""Generate reveal timing data for the unchanged original rope photo.

Requires NumPy and Pillow. This writes timing, source-coordinate, and edge
coverage maps only. The original identity-rope.png is never modified; its
photographic pixels are sampled directly by the browser.
"""
from pathlib import Path
import math,re,numpy as np
from PIL import Image
root=Path(__file__).resolve().parent
paths=[
'M40 625 C290 615 373 545 450 465 C530 374 550 323 635 291 C735 234 830 240 900 272 C1000 309 1100 360 1195 350',
'M1195 350 C1240 354 1260 352 1290 331 C1340 298 1380 248 1425 217 C1440 205 1453 196 1465 190',
'M1465 190 C1480 179 1500 178 1515 187 C1570 195 1595 277 1562 345 C1530 400 1465 458 1397 448 C1297 441 1238 400 1242 330 C1240 270 1230 238 1272 228',
'M1272 228 C1290 220 1315 228 1335 241 C1410 279 1500 311 1594 305 C1710 289 1770 217 1860 161 C1955 101 2020 88 2130 95']
w,h=2172,724;fields=[];times=[];curves=[];raw_arcs=[]
for d,delay,duration in zip(paths,[0,1.55,2.05,3.15],[1.55,.5,1.1,1.05]):
 n=list(map(float,re.findall(r'-?\d+(?:\.\d+)?',d)));p=n[:2];pts=[p]
 for k in range(2,len(n),6):
  a,b,c=n[k:k+2],n[k+2:k+4],n[k+4:k+6]
  for j in range(1,241):
   t=j/240;u=1-t;pts.append([u**3*p[q]+3*u*u*t*a[q]+3*u*t*t*b[q]+t**3*c[q] for q in (0,1)])
  p=c
 cum=[0]
 for a,b in zip(pts,pts[1:]):cum.append(cum[-1]+math.dist(a,b))
 field=np.full((h,w),1e9,dtype=np.float32);arc=np.zeros((h,w),np.float32)
 for (x,y),s in zip(pts,cum):
  xa,xb=max(0,int(x)-150),min(w,int(x)+151);ya,yb=max(0,int(y)-150),min(h,int(y)+151)
  dist=(np.arange(xa,xb,dtype=np.float32)[None,:]-x)**2+(np.arange(ya,yb,dtype=np.float32)[:,None]-y)**2
  better=dist<field[ya:yb,xa:xb];arc[ya:yb,xa:xb][better]=s;field[ya:yb,xa:xb][better]=dist[better]
 curves.append((np.asarray(pts),np.asarray(cum)))
 raw_arcs.append(arc.copy())
 # Time at which a circular leading end reaches each original photographic pixel.
 arc-=np.sqrt(np.maximum(0,35**2-field));t=delay+np.clip(arc/cum[-1],0,1)*duration
 fields.append(field);times.append(t/4.2)
labels=np.argmin(fields,axis=0)
for i,radius in [(1,41),(2,44),(3,54)]:labels[fields[i]<radius**2]=i
main=np.take_along_axis(np.stack(times),labels[None,:,:],axis=0)[0]
main=np.clip(main,.001,.99);under=np.ones((h,w),np.float32);bridge=np.zeros((h,w),np.uint8)
alpha=np.asarray(Image.open(root/'assets/identity-rope.png'))[:,:,3]
for route,owner,number in [(1,2,1),(1,3,2),(2,3,3)]:
 use=(labels==owner)&(fields[route]<42**2)&(times[route]<main-.005)&(alpha>8)
 under[use]=times[route][use];bridge[use]=number
primary=np.round(main*4095).astype(np.uint16);secondary=np.round(np.clip(under,0,1)*1023).astype(np.uint16)
encoded=np.zeros((h,w,3),np.uint8);encoded[:,:,0]=primary>>4;encoded[:,:,1]=((primary&15)<<4)|((secondary>>8)<<2)|bridge;encoded[:,:,2]=secondary&255
Image.fromarray(encoded).save(root/'assets/identity-rope-flow.png',optimize=True)
# Coordinate map only: the browser samples the original photograph at these UVs.
# No replacement rope texture or recolored photographic asset is generated.
def point_at(route, arc):
 pts,cum=curves[route];arc=np.clip(arc,0,cum[-1])
 x=np.interp(arc,cum,pts[:,0]);y=np.interp(arc,cum,pts[:,1])
 before=np.maximum(0,arc-.5);after=np.minimum(cum[-1],arc+.5)
 dx=np.interp(after,cum,pts[:,0])-np.interp(before,cum,pts[:,0]);dy=np.interp(after,cum,pts[:,1])-np.interp(before,cum,pts[:,1]);length=np.hypot(dx,dy)
 return x,y,-dy/length,dx/length
uv=np.zeros((h,w,3),np.uint8);coverage=np.zeros((h,w,3),np.uint8)
for route,source_route,number,shift in [(1,0,1,1180),(1,1,2,-100),(2,2,3,90)]:
 yy,xx=np.where(bridge==number);dest_arc=raw_arcs[route][yy,xx]
 dx,dy,dnx,dny=point_at(route,dest_arc);normal=(xx-dx)*dnx+(yy-dy)*dny
 fade=np.clip((34-np.abs(normal))/7,0,1);fade=fade*fade*(3-2*fade);coverage[yy,xx,0]=np.round(fade*255).astype(np.uint8)
 owner=2 if number==1 else 3;radius=44 if owner==2 else 54
 seam=np.clip((np.sqrt(fields[owner][yy,xx])-(radius-12))/12,0,1);seam=seam*seam*(3-2*seam)
 coverage[yy,xx,1]=np.round(seam*fade*255).astype(np.uint8)
 sx,sy,snx,sny=point_at(source_route,dest_arc+shift)
 # Center the source sample on its photographed fibers, then retain the full
 # source width at the destination's soft silhouette.
 offsets=np.arange(-44,45)[None,:];px=np.clip(np.round(sx[:,None]+snx[:,None]*offsets),0,w-1).astype(int);py=np.clip(np.round(sy[:,None]+sny[:,None]*offsets),0,h-1).astype(int)
 opaque=alpha[py,px]>240
 lo=np.min(np.where(opaque,offsets,99),axis=1);hi=np.max(np.where(opaque,offsets,-99),axis=1)
 valid=lo<=hi;lo=np.where(valid,lo,-28);hi=np.where(valid,hi,28)
 center=(lo+hi)/2;radius=np.maximum(1,(hi-lo)/2-1)
 sample=center+np.clip(normal/40,-1,1)*radius
 sx+=snx*sample;sy+=sny*sample
 ux=np.clip(np.round(sx*2),0,w*2-1).astype(np.uint32);uy=np.clip(np.round(sy*2),0,h*2-1).astype(np.uint32);packed=(ux<<11)|uy
 uv[yy,xx,0]=(packed>>16)&255;uv[yy,xx,1]=(packed>>8)&255;uv[yy,xx,2]=packed&255
Image.fromarray(uv).save(root/'assets/identity-rope-underpass-uv.png',optimize=True)
Image.fromarray(coverage).save(root/'assets/identity-rope-underpass-coverage.png',optimize=True)
print({'map_bytes':(root/'assets/identity-rope-flow.png').stat().st_size,'underpass_pixels':int(np.count_nonzero(bridge)),'latest_pixel':float(main[alpha>0].max())})
