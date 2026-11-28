import test from 'node:test';
import assert from 'node:assert/strict';
import { ropeGeometry } from '../rope-motion.js';

test('the cord feeds from its left end as one connected path', () => {
  let previous=0;
  for (const t of [0,.03,.06,.1,.15,.18]) {
    const frame=ropeGeometry(t);
    assert.ok(frame.visibleLength>=previous);
    assert.equal((frame.body.match(/M/g)||[]).length,t===0?0:1);
    assert.ok(frame.points.every((p,i,a)=>i===0||p[0]>a[i-1][0]));
    previous=frame.visibleLength;
  }
});

test('the same centreline bends continuously between loop, threading and tightening', () => {
  for (const boundary of [.18,.48,.74]) {
    const a=ropeGeometry(boundary-1e-7),b=ropeGeometry(boundary+1e-7);
    assert.equal(a.points.length,b.points.length);
    assert.ok(a.points.every((p,i)=>Math.hypot(p[0]-b.points[i][0],p[1]-b.points[i][1])<.01));
  }
  const threaded=ropeGeometry(.74),finished=ropeGeometry(1);
  assert.ok(threaded.points.at(-1)[0]<1500,'the free end passes inside the loop');
  assert.equal(finished.points.at(-1)[0],2130,'the free end is pulled out to the right');
  assert.ok(finished.passes.length>0,'the completed knot has explicit over/under crossings');
});

test('all animation frames stay finite and inside the illustration with room for the cord width', () => {
  for (let i=0;i<=120;i++) {
    const frame=ropeGeometry(i/120);
    assert.ok(!/NaN|Infinity/.test(frame.body+frame.dark+frame.light));
    assert.ok(frame.points.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>24&&x<2148&&y>24&&y<700));
    assert.ok(frame.passes.every(pass=>pass.body.startsWith('M')));
  }
  assert.equal(ropeGeometry(1).body,ropeGeometry(2).body);
});
