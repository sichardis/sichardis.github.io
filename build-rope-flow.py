"""Generate reveal timing data for the unchanged original rope photo.

Requires NumPy and Pillow. This writes only identity-rope-flow.png;
identity-rope.png is read for its alpha channel and is never modified.
RGB in the generated map stores timing and crossing ownership, not artwork.
"""
from pathlib import Path
import math,re,numpy as np
from PIL import Image
root=Path(__file__).resolve().parent
paths=[
'M40 625 C290 615 373 545 450 465 C530 374 550 323 635 291 C735 234 830 240 900 272 C1000 309 1100 360 1195 350',
'M1195 350 C1240 354 1260 352 1290 331 C1340 298 1380 248 1425 217 C1440 205 1453 196 1465 190',
'M1465 190 C1480 179 1500 178 1515 187 C1570 195 1607 277 1573 345 C1540 400 1465 458 1397 448 C1297 441 1238 400 1242 330 C1240 270 1230 238 1272 228',
'M1272 228 C1290 220 1315 228 1335 241 C1410 279 1500 311 1594 305 C1710 289 1770 217 1860 161 C1955 101 2020 88 2130 95']
w,h=2172,724;fields=[];times=[]
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
 # Time at which a circular leading end reaches each original photographic pixel.
 arc-=np.sqrt(np.maximum(0,46**2-field));t=delay+np.clip(arc/cum[-1],0,1)*duration
 fields.append(field);times.append(t/4.2)
labels=np.argmin(fields,axis=0)
for i in [1,2,3]:labels[fields[i]<36**2]=i
main=np.take_along_axis(np.stack(times),labels[None,:,:],axis=0)[0]
main=np.clip(main,.001,.99);under=np.ones((h,w),np.float32);bridge=np.zeros((h,w),np.uint8)
alpha=np.asarray(Image.open(root/'assets/identity-rope.png'))[:,:,3]
for route,owner,number in [(1,2,1),(1,3,2),(2,3,3)]:
 use=(labels==owner)&(fields[route]<38**2)&(times[route]<main-.005)&(alpha>240)
 under[use]=times[route][use];bridge[use]=number
primary=np.round(main*4095).astype(np.uint16);secondary=np.round(np.clip(under,0,1)*1023).astype(np.uint16)
encoded=np.zeros((h,w,3),np.uint8);encoded[:,:,0]=primary>>4;encoded[:,:,1]=((primary&15)<<4)|((secondary>>8)<<2)|bridge;encoded[:,:,2]=secondary&255
Image.fromarray(encoded).save(root/'assets/identity-rope-flow.png',optimize=True)
print({'map_bytes':(root/'assets/identity-rope-flow.png').stat().st_size,'underpass_pixels':int(np.count_nonzero(bridge)),'latest_pixel':float(main[alpha>0].max())})
