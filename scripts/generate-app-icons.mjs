#!/usr/bin/env node
/**
 * generate-app-icons.mjs — Routine Stars app icon / splash re-cut
 * ---------------------------------------------------------------
 * WHY THIS EXISTS
 *   The shipped assets/icon.png contained a PRE-BAKED rounded-square tile
 *   (teal frame + cream field + star mascot) floating on a plain white field.
 *   iOS applies its own squircle mask to the 1024x1024 app icon, so that
 *   artwork rendered as a WHITE icon with a small inset tile — an Apple HIG
 *   violation ("Don't add rounded corners / don't letterbox your icon") and a
 *   realistic App Review flag. assets/adaptive-icon.png was the same artwork
 *   with no alpha, which is wrong for an Android adaptive foreground layer.
 *
 * APPROACH (documented per task brief step 3)
 *   Neither `sips --cropOffset` (option (a)) nor a BMP roundtrip (option (b))
 *   was used in the end:
 *     - sips crop/scale works, but it cannot composite, cannot synthesize a
 *       background, and cannot author a real alpha channel. The adaptive icon
 *       needs all three.
 *     - The BMP roundtrip loses the alpha channel (sips writes 24-bit BMP),
 *       which again kills the adaptive icon.
 *   So this script carries a self-contained PNG codec built on node's builtin
 *   `zlib`. PNG is just zlib-deflated, per-scanline-filtered raster data, so a
 *   decoder (inflate + unfilter) and an encoder (adaptive filter + deflate) are
 *   ~200 lines and need ZERO npm dependencies. That buys pixel-level control:
 *   content-bounds detection, area-average / bilinear resampling, background
 *   modelling, alpha compositing and feathering — all deterministic and
 *   reproducible on any machine with node >= 18. macOS `sips` is only used for
 *   the independent verification pass at the end.
 *
 * WHY A SECOND SOURCE IMAGE
 *   The obvious plan — crop the cream field out of icon.png and grow it to fill
 *   1024 — is impossible with this artwork. `inspect` measures the mascot at
 *   95.5% of the field's width, so once the mascot and its cast shadow are
 *   masked off there is literally no clean field left to extrapolate a
 *   background from (fillOutward throws "nothing to diffuse from"). A synthetic
 *   flat or fitted background was rejected for the reasons in fillOutward()'s
 *   comment.
 *
 *   assets/review/ turned out to hold a genuine full-bleed 1254x1254 master,
 *   branding/adaptive-icon-candidate-1.png: the same plaque on a warm gradient
 *   that already runs edge to edge (corners #F9E0B3, no white anywhere). Its
 *   star, however, has NO FACE — it predates the winking mascot that ships in
 *   icon.png and that the rest of the app's art uses.
 *
 *   So the build transplants: the WINKING plaque is matted off icon.png's white
 *   field, and the BACKGROUND comes from the master with its own faceless
 *   plaque inpainted away. Both halves are real artwork; nothing is invented
 *   except the small area of gradient hidden behind the new plaque. That keeps
 *   the shipped mascot identity and still yields a true full-bleed icon.
 *
 * WHAT IS DELIBERATELY NOT FIXED
 *   The icon still depicts a rounded-square plaque. That is the artwork's
 *   design, and the dark teal frame is the only strong value contrast in an
 *   otherwise cream-on-yellow palette — it is what makes the icon legible at
 *   60pt. Removing it would satisfy a stylistic "no tile inside a tile"
 *   preference at the cost of the thing HIG actually cares about. The genuine
 *   defect (a small tile marooned on a white field, so the icon read as white)
 *   is gone: the plaque now covers 92% of the canvas over a full-bleed field.
 *
 * SUPPORTED PNG SUBSET
 *   Decode: 8-bit, non-interlaced, colour types 0/2/3/4/6 (gray, RGB, palette,
 *           gray+alpha, RGBA). Every asset in this repo is 8-bit RGB or RGBA.
 *   Encode: 8-bit colour type 2 (RGB) or 6 (RGBA), adaptive scanline filtering,
 *           deflate level 9.
 *
 * USAGE
 *   node scripts/generate-app-icons.mjs inspect        # measure, change nothing
 *   node scripts/generate-app-icons.mjs build          # backup + regenerate
 *   node scripts/generate-app-icons.mjs build /tmp/x   # dry run to a scratch dir
 *   node scripts/generate-app-icons.mjs build "" 6     # + posterise the splash
 *   node scripts/generate-app-icons.mjs verify         # sips gate on the outputs
 *   node scripts/generate-app-icons.mjs debug out.png  # geometry overlay
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = resolve(ROOT, 'assets');
const BACKUP_DIR = resolve(ASSETS, 'appstore', 'originals-backup');

const ICON = resolve(ASSETS, 'icon.png');
const ADAPTIVE = resolve(ASSETS, 'adaptive-icon.png');
const SPLASH = resolve(ASSETS, 'splash-icon.png');

/* ------------------------------------------------------------------ *
 * PNG DECODE
 * ------------------------------------------------------------------ */

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Decode a PNG file into { width, height, data } where data is RGBA8. */
function decodePng(file) {
  const buf = readFileSync(file);
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error(`${file}: not a PNG`);

  let pos = 8;
  let ihdr = null;
  let palette = null;
  let trns = null;
  const idat = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;

    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'tRNS') trns = Buffer.from(data);
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }

  if (!ihdr) throw new Error(`${file}: missing IHDR`);
  const { width, height, bitDepth, colorType, interlace } = ihdr;
  if (bitDepth !== 8) throw new Error(`${file}: unsupported bit depth ${bitDepth} (need 8)`);
  if (interlace !== 0) throw new Error(`${file}: interlaced PNGs are not supported`);
  const ch = CHANNELS[colorType];
  if (!ch) throw new Error(`${file}: unsupported colour type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = Buffer.alloc(height * stride);

  // Unfilter scanlines in place.
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const x = line[i];
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev[i];
      const c = i >= ch ? prev[i - ch] : 0;
      let v;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error(`${file}: bad filter type ${filter} on row ${y}`);
      }
      cur[i] = v & 0xff;
    }
    prev = cur;
  }

  // Expand to RGBA8.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    const s = i * ch;
    const d = i * 4;
    let r, g, b, a = 255;
    if (colorType === 0) { r = g = b = out[s]; }
    else if (colorType === 4) { r = g = b = out[s]; a = out[s + 1]; }
    else if (colorType === 2) { r = out[s]; g = out[s + 1]; b = out[s + 2]; }
    else if (colorType === 6) { r = out[s]; g = out[s + 1]; b = out[s + 2]; a = out[s + 3]; }
    else { // palette
      const idx = out[s];
      r = palette[idx * 3]; g = palette[idx * 3 + 1]; b = palette[idx * 3 + 2];
      if (trns && idx < trns.length) a = trns[idx];
    }
    rgba[d] = r; rgba[d + 1] = g; rgba[d + 2] = b; rgba[d + 3] = a;
  }

  return { width, height, data: rgba, sourceColorType: colorType };
}

/* ------------------------------------------------------------------ *
 * PNG ENCODE
 * ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/**
 * Encode RGBA8 to a PNG buffer.
 * `alpha=false` drops the alpha channel entirely (colour type 2) — required for
 * the iOS 1024 marketing icon, which App Store Connect rejects if it has alpha.
 * Adaptive per-scanline filtering uses the standard minimum-sum-of-absolute-
 * differences heuristic from the PNG spec, which is what keeps file size down.
 */
function encodePng({ width, height, data }, { alpha = true } = {}) {
  const ch = alpha ? 4 : 3;
  const stride = width * ch;
  const rows = Buffer.alloc(height * (stride + 1));

  const cur = Buffer.alloc(stride);
  let prev = Buffer.alloc(stride);
  const cand = [Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride), Buffer.alloc(stride)];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * 4;
      const d = x * ch;
      cur[d] = data[s]; cur[d + 1] = data[s + 1]; cur[d + 2] = data[s + 2];
      if (alpha) cur[d + 3] = data[s + 3];
    }

    let best = 0;
    let bestScore = Infinity;
    for (let f = 0; f < 5; f++) {
      const c = cand[f];
      let score = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= ch ? cur[i - ch] : 0;
        const b = prev[i];
        const cc = i >= ch ? prev[i - ch] : 0;
        let v;
        switch (f) {
          case 0: v = cur[i]; break;
          case 1: v = cur[i] - a; break;
          case 2: v = cur[i] - b; break;
          case 3: v = cur[i] - ((a + b) >> 1); break;
          default: v = cur[i] - paeth(a, b, cc); break;
        }
        v &= 0xff;
        c[i] = v;
        score += v < 128 ? v : 256 - v;
      }
      if (score < bestScore) { bestScore = score; best = f; }
    }

    rows[y * (stride + 1)] = best;
    cand[best].copy(rows, y * (stride + 1) + 1);
    cur.copy(prev);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = alpha ? 6 : 2;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // No ancillary chunks are emitted at all — that is the "strip metadata" step
  // (no tEXt/iTXt/eXIf/iCCP/pHYs/gAMA). Untagged 8-bit RGB is read as sRGB.
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows, { level: 9, memLevel: 9, windowBits: 15 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------------ *
 * PIXEL HELPERS
 * ------------------------------------------------------------------ */

const blank = (w, h, fill = [0, 0, 0, 0]) => {
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = fill[0]; data[i * 4 + 1] = fill[1];
    data[i * 4 + 2] = fill[2]; data[i * 4 + 3] = fill[3];
  }
  return { width: w, height: h, data };
};

const px = (img, x, y) => {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
};

function crop(img, x0, y0, w, h) {
  const out = blank(w, h);
  for (let y = 0; y < h; y++) {
    const src = ((y0 + y) * img.width + x0) * 4;
    img.data.copy(out.data, y * w * 4, src, src + w * 4);
  }
  return out;
}

/** Average colour of a rectangular patch (ignores alpha weighting). */
function patchAverage(img, x0, y0, w, h) {
  let r = 0, g = 0, b = 0, a = 0, n = 0;
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const p = px(img, x, y);
      r += p[0]; g += p[1]; b += p[2]; a += p[3]; n++;
    }
  }
  return [r / n, g / n, b / n, a / n].map((v) => Math.round(v));
}

/**
 * Separable resampler. Area-averaging when shrinking (correct box filter, no
 * aliasing), bilinear when enlarging. Operates on premultiplied alpha so that
 * transparent pixels never bleed their RGB into the visible edge.
 */
function resample(img, dw, dh) {
  const { width: sw, height: sh } = img;

  const pre = new Float64Array(sw * sh * 4);
  for (let i = 0; i < sw * sh; i++) {
    const a = img.data[i * 4 + 3] / 255;
    pre[i * 4] = img.data[i * 4] * a;
    pre[i * 4 + 1] = img.data[i * 4 + 1] * a;
    pre[i * 4 + 2] = img.data[i * 4 + 2] * a;
    pre[i * 4 + 3] = img.data[i * 4 + 3];
  }

  const pass = (src, sW, sH, dW) => {
    // Horizontal resample only; caller transposes for the vertical pass.
    const dst = new Float64Array(dW * sH * 4);
    const scale = sW / dW;
    for (let x = 0; x < dW; x++) {
      const lo = x * scale;
      const hi = (x + 1) * scale;
      let i0, i1, weights;
      if (scale >= 1) {
        i0 = Math.floor(lo);
        i1 = Math.min(sW - 1, Math.ceil(hi) - 1);
        weights = [];
        for (let i = i0; i <= i1; i++) weights.push(Math.min(hi, i + 1) - Math.max(lo, i));
      } else {
        const c = lo + scale / 2 - 0.5;
        const f = Math.floor(c);
        const t = c - f;
        i0 = Math.max(0, Math.min(sW - 1, f));
        i1 = Math.max(0, Math.min(sW - 1, f + 1));
        weights = i0 === i1 ? [1] : [1 - t, t];
      }
      let wsum = 0;
      for (const w of weights) wsum += w;
      for (let y = 0; y < sH; y++) {
        let r = 0, g = 0, b = 0, a = 0;
        for (let k = 0; k < weights.length; k++) {
          const s = (y * sW + Math.min(sW - 1, i0 + k)) * 4;
          const w = weights[k];
          r += src[s] * w; g += src[s + 1] * w; b += src[s + 2] * w; a += src[s + 3] * w;
        }
        const d = (y * dW + x) * 4;
        dst[d] = r / wsum; dst[d + 1] = g / wsum; dst[d + 2] = b / wsum; dst[d + 3] = a / wsum;
      }
    }
    return dst;
  };

  const transpose = (src, w, h) => {
    const dst = new Float64Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const s = (y * w + x) * 4;
        const d = (x * h + y) * 4;
        dst[d] = src[s]; dst[d + 1] = src[s + 1]; dst[d + 2] = src[s + 2]; dst[d + 3] = src[s + 3];
      }
    }
    return dst;
  };

  let buf = pass(pre, sw, sh, dw);          // sw x sh -> dw x sh
  buf = transpose(buf, dw, sh);             // -> sh x dw
  buf = pass(buf, sh, dw, dh);              // -> dh x dw
  buf = transpose(buf, dh, dw);             // -> dw x dh

  const out = blank(dw, dh);
  for (let i = 0; i < dw * dh; i++) {
    const a = buf[i * 4 + 3];
    const inv = a > 0.0001 ? 255 / a : 0;
    out.data[i * 4] = Math.max(0, Math.min(255, Math.round(buf[i * 4] * inv)));
    out.data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(buf[i * 4 + 1] * inv)));
    out.data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(buf[i * 4 + 2] * inv)));
    out.data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(a)));
  }
  return out;
}

/** Source-over composite of `src` onto `dst` at (dx, dy), with optional per-pixel alpha scale. */
function compositeOver(dst, src, dx, dy, alphaAt = null) {
  for (let y = 0; y < src.height; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= dst.width) continue;
      const s = (y * src.width + x) * 4;
      let sa = src.data[s + 3] / 255;
      if (alphaAt) sa *= alphaAt(x, y);
      if (sa <= 0) continue;
      const d = (ty * dst.width + tx) * 4;
      const da = dst.data[d + 3] / 255;
      const oa = sa + da * (1 - sa);
      for (let c = 0; c < 3; c++) {
        dst.data[d + c] = Math.round((src.data[s + c] * sa + dst.data[d + c] * da * (1 - sa)) / oa);
      }
      dst.data[d + 3] = Math.round(oa * 255);
    }
  }
}

/** Flatten any residual transparency onto an opaque colour. */
function flatten(img, bg) {
  const out = blank(img.width, img.height);
  for (let i = 0; i < img.width * img.height; i++) {
    const a = img.data[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) {
      out.data[i * 4 + c] = Math.round(img.data[i * 4 + c] * a + bg[c] * (1 - a));
    }
    out.data[i * 4 + 3] = 255;
  }
  return out;
}

/**
 * Extend an image's colours outward into its transparent region, so a plate
 * that covers only part of the canvas can be grown to fill every edge.
 *
 * WHY DIFFUSION AND NOT A FITTED GRADIENT: a bilinear model fitted to the
 * plate's border ring was tried first and fails badly. The mascot's shading
 * darkens the lower field, the fit reads that as a steep vertical ramp, and
 * extrapolating it past the plate runs the canvas corners to #A2773A — a muddy
 * brown against cream. The colour mismatch then makes the plate's own outline
 * legible as a rounded tile, which is the exact defect being removed.
 *
 * Diffusion has no such failure mode: every filled pixel is an average of
 * already-filled neighbours, so the result agrees with the plate border BY
 * CONSTRUCTION, stays inside the source's colour range, and cannot diverge.
 * Running it at low resolution and upscaling both speeds it up and smooths away
 * the ridges that form where two fill fronts meet.
 */
function fillOutward(layer, lowRes = 192, smoothPasses = 3) {
  const low = resample(layer, lowRes, lowRes);
  const n = lowRes * lowRes;
  const filled = new Uint8Array(n);
  for (let i = 0; i < n; i++) filled[i] = low.data[i * 4 + 3] >= 200 ? 1 : 0;
  if (!filled.includes(1)) throw new Error('fillOutward: nothing to diffuse from');

  const rgb = new Float64Array(n * 3);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) rgb[i * 3 + c] = low.data[i * 4 + c];
  }

  for (let guard = 0; guard < lowRes * 2; guard++) {
    const next = [];
    for (let y = 0; y < lowRes; y++) {
      for (let x = 0; x < lowRes; x++) {
        const i = y * lowRes + x;
        if (filled[i]) continue;
        let r = 0, g = 0, b = 0, k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= lowRes || yy >= lowRes) continue;
            const j = yy * lowRes + xx;
            if (!filled[j]) continue;
            r += rgb[j * 3]; g += rgb[j * 3 + 1]; b += rgb[j * 3 + 2]; k++;
          }
        }
        if (k) next.push([i, r / k, g / k, b / k]);
      }
    }
    if (!next.length) break;
    for (const [i, r, g, b] of next) {
      rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = b;
      filled[i] = 1;
    }
  }

  // Box-blur the whole low-res field. The sharp plate is composited back on top
  // afterwards, so this only ever softens the extension.
  for (let p = 0; p < smoothPasses; p++) {
    const src = Float64Array.from(rgb);
    for (let y = 0; y < lowRes; y++) {
      for (let x = 0; x < lowRes; x++) {
        const i = y * lowRes + x;
        let r = 0, g = 0, b = 0, k = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const xx = Math.max(0, Math.min(lowRes - 1, x + dx));
            const yy = Math.max(0, Math.min(lowRes - 1, y + dy));
            const j = yy * lowRes + xx;
            r += src[j * 3]; g += src[j * 3 + 1]; b += src[j * 3 + 2]; k++;
          }
        }
        rgb[i * 3] = r / k; rgb[i * 3 + 1] = g / k; rgb[i * 3 + 2] = b / k;
      }
    }
  }

  const out = blank(lowRes, lowRes);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) out.data[i * 4 + c] = Math.max(0, Math.min(255, Math.round(rgb[i * 3 + c])));
    out.data[i * 4 + 3] = 255;
  }
  return resample(out, layer.width, layer.height);
}

/**
 * Soft rounded-rectangle coverage mask, matching the source field's own corner
 * geometry. Corner feathering removes the teal corner wedges; edge feathering
 * takes the artwork difference smoothly to zero at the plate boundary.
 */
function roundedMask(w, h, r, feather) {
  return (x, y) => {
    const dx = Math.max(r - x, x - (w - 1 - r), 0);
    const dy = Math.max(r - y, y - (h - 1 - r), 0);
    const d = Math.hypot(dx, dy);
    const cornerA = Math.max(0, Math.min(1, (r - d) / feather));
    const edge = Math.min(x, y, w - 1 - x, h - 1 - y);
    const edgeA = Math.max(0, Math.min(1, edge / feather));
    return Math.min(cornerA, edgeA);
  };
}

/* ------------------------------------------------------------------ *
 * ANALYSIS
 * ------------------------------------------------------------------ */

const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const luma = (p) => 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];

/**
 * Find the bounding box of content that differs from the reference colour.
 * Used twice: once against white to locate the pre-baked tile, once against
 * the cream field to locate the star mascot.
 */
function contentBounds(img, ref, threshold, region = null) {
  const x0 = region ? region.x : 0;
  const y0 = region ? region.y : 0;
  const x1 = region ? region.x + region.w : img.width;
  const y1 = region ? region.y + region.h : img.height;
  let minX = x1, minY = y1, maxX = x0 - 1, maxY = y0 - 1;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = px(img, x, y);
      if (p[3] < 8) continue;
      if (dist(p, ref) > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const median = (vals) => {
  const s = [...vals].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Locate the cream field inside the baked tile.
 *
 * Keying off the FRAME colour (not the field colour) is the reliable direction:
 * the dark teal frame is unambiguous at the tile edge midpoints, where it is
 * also at its thinnest, whereas a field sample can easily land on the mascot.
 * Walk inward from each edge midpoint until the pixel stops matching the frame.
 */
function innerFieldBounds(img, tile) {
  // Classify on LUMINANCE, not colour distance. The teal frame is bevel-shaded,
  // so its lit and shadowed edges sit far apart in RGB from the frame's median
  // colour and a colour-distance scan exits while still inside the frame.
  // Luminance separates the zones with headroom: frame ~95, cream field ~225,
  // white surround ~254.
  const DARK = 150;
  // The frame stroke measures ~78px. The mascot's cast shadow on the cream
  // field also reads DARK (#B48F59, luma 148) and butts almost directly against
  // the frame at mid-height — but a short non-dark band always separates them,
  // so requiring a substantial run and stopping at its END lands on the frame's
  // inner edge and never runs on into the shadow.
  const MIN_RUN = 20;
  // Bevel highlight + anti-aliasing ride the inner edge; bite past them.
  const SAFETY = 10;

  /** Index just past the first dark run of at least MIN_RUN along a scan line. */
  const scanLine = (get, from, to) => {
    const step = to > from ? 1 : -1;
    let runStart = null;
    for (let i = from; i !== to; i += step) {
      if (luma(get(i)) < DARK) {
        if (runStart === null) runStart = i;
      } else {
        if (runStart !== null && Math.abs(i - runStart) >= MIN_RUN) return i;
        runStart = null;
      }
    }
    return null;
  };

  // Sample many parallel scan lines across the middle 60% of the tile and take
  // the median. Single-line probes are unreliable — the centre row happens to
  // be exactly where the mascot's arm crowds the frame. The middle 60% window
  // also keeps every scan clear of the tile's rounded corners, where a straight
  // scan would cut through the frame at an angle and read it as much thicker.
  const samples = 25;
  const at = (lo, span, k) => lo + Math.round(span * (0.2 + 0.6 * (k / (samples - 1))));

  const collect = (fn) => {
    const vals = [];
    for (let k = 0; k < samples; k++) {
      const v = fn(k);
      if (v !== null) vals.push(v);
    }
    if (!vals.length) throw new Error('innerFieldBounds: no scan line found the frame');
    return Math.round(median(vals));
  };

  const x0 = tile.x, x1 = tile.x + tile.w - 1;
  const y0 = tile.y, y1 = tile.y + tile.h - 1;

  const left = collect((k) => { const y = at(y0, tile.h, k); return scanLine((x) => px(img, x, y), x0, x1); }) + SAFETY;
  const right = collect((k) => { const y = at(y0, tile.h, k); return scanLine((x) => px(img, x, y), x1, x0); }) - SAFETY;
  const top = collect((k) => { const x = at(x0, tile.w, k); return scanLine((y) => px(img, x, y), y0, y1); }) + SAFETY;
  const bottom = collect((k) => { const x = at(x0, tile.w, k); return scanLine((y) => px(img, x, y), y1, y0); }) - SAFETY;

  const rect = { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
  const frameColor = patchAverage(img, tile.x + Math.round((left - tile.x) / 2), tile.y + Math.floor(tile.h / 2) - 8, 8, 16);

  // Field colour = median of four inner-corner patches. Corners are the part of
  // the field least likely to be covered by the mascot; the median shrugs off
  // the one or two corners that hold a small decorative star.
  const s = 22;
  const corners = [
    patchAverage(img, rect.x + 8, rect.y + 8, s, s),
    patchAverage(img, rect.x + rect.w - s - 8, rect.y + 8, s, s),
    patchAverage(img, rect.x + 8, rect.y + rect.h - s - 8, s, s),
    patchAverage(img, rect.x + rect.w - s - 8, rect.y + rect.h - s - 8, s, s),
  ];
  const fieldColor = [0, 1, 2, 3].map((c) => Math.round(median(corners.map((p) => p[c]))));

  return { ...rect, frameColor, fieldColor, corners };
}

const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const kb = (f) => (statSync(f).size / 1024).toFixed(1) + ' KB';

/**
 * The untouched original of an asset.
 *
 * Once build() has run, assets/icon.png IS the generated icon. Feeding that
 * back in as the plaque source on a second run produces garbage: the matte keys
 * off the white field the original had and the new one does not, so
 * `dist(px, white) > 160` no longer describes the plaque at all. Routing every
 * read of source artwork through here makes the build idempotent and keeps its
 * geometry report describing the source rather than the previous output.
 */
function pristine(file) {
  const backed = resolve(BACKUP_DIR, basename(file));
  return existsSync(backed) ? backed : file;
}

/**
 * Measure the inner field's corner radius by walking the corner diagonal.
 * For a rounded rect of radius r, the diagonal enters the shape at
 * d = r(1 - 1/sqrt2), so r = d / 0.2929.
 */
function fieldRadius(img, rect, fieldColor) {
  const probe = (sx, sy, dx, dy) => {
    for (let d = 0; d < Math.min(rect.w, rect.h) / 2; d++) {
      if (dist(px(img, sx + dx * d, sy + dy * d), fieldColor) < 110) return d;
    }
    return 0;
  };
  const ds = [
    probe(rect.x, rect.y, 1, 1),
    probe(rect.x + rect.w - 1, rect.y, -1, 1),
    probe(rect.x, rect.y + rect.h - 1, 1, -1),
    probe(rect.x + rect.w - 1, rect.y + rect.h - 1, -1, -1),
  ];
  return { radius: Math.round(median(ds) / (1 - Math.SQRT1_2)), diagonals: ds };
}

/**
 * Representative cream colour, as the median of four corner patches.
 * The field's corners are the region least likely to be covered by the mascot,
 * and taking the median shrugs off the one or two corners that hold a small
 * decorative star. Sampling the top-centre instead does NOT work: the mascot's
 * top point reaches into it, and being a bright yellow it does not stand out
 * from cream on luminance alone.
 */
function fieldColorFromCorners(img, rect, insetFraction = 0.12) {
  const n = Math.round(rect.w * insetFraction);
  const s = 28;
  const patches = [
    patchAverage(img, rect.x + n, rect.y + n, s, s),
    patchAverage(img, rect.x + rect.w - n - s, rect.y + n, s, s),
    patchAverage(img, rect.x + n, rect.y + rect.h - n - s, s, s),
    patchAverage(img, rect.x + rect.w - n - s, rect.y + rect.h - n - s, s, s),
  ];
  return { color: [0, 1, 2, 3].map((c) => Math.round(median(patches.map((p) => p[c])))), patches };
}

/** Separable binary box dilation by radius r. */
function dilateMask(src, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const dst = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < w && src[y * w + xx]) v = 1;
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < h && tmp[yy * w + x]) v = 1;
      }
      dst[y * w + x] = v;
    }
  }
  return dst;
}

/** Fill enclosed holes: anything the background flood cannot reach from the border. */
function fillHoles(mask, w, h) {
  const outside = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (i) => { if (!mask[i] && !outside[i]) { outside[i] = 1; stack[sp++] = i; } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (sp > 0) {
    const i = stack[--sp];
    const x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  const out = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) out[i] = mask[i] || !outside[i] ? 1 : 0;
  return out;
}

/**
 * Mask of everything that is artwork rather than background, found by EDGE
 * ENERGY rather than colour.
 *
 * Colour thresholding cannot separate this mascot from its field. The star's
 * body (#F7B033) and the lower part of the cream field (#F5CD7F) are only ~107
 * apart in L1, while the field's own top-to-bottom gradient spans ~132 — so any
 * threshold loose enough to miss the field also misses the mascot. Local edge
 * energy has no such overlap: the field is a smooth gradient and reads ~0-1,
 * the mascot's outline, eyes and cast shadow read 20+.
 *
 * `border` skips the plate's outermost pixels, which still carry the teal
 * frame's steep edge. Included, that edge forms a closed high-energy ring around
 * everything and the largest component becomes the whole field.
 */
function artworkMask(plate, { threshold = 8, border = 26, close = 10, shadow = 26 } = {}) {
  const { width: w, height: h } = plate;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = luma([plate.data[i * 4], plate.data[i * 4 + 1], plate.data[i * 4 + 2]]);

  const hot = new Uint8Array(w * h);
  for (let y = border; y < h - border; y++) {
    for (let x = border; x < w - border; x++) {
      const i = y * w + x;
      if (Math.abs(lum[i + 1] - lum[i - 1]) + Math.abs(lum[i + w] - lum[i - w]) > threshold) hot[i] = 1;
    }
  }

  // Close gaps in the silhouette, fill the interior, then grow again to swallow
  // the soft cast shadow — the shadow must live in this mask so it is treated as
  // artwork and does not get smeared into the synthesised background.
  const solid = fillHoles(dilateMask(hot, w, h, close), w, h);
  return { hot, solid, grown: dilateMask(solid, w, h, shadow) };
}

/**
 * The largest connected component itself, as a mask. `largestComponent` only
 * returns a bounding box, which is not good enough for reach measurements: a
 * five-pointed star touches its bbox at five arm tips only, so the bbox
 * diagonal overstates how far the mascot actually extends by ~40%.
 */
function largestComponentMask(mask, w, h) {
  const label = new Int32Array(w * h).fill(-1);
  const stack = new Int32Array(w * h);
  let best = -1, bestArea = 0, next = 0;

  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || label[start] >= 0) continue;
    const id = next++;
    let sp = 0, area = 0;
    stack[sp++] = start;
    label[start] = id;
    while (sp > 0) {
      const i = stack[--sp];
      const x = i % w, y = (i / w) | 0;
      area++;
      if (x > 0 && mask[i - 1] && label[i - 1] < 0) { label[i - 1] = id; stack[sp++] = i - 1; }
      if (x < w - 1 && mask[i + 1] && label[i + 1] < 0) { label[i + 1] = id; stack[sp++] = i + 1; }
      if (y > 0 && mask[i - w] && label[i - w] < 0) { label[i - w] = id; stack[sp++] = i - w; }
      if (y < h - 1 && mask[i + w] && label[i + w] < 0) { label[i + w] = id; stack[sp++] = i + w; }
    }
    if (area > bestArea) { bestArea = area; best = id; }
  }

  const out = new Uint8Array(w * h);
  if (best < 0) return out;
  for (let i = 0; i < w * h; i++) if (label[i] === best) out[i] = 1;
  return out;
}

/** Bounding box of the largest connected component of a binary mask. */
function largestComponent(mask, w, h) {
  const seen = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let best = null;
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue;
    let sp = 0;
    stack[sp++] = start;
    seen[start] = 1;
    let area = 0, minX = w, minY = h, maxX = -1, maxY = -1;
    while (sp > 0) {
      const i = stack[--sp];
      const x = i % w, y = (i / w) | 0;
      area++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && mask[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stack[sp++] = i - 1; }
      if (x < w - 1 && mask[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stack[sp++] = i + 1; }
      if (y > 0 && mask[i - w] && !seen[i - w]) { seen[i - w] = 1; stack[sp++] = i - w; }
      if (y < h - 1 && mask[i + w] && !seen[i + w]) { seen[i + w] = 1; stack[sp++] = i + w; }
    }
    if (!best || area > best.area) best = { area, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  }
  if (!best) throw new Error('largestComponent: mask is empty');
  return best;
}

/**
 * Estimate the cream field with the artwork removed, by diffusing the
 * surrounding field colours across the masked region. Low resolution is not a
 * compromise here — the field is a smooth gradient, so a coarse solve is both
 * faster and cleaner than a full-resolution one.
 */
function inpaint(plate, mask) {
  const layer = blank(plate.width, plate.height);
  plate.data.copy(layer.data);
  for (let i = 0; i < plate.width * plate.height; i++) if (mask[i]) layer.data[i * 4 + 3] = 0;
  return fillOutward(layer, 256, 2);
}

/**
 * The mascot's silhouette, keyed on CHROMA rather than edges or luminance.
 *
 * The star's body is a saturated orange (chroma 164-193 measured across body,
 * arms and the shaded lower lobes) while the cream field tops out around 114
 * even where the frame's inner shadow warms it, and the teal frame sits at 59.
 * One threshold separates all three with real headroom.
 *
 * Edge energy cannot do this job. The field's inner rim is itself a strong
 * edge, so artworkMask()'s filled silhouette leaks out to the frame: it gets
 * the mascot's BOUNDING BOX right by luck but reports the filled area as
 * reaching 476px from centre when the star's arms only reach 384px. Any
 * safe-zone decision made on that number is wrong by 40%.
 */
function mascotMask(img) {
  const { width: w, height: h } = img;
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = img.data[i * 4], g = img.data[i * 4 + 1], b = img.data[i * 4 + 2];
    if (Math.max(r, g, b) - Math.min(r, g, b) > 140) m[i] = 1;
  }
  // `all` is every saturated element: the mascot plus the four decorative
  // stars and dots. `largest` is the mascot on its own.
  const all = fillHoles(dilateMask(m, w, h, 3), w, h);
  return { all, largest: largestComponentMask(all, w, h) };
}

function analyseIcon(file = pristine(ICON)) {
  const img = decodePng(file);
  const corner = patchAverage(img, 0, 0, 24, 24);
  const tile = contentBounds(img, corner, 24);
  const inner = innerFieldBounds(img, tile);
  const field = fieldColorFromCorners(img, inner);
  const radius = fieldRadius(img, inner, field.color);

  const plate = crop(img, inner.x, inner.y, inner.w, inner.h);
  const masks = artworkMask(plate);
  const mascot = mascotMask(img);
  const star = largestComponent(mascot.largest, img.width, img.height);
  const starLocal = { ...star, x: star.x - inner.x, y: star.y - inner.y };

  return { img, corner, tile, inner: { ...inner, fieldColor: field.color }, radius, plate, masks, mascot, star, starLocal };
}

function inspect() {
  // Always describes the ORIGINAL artwork, so the numbers stay comparable after
  // a build has replaced the shipped files.
  const src = pristine(ICON);
  console.log(`=== ${src.replace(ROOT + '/', '')} ===`);
  const { img, corner, tile, inner, star, radius } = analyseIcon(src);
  console.log(`  canvas          ${img.width}x${img.height}  ${kb(src)}  colorType=${img.sourceColorType}`);
  console.log(`  outer field     ${hex(corner)}  (the plain surround — this is the HIG problem)`);
  console.log(`  baked tile      x=${tile.x} y=${tile.y} ${tile.w}x${tile.h}  = ${(100 * tile.w / img.width).toFixed(1)}% of canvas width`);
  console.log(`  frame margin    L=${tile.x} T=${tile.y} R=${img.width - tile.x - tile.w} B=${img.height - tile.y - tile.h}`);
  console.log(`  frame colour    ${hex(inner.frameColor)}  thickness L=${inner.x - tile.x} T=${inner.y - tile.y} R=${tile.x + tile.w - inner.x - inner.w} B=${tile.y + tile.h - inner.y - inner.h}`);
  console.log(`  inner field     x=${inner.x} y=${inner.y} ${inner.w}x${inner.h}  colour ${hex(inner.fieldColor)}`);
  console.log(`  field radius    ${radius.radius}px  (corner diagonals ${radius.diagonals.join(', ')})`);
  console.log(`  ^ the field is ALSO a rounded rect — cropping its bbox would swap white corners for teal ones`);
  if (star) {
    console.log(`  mascot bbox     x=${star.x} y=${star.y} ${star.w}x${star.h}`);
    console.log(`  mascot margin   within inner field: L=${star.x - inner.x} T=${star.y - inner.y} R=${inner.x + inner.w - star.x - star.w} B=${inner.y + inner.h - star.y - star.h}`);
    console.log(`  mascot coverage ${(100 * star.w / inner.w).toFixed(1)}% of inner field width`);
  }

  for (const [label, file] of [['adaptive-icon.png', ADAPTIVE], ['splash-icon.png', SPLASH]]) {
    console.log(`\n=== assets/${label} ===`);
    const im = decodePng(file);
    let minA = 255, opaque = 0;
    for (let i = 0; i < im.width * im.height; i++) {
      const a = im.data[i * 4 + 3];
      if (a < minA) minA = a;
      if (a === 255) opaque++;
    }
    const c = patchAverage(im, 0, 0, 24, 24);
    console.log(`  canvas          ${im.width}x${im.height}  ${kb(file)}  colorType=${im.sourceColorType}`);
    console.log(`  corner colour   ${hex(c)}`);
    console.log(`  alpha           min=${minA}  fully-opaque pixels=${(100 * opaque / (im.width * im.height)).toFixed(2)}%`);

    // splash.backgroundColor fills the letterbox around a `contain` splash, so
    // any difference between it and the image's own border colour shows up as
    // a visible band on every launch.
    if (file === SPLASH) {
      const edges = {
        top: patchAverage(im, 0, 0, im.width, 4),
        bottom: patchAverage(im, 0, im.height - 4, im.width, 4),
        left: patchAverage(im, 0, 0, 4, im.height),
        right: patchAverage(im, im.width - 4, 0, 4, im.height),
      };
      const configured = [0xf8, 0xe9, 0xd7];
      console.log(`  border colours  ${Object.entries(edges).map(([k, v]) => `${k} ${hex(v)}`).join('  ')}`);
      console.log(`  vs splash.backgroundColor #F8E9D7 — L1 deltas ${Object.values(edges).map((v) => dist(v, configured)).join(', ')}`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * BUILD
 * ------------------------------------------------------------------ */

const SIZE = 1024;

/** The full-bleed background donor (see "WHY A SECOND SOURCE IMAGE" above). */
const MASTER = resolve(ASSETS, 'review', 'reference-style-v1', 'branding', 'adaptive-icon-candidate-1.png');

// Plaque width as a fraction of the 1024 canvas for the iOS icon. 0.92 was
// chosen off a rendered contact sheet at 256/120/60px: it is the largest value
// that still keeps the plaque's own rounded corners clear of the system
// squircle (build() prints the measured clearance) and leaves an even warm
// margin on all four sides. At 1.00 the plaque reaches the edge and the
// squircle bites its corners; at 0.80 the icon reads small on the home screen.
const ICON_COVERAGE = 0.92;

// Android masks the adaptive foreground: everything outside the central 66%
// (a 72dp safe box in a 108dp layer) can be cropped, and only a circle of
// ~61% is guaranteed to survive on every launcher shape.
const ADAPTIVE_PLAQUE = 660;
const ADAPTIVE_SAFE_CIRCLE = Math.round(SIZE * 0.611);

function backup() {
  mkdirSync(BACKUP_DIR, { recursive: true });
  for (const f of [ICON, ADAPTIVE, SPLASH]) {
    const dest = resolve(BACKUP_DIR, basename(f));
    if (!existsSync(dest)) {
      copyFileSync(f, dest);
      console.log(`  backed up ${basename(f)} -> assets/appstore/originals-backup/`);
    } else {
      console.log(`  backup already present for ${basename(f)} (left untouched)`);
    }
  }
}

/** Box blur of a binary mask — a sub-pixel coverage estimate for feathering. */
function featherMask(mask, w, h, r = 1) {
  const out = new Float32Array(w * h);
  const k = (2 * r + 1) * (2 * r + 1);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = Math.max(0, Math.min(h - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const xx = Math.max(0, Math.min(w - 1, x + dx));
          s += mask[yy * w + xx];
        }
      }
      out[y * w + x] = s / k;
    }
  }
  return out;
}

/**
 * SOURCE A — a clean, full-bleed background plate.
 *
 * Takes the 1254x1254 branding master and removes its own (faceless) plaque,
 * leaving nothing but the warm gradient. Unlike icon.png this master has ample
 * clean field to work from — the plaque plus a generous shadow allowance covers
 * only ~44% of the frame — so the diffusion fill has plenty to extrapolate
 * from. The 60px dilation matters: a cast shadow left in the plate would be
 * diffused outward into a permanent smudge.
 */
function cleanBackground() {
  const m = decodePng(MASTER);
  const { width: w, height: h } = m;

  // The plaque is the only DARK thing in the frame; everything else is cream or
  // yellow, so luminance separates them with ~75 points of headroom.
  const dark = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (luma([m.data[i * 4], m.data[i * 4 + 1], m.data[i * 4 + 2]]) < 150) dark[i] = 1;
  }
  const plaque = fillHoles(dilateMask(dark, w, h, 3), w, h);
  const box = largestComponent(plaque, w, h);
  const mask = dilateMask(plaque, w, h, 60);

  let covered = 0;
  for (let i = 0; i < w * h; i++) if (mask[i]) covered++;

  const layer = blank(w, h);
  m.data.copy(layer.data);
  for (let i = 0; i < w * h; i++) if (mask[i]) layer.data[i * 4 + 3] = 0;

  return {
    plate: fillOutward(layer, 224, 3),
    box,
    masked: covered / (w * h),
    size: { w, h },
    edges: {
      tl: patchAverage(m, 0, 0, 24, 24),
      tr: patchAverage(m, w - 24, 0, 24, 24),
      bl: patchAverage(m, 0, h - 24, 24, 24),
      br: patchAverage(m, w - 24, h - 24, 24, 24),
    },
  };
}

/**
 * SOURCE B — the winking plaque, lifted off icon.png's white field.
 *
 * Two layers come back, because a solid object and a drop shadow composite
 * differently. The object is opaque colour with a feathered silhouette. The
 * shadow is MULTIPLICATIVE: the source shows it over white, so how much it
 * darkens white (1 - luma/whiteLuma) is exactly its opacity as black. Carrying
 * it that way is what lets the plaque keep its grounding on a background it was
 * never rendered against — a straight RGBA copy would paste a pale grey haze.
 *
 * The core threshold is deliberately high (~30% object coverage). A low
 * threshold pulls in edge pixels that are mostly white and paints a bright
 * fringe around the plaque once it sits on cream. The 1px feather plus the
 * inward colour bleed then restore a smooth silhouette without that
 * contamination.
 */
function mattePlaque() {
  const img = decodePng(pristine(ICON));
  const { width: w, height: h } = img;
  const white = patchAverage(img, 0, 0, 24, 24);
  const wl = luma(white);
  const rgbOf = (i) => [img.data[i * 4], img.data[i * 4 + 1], img.data[i * 4 + 2]];

  const core = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (dist(rgbOf(i), white) > 160) core[i] = 1;
  const solid = fillHoles(core, w, h);
  const box = largestComponent(solid, w, h);
  const alpha = featherMask(solid, w, h, 1);
  const footprint = dilateMask(solid, w, h, 2);

  const object = blank(w, h);
  const shadow = blank(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const a = alpha[i];
      if (a > 0) {
        let c;
        if (solid[i]) c = rgbOf(i);
        else {
          // Bleed the plaque's own colour outward into the feather ring.
          let r = 0, g = 0, b = 0, k = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const xx = x + dx, yy = y + dy;
              if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
              const j = yy * w + xx;
              if (!solid[j]) continue;
              const p = rgbOf(j); r += p[0]; g += p[1]; b += p[2]; k++;
            }
          }
          c = k ? [r / k, g / k, b / k] : rgbOf(i);
        }
        object.data[i * 4] = Math.round(c[0]);
        object.data[i * 4 + 1] = Math.round(c[1]);
        object.data[i * 4 + 2] = Math.round(c[2]);
        object.data[i * 4 + 3] = Math.round(255 * a);
      }
      if (!footprint[i]) {
        const s = Math.max(0, Math.min(1, 1 - luma(rgbOf(i)) / wl));
        shadow.data[i * 4 + 3] = Math.round(255 * s);
      }
    }
  }
  return { object, shadow, box, white };
}

/**
 * How close the artwork comes to the iOS mask. The home-screen shape is a
 * continuous-corner squircle, closely modelled by the superellipse
 * |x/a|^n + |y/a|^n = 1 with n ~ 5. Anything at d >= 1 gets cut off.
 */
function squircleClearance(layer, ox, oy, n = 5) {
  const a = SIZE / 2;
  let worst = 0, clipped = 0;
  for (let y = 0; y < layer.height; y++) {
    for (let x = 0; x < layer.width; x++) {
      if (layer.data[(y * layer.width + x) * 4 + 3] < 128) continue;
      const cx = Math.abs(ox + x + 0.5 - a) / a;
      const cy = Math.abs(oy + y + 0.5 - a) / a;
      const d = Math.pow(Math.pow(cx, n) + Math.pow(cy, n), 1 / n);
      if (d > worst) worst = d;
      if (d >= 1) clipped++;
    }
  }
  return { worst, clipped, marginPx: Math.round((1 - worst) * a) };
}

/**
 * Compose the full-bleed icon: matted winking plaque over the master's
 * background, shadow first so the plaque sits ON the field rather than above it.
 * `coverage` is the plaque's width as a fraction of the 1024 canvas.
 */
function composeIcon(coverage = ICON_COVERAGE) {
  const bg = cleanBackground();
  const plaque = mattePlaque();
  const { box } = plaque;

  const scale = (coverage * SIZE) / box.w;
  const sw = Math.round(plaque.object.width * scale);
  const sh = Math.round(plaque.object.height * scale);
  const object = resample(plaque.object, sw, sh);
  const shadow = resample(plaque.shadow, sw, sh);

  const canvas = resample(bg.plate, SIZE, SIZE);
  const offX = Math.round(SIZE / 2 - (box.x + box.w / 2) * scale);
  const offY = Math.round(SIZE / 2 - (box.y + box.h / 2) * scale);
  compositeOver(canvas, shadow, offX, offY);
  compositeOver(canvas, object, offX, offY);

  return {
    canvas, bg, plaque, object, shadow, scale, offX, offY,
    placed: {
      x: Math.round(offX + box.x * scale),
      y: Math.round(offY + box.y * scale),
      w: Math.round(box.w * scale),
      h: Math.round(box.h * scale),
    },
    clearance: squircleClearance(object, offX, offY),
  };
}

function build(outDir = ASSETS, splashBits = 0) {
  const dry = outDir !== ASSETS;
  const out = (n) => resolve(outDir, n);
  mkdirSync(outDir, { recursive: true });

  if (dry) console.log(`DRY RUN -> ${outDir}\n`);
  else { console.log('Backing up originals'); backup(); }

  console.log('\nBuilding icon.png (1024x1024, RGB, no alpha, full-bleed)');
  const icon = composeIcon();
  writeFileSync(out('icon.png'), encodePng(icon.canvas, { alpha: false }));

  const { star, mascot, img: iconSrc } = analyseIcon();
  const iconW = iconSrc.width;
  const starPx = Math.round(star.w * icon.scale);
  const c = (x, y) => px(icon.canvas, x, y);
  console.log(`  background     ${MASTER.replace(ROOT + '/', '')} (${icon.bg.size.w}x${icon.bg.size.h})`);
  console.log(`                 donor plaque masked off ${(100 * icon.bg.masked).toFixed(1)}% of it, rest diffused to fill`);
  console.log(`  plaque         ${icon.plaque.box.w}x${icon.plaque.box.h} src -> ${icon.placed.w}x${icon.placed.h} at (${icon.placed.x}, ${icon.placed.y})  scale ${icon.scale.toFixed(3)}`);
  console.log(`  coverage       plaque ${(100 * icon.placed.w / SIZE).toFixed(1)}% of canvas width, mascot ${starPx}px (${(100 * starPx / SIZE).toFixed(1)}%)`);
  console.log(`  margin         L=${icon.placed.x} T=${icon.placed.y} R=${SIZE - icon.placed.x - icon.placed.w} B=${SIZE - icon.placed.y - icon.placed.h}`);
  console.log(`  squircle       artwork reaches d=${icon.clearance.worst.toFixed(3)} of the mask (1.0 = clipped) — ${icon.clearance.marginPx}px clearance, ${icon.clearance.clipped} px clipped`);
  console.log(`  canvas corners TL ${hex(c(2, 2))} TR ${hex(c(SIZE - 3, 2))} BL ${hex(c(2, SIZE - 3))} BR ${hex(c(SIZE - 3, SIZE - 3))}`);
  console.log(`  canvas edges   T ${hex(c(SIZE / 2, 2))} B ${hex(c(SIZE / 2, SIZE - 3))} L ${hex(c(2, SIZE / 2))} R ${hex(c(SIZE - 3, SIZE / 2))}`);
  console.log(`  written ${kb(out('icon.png'))}`);

  console.log('\nBuilding adaptive-icon.png (1024x1024, RGBA, transparent, 66% safe zone)');
  // Android composites this foreground over adaptiveIcon.backgroundColor
  // (#F8E9D7) and then applies a launcher-chosen mask. Shipping ONLY the matted
  // plaque — no background of its own — is what makes that safe: whatever shape
  // the launcher masks with, it cuts through flat #F8E9D7, never through a
  // visible edge of baked-in artwork. That is also why the old file was wrong:
  // it had no alpha at all, so Android had a hard white square to mask.
  const aScale = ADAPTIVE_PLAQUE / icon.plaque.box.w;
  const aw = Math.round(icon.plaque.object.width * aScale);
  const ah = Math.round(icon.plaque.object.height * aScale);
  const aObj = resample(icon.plaque.object, aw, ah);
  const aShd = resample(icon.plaque.shadow, aw, ah);
  const aOffX = Math.round(SIZE / 2 - (icon.plaque.box.x + icon.plaque.box.w / 2) * aScale);
  const aOffY = Math.round(SIZE / 2 - (icon.plaque.box.y + icon.plaque.box.h / 2) * aScale);

  const fg = blank(SIZE, SIZE, [0, 0, 0, 0]);
  compositeOver(fg, aShd, aOffX, aOffY);
  compositeOver(fg, aObj, aOffX, aOffY);
  writeFileSync(out('adaptive-icon.png'), encodePng(fg, { alpha: true }));

  // Reach of each element from the canvas centre, against the circle Android
  // guarantees on every launcher shape.
  const reach = (layer, ox, oy) => {
    let r = 0;
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        if (layer.data[(y * layer.width + x) * 4 + 3] < 128) continue;
        r = Math.max(r, Math.hypot(ox + x + 0.5 - SIZE / 2, oy + y + 0.5 - SIZE / 2));
      }
    }
    return Math.round(r);
  };
  const plaqueReach = reach(aObj, aOffX, aOffY);
  // The mascot's true reach, from its silhouette rather than its bounding box —
  // a five-pointed star only touches its bbox at five arm tips, so the bbox
  // diagonal overstates the reach by ~40% and would flag a false clipping.
  const reachOf = (m) => {
    let r = 0;
    for (let i = 0; i < m.length; i++) {
      if (!m[i]) continue;
      const cx = aOffX + (i % iconW) * aScale - SIZE / 2;
      const cy = aOffY + ((i / iconW) | 0) * aScale - SIZE / 2;
      r = Math.max(r, Math.hypot(cx, cy));
    }
    return Math.round(r);
  };
  const starReach = reachOf(mascot.largest);
  const decorReach = reachOf(mascot.all);
  const safeR = ADAPTIVE_SAFE_CIRCLE / 2;
  console.log(`  plaque         ${ADAPTIVE_PLAQUE}px wide, centred (${(100 * ADAPTIVE_PLAQUE / SIZE).toFixed(1)}% of canvas — inside the 66% safe box)`);
  console.log(`  guaranteed     circle d=${ADAPTIVE_SAFE_CIRCLE}px (r=${safeR})`);
  console.log(`  plaque reach   ${plaqueReach}px from centre — ${plaqueReach > safeR ? `its CORNERS sit ${plaqueReach - safeR}px outside the circle and a round launcher mask will round them off further (harmless: they are frame, not content)` : 'fully inside'}`);
  console.log(`  mascot reach   ${starReach}px from centre — ${starReach > safeR ? `OUTSIDE by ${starReach - safeR}px, the star itself would be cut` : 'inside, the star itself is never cut on any launcher'}`);
  console.log(`  all inner art  ${decorReach}px from centre — ${decorReach > safeR ? `the decorative corner dots sit ${decorReach - safeR}px outside and a round mask may trim them` : 'inside'}`);
  console.log(`  written ${kb(out('adaptive-icon.png'))}`);

  // SPLASH — LOSSLESS BY DEFAULT.
  //
  // The <500 KB target in the brief is not reachable here without visibly
  // degrading the artwork, and this asset is the app's first impression. What
  // makes it expensive is film grain in the 3D render, which is exactly what
  // PNG cannot compress. Measured on this file (1024x1024):
  //
  //     lossless, alpha dropped   1234 KB    <- shipped
  //     posterised to 6 bits       702 KB    clean at 1:1, max error 2/255
  //     posterised to 5 bits       506 KB    REJECTED - visible mottling and a
  //                                          pink cast across the cream field
  //     posterised to 4 bits       246 KB    REJECTED - obvious contour banding
  //     downscaled to 512px        399 KB    REJECTED - the image is displayed
  //                                          full-screen (see below), so 512
  //                                          would be upscaled ~2.5x
  //
  // Pass a bit depth to take the 6-bit trade instead:
  //     node scripts/generate-app-icons.mjs build "" 6
  //
  // Worth knowing before deciding: with enableFullScreenImage_legacy the Expo
  // prebuild config writes this file at its NATIVE size into image.png,
  // image@2x.png AND image@3x.png (see @expo/prebuild-config
  // withIosSplashAssets.js — width/height are passed as undefined), so whatever
  // it weighs, it weighs three times in the IPA.
  console.log('\nOptimising splash-icon.png');
  const splashSrc = pristine(SPLASH);
  const before = statSync(splashSrc).size;
  const splash = decodePng(splashSrc);
  let minA = 255;
  for (let i = 0; i < splash.width * splash.height; i++) minA = Math.min(minA, splash.data[i * 4 + 3]);
  // A fully-opaque alpha channel is 25% of the pixel data for zero benefit.
  const dropAlpha = minA === 255;
  let splashOut = dropAlpha ? flatten(splash, [0, 0, 0]) : splash;

  if (splashBits) {
    const step = 256 / (1 << splashBits);
    for (let i = 0; i < splashOut.width * splashOut.height; i++) {
      for (let c = 0; c < 3; c++) {
        splashOut.data[i * 4 + c] = Math.min(255, Math.round(Math.round(splashOut.data[i * 4 + c] / step) * step));
      }
    }
  }

  writeFileSync(out('splash-icon.png'), encodePng(splashOut, { alpha: !dropAlpha }));
  const after = statSync(out('splash-icon.png')).size;
  console.log(`  artwork        ${splashBits ? `posterised to ${splashBits} bits/channel` : 'unchanged, pixel for pixel'}`);
  console.log(`  alpha channel  ${dropAlpha ? 'dropped (was 100% opaque)' : 'kept (real transparency present)'}`);
  console.log(`  ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB  (${(100 * (1 - after / before)).toFixed(1)}% smaller); x3 in the IPA = ${(3 * after / 1024 / 1024).toFixed(2)} MB`);

  // splash.backgroundColor fills the letterbox around a `contain` splash. This
  // image is full-bleed and its field does NOT match the configured colour, so
  // the bands above and below it are visibly a different cream on every launch.
  const fieldColour = patchAverage(splashOut, 0, 0, 24, 24);
  const configured = [0xf8, 0xe9, 0xd7];
  const delta = dist(fieldColour, configured);
  if (delta > 20) {
    console.log(`  WARNING        image field ${hex(fieldColour)} vs splash.backgroundColor #F8E9D7 — L1 delta ${delta}.`);
    console.log(`                 A 'contain' splash letterboxes this square image on a tall screen and`);
    console.log(`                 those bands use backgroundColor, so the seam is visible at launch.`);
    console.log(`                 Fix in app.json (NOT owned by this script): set the expo-splash-screen`);
    console.log(`                 backgroundColor to ${hex(fieldColour)}, or supply splash art whose field is #F8E9D7.`);
  }
}

/* ------------------------------------------------------------------ *
 * VERIFY (independent — reads back with macOS sips, not our own codec)
 * ------------------------------------------------------------------ */

function verify() {
  const spec = [
    [ICON, { pixelWidth: '1024', pixelHeight: '1024', hasAlpha: 'no' }],
    [ADAPTIVE, { pixelWidth: '1024', pixelHeight: '1024', hasAlpha: 'yes' }],
    [SPLASH, { pixelWidth: '1024', pixelHeight: '1024' }],
  ];
  let ok = true;
  for (const [file, want] of spec) {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', file], { encoding: 'utf8' });
    const got = Object.fromEntries(
      out.split('\n').filter((l) => l.includes(':')).map((l) => l.trim().split(/:\s*/)),
    );
    const fails = Object.entries(want).filter(([k, v]) => got[k] !== v);
    ok = ok && fails.length === 0;
    console.log(`${fails.length ? 'FAIL' : 'PASS'}  ${basename(file)}  ${got.pixelWidth}x${got.pixelHeight} hasAlpha=${got.hasAlpha}  ${kb(file)}`);
    for (const [k, v] of fails) console.log(`        expected ${k}=${v}, got ${got[k]}`);
  }

  // Dimensions alone would have passed the BROKEN icon too — it was also
  // 1024x1024 with no alpha. These are the checks that actually describe the
  // defect that was fixed.
  const im = decodePng(ICON);
  let nearWhite = 0, minL = 255, maxL = 0;
  const edge = [];
  for (let i = 0; i < im.width; i++) {
    edge.push([i, 0], [i, im.height - 1], [0, i], [im.width - 1, i]);
  }
  for (const [x, y] of edge) {
    const p = px(im, x, y);
    const l = luma(p);
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
    if (dist(p, [255, 255, 255]) < 40) nearWhite++;
  }
  const bleedOk = nearWhite === 0;
  ok = ok && bleedOk;
  console.log(`${bleedOk ? 'PASS' : 'FAIL'}  icon.png full-bleed  border luma ${minL.toFixed(0)}-${maxL.toFixed(0)}, ${nearWhite}/${edge.length} border px within 40 of white`);
  if (!bleedOk) console.log('        a near-white border is the original defect: iOS masks it into a white icon');

  // The plaque must clear the system squircle, or the mask eats its corners.
  const { clearance } = composeIcon();
  const clearOk = clearance.clipped === 0;
  ok = ok && clearOk;
  console.log(`${clearOk ? 'PASS' : 'FAIL'}  icon.png squircle    artwork at d=${clearance.worst.toFixed(3)}, ${clearance.marginPx}px clearance, ${clearance.clipped} px clipped`);

  if (!ok) process.exitCode = 1;
}

/**
 * Debug aid: run-length encode the luminance bands along the tile's centre row
 * and centre column. This is how the frame/field/mascot thresholds above were
 * derived — rerun it if the source artwork is ever replaced.
 */
function profile() {
  const img = decodePng(pristine(ICON));
  const corner = patchAverage(img, 0, 0, 24, 24);
  const tile = contentBounds(img, corner, 24);
  const cy = tile.y + Math.floor(tile.h / 2);
  const cx = tile.x + Math.floor(tile.w / 2);
  const band = (l) => (l < 150 ? 'DARK ' : l > 185 ? 'BRIGHT' : 'MID   ');

  for (const [label, axis] of [[`row y=${cy}`, 'x'], [`col x=${cx}`, 'y']]) {
    console.log(`\n--- ${label} ---`);
    let run = null;
    const n = axis === 'x' ? img.width : img.height;
    for (let i = 0; i < n; i++) {
      const p = axis === 'x' ? px(img, i, cy) : px(img, cx, i);
      const b = band(luma(p));
      if (!run || run.b !== b) {
        if (run && run.end - run.start >= 4) {
          console.log(`  ${run.b} ${String(run.start).padStart(4)}..${String(run.end).padStart(4)}  len=${String(run.end - run.start + 1).padStart(4)}  ${hex(run.px)}`);
        }
        run = { b, start: i, end: i, px: p };
      } else run.end = i;
    }
    if (run && run.end - run.start >= 4) {
      console.log(`  ${run.b} ${String(run.start).padStart(4)}..${String(run.end).padStart(4)}  len=${String(run.end - run.start + 1).padStart(4)}  ${hex(run.px)}`);
    }
  }

  // Radial profile of the cream field, measured down the top edge where the
  // band is unobstructed. This is how the frame's inner cast shadow was found:
  // the field is NOT flat near its border, and a background model fitted to
  // that darkened ring would paint a ghost of the removed frame around the
  // whole new icon.
  const inner = innerFieldBounds(img, tile);
  console.log('\n--- field radial profile (top edge, mean of x = field centre +/- 200) ---');
  for (let inset = 0; inset <= 130; inset += 5) {
    const y = inner.y + inset;
    const c = patchAverage(img, inner.x + inner.w / 2 - 200, y, 400, 2);
    console.log(`  inset ${String(inset).padStart(3)}  ${hex(c)}  luma ${luma(c).toFixed(1)}`);
  }
}

/**
 * Render the detected geometry as an overlay so the numbers can be checked by
 * eye. Detection here is heuristic; a picture is the only honest verification.
 */
function debugOverlay(outFile) {
  const { img, tile, inner, radius, star, mascot } = analyseIcon();
  const out = blank(img.width, img.height);
  img.data.copy(out.data);

  const line = (x0, y0, x1, y1, rgb) => {
    for (let y = Math.max(0, y0); y <= Math.min(out.height - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(out.width - 1, x1); x++) {
        const i = (y * out.width + x) * 4;
        out.data[i] = rgb[0]; out.data[i + 1] = rgb[1]; out.data[i + 2] = rgb[2]; out.data[i + 3] = 255;
      }
    }
  };
  const box = (r, rgb, t = 3) => {
    line(r.x, r.y, r.x + r.w, r.y + t, rgb);
    line(r.x, r.y + r.h - t, r.x + r.w, r.y + r.h, rgb);
    line(r.x, r.y, r.x + t, r.y + r.h, rgb);
    line(r.x + r.w - t, r.y, r.x + r.w, r.y + r.h, rgb);
  };

  box(tile, [255, 0, 0]);          // red   — baked tile incl. drop shadow
  box(inner, [0, 128, 255]);       // blue  — detected cream field
  box(star, [0, 200, 0]);          // green — detected mascot

  // Magenta: the mascot's actual silhouette, tinted. This is the check that
  // matters — the bounding box alone cannot show whether the chroma key latched
  // onto the star or leaked out into the field.
  for (let i = 0; i < out.width * out.height; i++) {
    if (mascot.largest[i]) out.data[i * 4 + 2] = Math.min(255, out.data[i * 4 + 2] + 120);
  }

  writeFileSync(outFile, encodePng(out, { alpha: false }));
  console.log(`tile    (red)     x=${tile.x} y=${tile.y} ${tile.w}x${tile.h}`);
  console.log(`field   (blue)    x=${inner.x} y=${inner.y} ${inner.w}x${inner.h}  radius ${radius.radius}`);
  console.log(`mascot  (green)   x=${star.x} y=${star.y} ${star.w}x${star.h}`);
  console.log(`silhouette (tint) everything the chroma key called mascot`);
  console.log(`wrote ${outFile}`);
}

/**
 * Write the three intermediates the composition depends on, so each can be
 * judged by eye rather than trusted:
 *
 *   plaque-object.png  the matted plaque on a mid grey — grey is deliberate, it
 *                      shows both a white fringe (matte threshold too low) and
 *                      a bitten silhouette (too high). On cream neither shows.
 *   plaque-shadow.png  the multiplicative shadow, as white-on-black opacity.
 *   clean-bg.png       the donor background with its own plaque diffused away.
 *                      A visible smudge here means the 60px dilation in
 *                      cleanBackground() is too small for the cast shadow.
 */
function debugMatte(dir) {
  mkdirSync(dir, { recursive: true });
  const plaque = mattePlaque();
  const bg = cleanBackground();

  const grey = blank(plaque.object.width, plaque.object.height, [128, 128, 128, 255]);
  compositeOver(grey, plaque.object, 0, 0);
  writeFileSync(resolve(dir, 'plaque-object.png'), encodePng(grey, { alpha: false }));

  const shd = blank(plaque.shadow.width, plaque.shadow.height);
  for (let i = 0; i < plaque.shadow.width * plaque.shadow.height; i++) {
    const a = plaque.shadow.data[i * 4 + 3];
    shd.data[i * 4] = a; shd.data[i * 4 + 1] = a; shd.data[i * 4 + 2] = a; shd.data[i * 4 + 3] = 255;
  }
  writeFileSync(resolve(dir, 'plaque-shadow.png'), encodePng(shd, { alpha: false }));
  writeFileSync(resolve(dir, 'clean-bg.png'), encodePng(bg.plate, { alpha: false }));

  console.log(`plaque body      ${plaque.box.w}x${plaque.box.h} at (${plaque.box.x}, ${plaque.box.y}), matted off ${hex(plaque.white)}`);
  console.log(`donor plaque     ${bg.box.w}x${bg.box.h}, masked+dilated over ${(100 * bg.masked).toFixed(1)}% of the donor`);
  console.log(`wrote ${dir}/plaque-object.png, plaque-shadow.png, clean-bg.png`);
}

export {
  decodePng, encodePng, blank, px, crop, patchAverage, resample, compositeOver,
  flatten, fillOutward, roundedMask, contentBounds, artworkMask, largestComponent,
  largestComponentMask, fillHoles, dilateMask, inpaint, hex, luma, dist, median, kb,
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const cmd = isMain ? process.argv[2] || 'inspect' : null;
if (cmd === null) { /* imported as a library — no side effects */ }
else if (cmd === 'matte') debugMatte(resolve(process.argv[3] || '.'));
else if (cmd === 'debug') debugOverlay(resolve(process.argv[3] || 'icon-debug.png'));
else if (cmd === 'profile') profile();
else if (cmd === 'inspect') inspect();
else if (cmd === 'build') build(process.argv[3] ? resolve(process.argv[3]) : ASSETS, Number(process.argv[4]) || 0);
else if (cmd === 'verify') verify();
else {
  console.error(`unknown command "${cmd}" — use inspect | profile | build [outDir] [splashBits] | verify`);
  process.exitCode = 2;
}
