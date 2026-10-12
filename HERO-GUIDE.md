# Cursor-tracking hero — how to switch it on

The site is already wired for the workflow in the PDF. Until the frames exist, the original
single-image hero keeps working. Once `assets/hero/frames/` exists, the hero upgrades itself
automatically (no code changes).

## Step 1 — Image (ChatGPT)
Upload **your photo first**, then the red reference image from the PDF, then paste:

> Create a stylized 3D digital portrait using my uploaded photo as the PRIMARY IDENTITY REFERENCE and
> the second uploaded image as the STYLE, COMPOSITION, AND COLOR REFERENCE.
> Preserve my exact facial identity, facial structure, skin tone, hairstyle, and recognizable features
> from my photo. Do not replace or redesign my face.
> Recreate the reference image's overall look: high-quality polished 3D/animated character portrait,
> expressive large eyes, soft realistic skin shading, detailed hair strands, subtle blush, natural
> glossy lips, elegant facial proportions, and a friendly confident expression.
> Match the same framing and composition as the reference: centered head-and-shoulders portrait,
> looking slightly upward/to the side, with the subject occupying the central area and clean negative
> space around them.
> Use a bright vivid red background with a smooth clean gradient and strong visual contrast against
> the subject. Keep the background minimal with no objects or text.
> Make the result premium, polished, cinematic, highly detailed, smooth 3D-rendered illustration,
> while keeping my identity recognizable.
> Do not copy the reference person's identity. Use only its visual style, pose, framing, lighting,
> colors, and artistic treatment.

(This prompt needs no changes — it uses your photo for identity.)

## Step 2 — Video (Google Flow)
Give Flow the image from Step 1. **Change the character description line** — the PDF's version
describes the reference girl (curly hair, silver hoops, off-white sweater). Describe YOUR character
exactly as it appears in your generated image. Example for the current portrait:

> Use the provided character image as the exact visual reference.
> Create a smooth interactive-character animation designed specifically for a website cursor-tracking
> hero section.
> The character is a young woman with long wavy dark-brown hair, warm skin, large expressive dark brown
> eyes, a small red bow earring, and a black knit sweater with a red and cream pattern. Show only her
> head and shoulders against a perfectly solid bright red background.
> The camera must remain completely fixed and frontal.
> The animation must demonstrate CONTINUOUS directional head and eye movement, as if the character is
> naturally following a cursor moving freely around her.
> Create smooth transitions through all directions:
> center → up → upper-right → right → lower-right → down → lower-left → left → upper-left → center.
> Also include smooth diagonal positions between every major direction.
> The head movement must NOT jump between poses. Every directional change must blend smoothly and
> naturally, with subtle eye movement leading the head movement.
> Make the transitions fluid and continuous so that intermediate cursor positions would naturally
> correspond to intermediate head positions.
> Keep the character's face, hair, eyes, clothing, proportions, lighting and identity perfectly
> consistent throughout.
> Only the eyes, head and very subtle hair movement should animate.
> No talking. No lip movement. No body movement. No hand movement. No camera movement. No zoom.
> No background movement. The bright red background must remain perfectly flat and uniform.
> Smooth cinematic 3D cartoon animation, high-quality facial consistency, natural head rotation,
> subtle eye tracking, soft realistic motion, seamless directional transitions.

**Important:** the video must END on the neutral, look-straight-at-camera pose (the extractor uses the
last frame as `center.webp`). Download it as `character.mp4`.

## Step 3 — Build the frames (one command)
```
pip install opencv-python numpy
python tools/extract_frames.py character.mp4
```
It prints the video frame chosen for each of the 8 compass directions, then writes
`assets/hero/frames/` (64 WebP frames + `center.webp` + `meta.json` + `meta.js`).
Upload that folder with the site. Done.

If a direction looks wrong, the printout shows which video frame was used for it, and the
"off by" number shows how close the video got to that direction.

## Tuning (top of `hero-tracker.js`)
`LERP` 0.26 = tracking speed · `DEADZONE` 0.12 = how close the cursor must be to get eye contact
`IDLE_MS` = how long after a touch ends before she looks straight again.
