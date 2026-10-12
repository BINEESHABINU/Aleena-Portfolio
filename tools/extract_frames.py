#!/usr/bin/env python3
"""
Step 3.3 of the cursor-tracking hero workflow.

Reads the Google Flow video (head turning through all directions, neutral pose at
the END) and pre-extracts everything the website needs, so the browser never has to
seek or play the MP4:

    assets/hero/frames/frame-00.webp ... frame-63.webp   64 frames, ~5.6 deg apart
    assets/hero/frames/center.webp                        looking straight at camera
    assets/hero/frames/meta.json + meta.js                bg colour, size, face centre

Frame i is the pose the head has when the cursor sits at angle  i * 360/64  from the
face (0 = cursor to the RIGHT, 90 = BELOW, 180 = LEFT, 270 = ABOVE).

Usage:
    pip install opencv-python numpy
    python tools/extract_frames.py character.mp4
    python tools/extract_frames.py character.mp4 --out assets/hero/frames --count 64
"""
import argparse, json, math, os, sys
import cv2
import numpy as np

p = argparse.ArgumentParser()
p.add_argument("video")
p.add_argument("--out", default="assets/hero/frames")
p.add_argument("--count", type=int, default=64)
p.add_argument("--quality", type=int, default=92, help="WebP quality 1-100")
p.add_argument("--center", type=int, default=-1, help="frame number of the neutral pose (default: last frame)")
a = p.parse_args()

cap = cv2.VideoCapture(a.video)
if not cap.isOpened():
    sys.exit("Could not open " + a.video)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
cap.release()
n = len(frames)
if n < 16:
    sys.exit(f"Only {n} frames found - is this the right video?")
H, W = frames[0].shape[:2]
print(f"video: {n} frames, {W}x{H}")

# ---- 1. background colour (median of the border pixels of the first frame) ----------
b = np.concatenate([frames[0][:8].reshape(-1, 3), frames[0][-8:].reshape(-1, 3),
                    frames[0][:, :8].reshape(-1, 3), frames[0][:, -8:].reshape(-1, 3)])
bg = np.median(b, axis=0).astype(int)                    # BGR
bg_hex = "#{:02x}{:02x}{:02x}".format(bg[2], bg[1], bg[0])
print("background:", bg_hex)

# ---- 2. where is the face in every frame? --------------------------------------------
# Skin pixels (YCrCb) inside the subject's upper body. The face centroid moves in the
# direction the head turns, which is all we need to sort the frames by direction.
SCALE = 240 / W
def face_centroid(img):
    s = cv2.resize(img, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_AREA)
    fg = (np.linalg.norm(s.astype(int) - bg, axis=2) > 45).astype(np.uint8)
    ys, xs = np.nonzero(fg)
    if len(xs) < 50:
        return None
    top, bot = ys.min(), ys.max()
    band = np.zeros_like(fg); band[top: top + int((bot - top) * 0.62)] = 1     # head + neck area
    ycc = cv2.cvtColor(s, cv2.COLOR_BGR2YCrCb)
    skin = cv2.inRange(ycc, (0, 133, 77), (255, 178, 130)) > 0
    m = skin & (fg > 0) & (band > 0)
    if m.sum() < 30:
        m = (fg > 0) & (band > 0)
    yy, xx = np.nonzero(m)
    return np.array([xx.mean(), yy.mean()]) / np.array([s.shape[1], s.shape[0]])

pts = [face_centroid(f) for f in frames]
valid = [i for i, q in enumerate(pts) if q is not None]
ci = a.center if a.center >= 0 else valid[-1]
c = pts[ci]
print(f"neutral (center) frame: {ci}   face centre: x={c[0]:.3f} y={c[1]:.3f}")

# offsets of every frame from the neutral pose, as angle + strength
off = {i: (pts[i] - c) for i in valid}
mag = {i: float(np.hypot(*off[i])) for i in valid}
ang = {i: math.degrees(math.atan2(off[i][1], off[i][0])) % 360 for i in valid}   # y down, like the screen
mx = max(mag.values())
if mx < 0.004:
    sys.exit("The head barely moves in this video, so directions can't be told apart.")
ring = [i for i in valid if mag[i] >= 0.55 * mx]          # the 'looking far' poses
print(f"strongest head offset: {mx:.3f}; usable directional frames: {len(ring)}")

def ang_dist(x, y):
    d = abs(x - y) % 360
    return min(d, 360 - d)

# the 8 compass directions (printed so you can sanity-check the video)
names = ["RIGHT", "DOWN-RIGHT", "DOWN", "DOWN-LEFT", "LEFT", "UP-LEFT", "UP", "UP-RIGHT"]
for k, nm in enumerate(names):
    t = k * 45
    best = min(ring, key=lambda i: (ang_dist(ang[i], t), -mag[i]))
    print(f"  {nm:<10} -> video frame {best:>4}  (off by {ang_dist(ang[best], t):4.1f} deg)")

# ---- 3. 64 frames around the full circle ----------------------------------------------
os.makedirs(a.out, exist_ok=True)
for old in os.listdir(a.out):
    if old.endswith(".webp"):
        os.remove(os.path.join(a.out, old))
params = [cv2.IMWRITE_WEBP_QUALITY, a.quality]
step = 360.0 / a.count
for k in range(a.count):
    t = k * step
    best = min(ring, key=lambda i: (round(ang_dist(ang[i], t), 1), -mag[i]))
    cv2.imwrite(os.path.join(a.out, f"frame-{k:02d}.webp"), frames[best], params)
cv2.imwrite(os.path.join(a.out, "center.webp"), frames[ci], params)

meta = {"count": a.count, "bg": bg_hex, "width": W, "height": H,
        "face": {"x": round(float(c[0]), 4), "y": round(float(c[1]), 4)}}
json.dump(meta, open(os.path.join(a.out, "meta.json"), "w"), indent=2)
# meta.js lets the page read the same data even when index.html is opened straight from disk
open(os.path.join(a.out, "meta.js"), "w").write("window.HERO_META = " + json.dumps(meta) + ";\n")
print(f"done -> {a.out}  ({a.count} frames + center.webp + meta.json)")
