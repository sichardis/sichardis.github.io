import test from 'node:test';
import assert from 'node:assert/strict';
import {revealPhotoPixels} from '../rope-photo.js';

const source = new Uint8ClampedArray([241,123,27,255, 198,88,9,180, 255,171,71,70]);
const times = new Float32Array([.1,.6,.99]);
const underTimes = new Float32Array([.05,.2,.3]);

test('photographic colors remain unchanged as unrevealed pixels become visible in path order', () => {
  const output = new Uint8ClampedArray(source.length);
  const ids = new Uint8Array(3);
  for (const progress of [0,.2,.5,.8,1]) {
    revealPhotoPixels(source,times,underTimes,ids,[],progress,output);
    for (let i=0;i<3;i++) {
      assert.deepEqual(output.slice(i*4,i*4+3),source.slice(i*4,i*4+3));
      if (progress < times[i]) assert.equal(output[i*4+3],0);
      if (progress > times[i]+.003) assert.equal(output[i*4+3],source[i*4+3]);
    }
  }
});

test('the last drawn frame already equals the original, including transparency, before completion', () => {
  const ids = new Uint8Array([1,2,3]);
  const patches = [new Uint8ClampedArray(source.length).fill(255),new Uint8ClampedArray(source.length).fill(66),new Uint8ClampedArray(source.length).fill(155)];
  for (const progress of [.995,1]) {
    const output = new Uint8ClampedArray(source.length);
    revealPhotoPixels(source,times,underTimes,ids,patches,progress,output);
    assert.deepEqual(output,source);
  }
});

test('temporary underpasses cannot remain over the photographed foreground after it has arrived', () => {
  const output = new Uint8ClampedArray(4);
  const photo = new Uint8ClampedArray([232,134,46,255]);
  const patch = new Uint8ClampedArray([185,80,7,255]);
  revealPhotoPixels(photo,[.7],[.3],[1],[patch],.5,output);
  assert.deepEqual(output,patch);
  revealPhotoPixels(photo,[.7],[.3],[1],[patch],.8,output);
  assert.deepEqual(output,photo);
});

test('underpass edges never become more opaque than the original photographed silhouette', () => {
  const output = new Uint8ClampedArray(4);
  const photo = new Uint8ClampedArray([232,134,46,32]);
  const patch = new Uint8ClampedArray([185,80,7,255]);
  revealPhotoPixels(photo,[.8],[.1],[1],[patch],.5,output);
  assert.equal(output[3],32);
  revealPhotoPixels(photo,[.8],[.1],[1],[patch],1,output,[.7]);
  assert.deepEqual(output,photo);
});
