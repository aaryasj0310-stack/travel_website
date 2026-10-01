# Voyage — cinematic asset brief

No photographs or binary assets were generated. Every slot currently uses CSS colour, shapes and gradients, so the application works without these assets. These are editorial atmosphere, not a claim that a user's destination has a particular appearance. Do not use a single destination-specific photograph as if it identifies every trip.

## Integration

The five optional tokens in `frontend/css/variables.css` are `--media-landing`, `--media-planning`, `--media-budget`, `--media-closing`, and `--media-trip`. They default to `none`. Once a separate, explicitly authorized asset task supplies files, set each token to `url(...)`. No absent file is requested today.

Keep the gradient layer behind each image. Add a dark overlay if its contrast varies. For the hero, hide `.landscape-sun`, `.landscape-ridge`, and `.landscape-path` when replacing the illustration with photography. Keep `.hero-art::after` for text contrast. For trip headers the existing left-to-right dark gradient sits above `--media-trip`. Test image crops at 360, 390, 768, 1024 and 1440 px. Do not bake type, UI, logos, watermarks, or numbers into any image.

## 1. landing-hero

- **Location / token:** Landing page, right-hand arched composition; `--media-landing`.
- **Purpose:** The emotional invitation to travel, balanced against practical headline copy on the left.
- **Ratio:** 4:5 portrait master, at least 1600 × 2000. The desktop slot is tall; avoid an essential panoramic subject.
- **Subject / environment:** A winding path through layered Western Ghats hills, distant mist, a tiny traveler optional.
- **Framing / lens:** Elevated medium-wide view, 35 mm editorial landscape; natural perspective, not a drone panorama.
- **Light / mood:** Early morning after rain; quiet anticipation, breathable space.
- **Palette:** Muted sage, deep forest, warm straw highlights, cream haze. Natural, restrained saturation.
- **Composition / overlay:** Keep the ridge line in the upper third. The center carries “Take the scenic route”; a product ticket occupies the bottom quarter. Keep the important path visible above the ticket.
- **Negative space:** Soft unobstructed middle third, especially central 60%; no bright high-frequency detail behind white type.
- **Mobile crop:** Preserve the central 70%. No face or essential detail near the arched upper corners or lower ticket.
- **ChatGPT prompt:** “Create a premium editorial travel photograph for a thoughtful India-first itinerary planner. A softly winding footpath leads into layered Western Ghats hills after rain, a veil of morning mist between ridges, natural grass and subtle warm sunlight on the distant horizon. Vertical 4:5 frame, natural 35 mm lens perspective, cinematic but believable, quiet and contemplative, film-like colour restraint, deep forest and sage greens with pale straw and cream highlights. Place the interesting ridge line in the upper third, retain calm medium-dark negative space through the center for white typography, and avoid essential details in the bottom quarter which will be covered by a cream interface ticket. Central subject survives a narrow mobile crop and an arched top mask. No words, lettering, logos, UI, borders, watermarks, exaggerated HDR or neon colours.”

## 2. planning-story

- **Location / token:** Landing itinerary story; `--media-planning`.
- **Purpose:** Suggest a day unfolding at walking pace behind the itinerary preview.
- **Ratio:** 5:4 landscape master, at least 2000 × 1600.
- **Subject / environment:** A quiet stone lane in a historic Indian hill town, distant doorway or steps, restrained greenery.
- **Framing / lens:** Eye-level 35–50 mm, vertical lines kept natural; an invitation to walk into the frame.
- **Light / mood:** Soft morning side light, unhurried and personal.
- **Palette:** Stone, cream, muted olive, subdued terracotta.
- **Composition / overlay:** The itinerary sample occupies the bottom two-thirds. Architectural storytelling belongs mainly in the top third and edges. Small white caption at upper left.
- **Negative space:** Darker quiet upper-left strip for the caption; avoid a face or object behind the UI.
- **Mobile crop:** Center the lane; accept substantial bottom coverage and square cropping.
- **ChatGPT prompt:** “Photograph an inviting, quiet stone lane in a historic Indian hill town in soft morning light. Eye-level editorial travel photography, 40 mm natural lens, gently receding stone steps and one understated doorway, subtle greenery, no crowds or staged tourist props. Palette of cream plaster, weathered stone, muted olive and a trace of terracotta, sophisticated low saturation and natural texture. Landscape 5:4 composition. Place the strongest architectural details in the upper third and outer edges; the lower two-thirds will sit behind a cream itinerary interface, so keep it calm. Leave a darker uncluttered upper-left strip for a short white caption. Centered composition must work as a square mobile crop. No text, logos, watermarks, UI, maps, or recognizable brands.”

## 3. budget-story

- **Location / token:** Landing financial planning section; `--media-budget`.
- **Purpose:** Make budgeting feel like preparation for a good journey, without suggesting a banking product.
- **Ratio:** 4:5 portrait master, at least 1600 × 2000.
- **Subject / environment:** Sunlit train-window ledge or cafe table with a plain notebook, cup, folded linen and an out-of-focus landscape.
- **Framing / lens:** 50 mm lifestyle still-life, shallow but realistic depth, oblique tabletop view.
- **Light / mood:** Warm afternoon window light; calm, considered, optimistic.
- **Palette:** Oat, ivory, warm wood, sage shadow, forest accents.
- **Composition / overlay:** The budget preview covers the central 75%. Place objects at edges; no literal currency, legible receipts, phones or banking imagery.
- **Negative space:** Broad plain center, low visual clutter and no distracting high contrast.
- **Mobile crop:** Edge details may crop away; no object is essential to interpretation.
- **ChatGPT prompt:** “Create a cinematic travel lifestyle still-life viewed obliquely across a simple cafe table beside a train-station window: a plain closed notebook, a ceramic tea cup, a small fold of neutral linen, a soft glimpse of green hills beyond the glass. Premium editorial photography, 50 mm lens, natural depth of field, warm afternoon light, understated textures. Vertical 4:5 composition, oat and ivory with warm wood, sage shadows and deep forest accents. Keep the broad center intentionally uncluttered and place all objects near the edges because a large budget interface will overlay the central 75 percent. No money, coins, credit cards, recognizable brands, passports, legible papers, words, letters, logos, watermarks or UI. Warm and human, never a generic fintech advertisement.”

## 4. closing-cta

- **Location / token:** Landing closing call to action; `--media-closing`.
- **Purpose:** Return from practical planning to the feeling of going somewhere.
- **Ratio:** 21:9 landscape master, at least 2520 × 1080; optional separate 4:5 mobile composition later.
- **Subject / environment:** Quiet river bend or coastal headland at dusk, layered hills fading into the distance.
- **Framing / lens:** Wide 28–35 mm, grounded viewpoint, natural horizon.
- **Light / mood:** Blue-green dusk with a gentle warm horizon; reflective, expansive, reassuring.
- **Palette:** Deep forest, soft blue-green, pale warm horizon, no fluorescent sunset.
- **Composition / overlay:** Centered large white heading, supporting copy and cream button. Keep the entire central 55% dark and quiet.
- **Negative space:** Uninterrupted center. Use land forms as a frame at left and right.
- **Mobile crop:** Center crop remains a coherent atmospheric scene; no critical feature at the sides.
- **ChatGPT prompt:** “A quiet cinematic Indian coastal headland at dusk, gently layered hills and a still river bend meeting distant water, grounded 32 mm editorial landscape viewpoint. Wide 21:9 composition with deep forest and muted blue-green shadows, a pale warm horizon, subtle atmospheric depth and believable natural lighting. Landforms frame the far left and right, while the central 55 percent stays calm, dark and visually uncluttered for a centered white headline, short supporting line and cream button. The central crop alone must remain beautiful on a narrow phone. Contemplative, generous, quietly adventurous. No people near the center, no buildings dominating, no neon sunset, no letters, logos, watermark, text, border or interface.”

## 5. journey-header

- **Location / token:** Shared selected-trip header on Overview, Itinerary, Budget and Expenses; `--media-trip`.
- **Purpose:** Give the same journey a consistent visual atmosphere across its four views.
- **Ratio:** 5:1 panoramic master, at least 2500 × 500, with generous height for a 3:2 mobile crop.
- **Subject / environment:** Abstract landscape layers, mist and a curving path; deliberately not an identifiable landmark.
- **Framing / lens:** 50–70 mm compressed landscape, cropped to layered textures.
- **Light / mood:** Gentle late-afternoon side light, quiet anticipation.
- **Palette:** Forest, moss, sage and a trace of warm cream.
- **Composition / overlay:** Destination, dates and travelers occupy left two-thirds; status sits at the right. Keep left area dark. Put visual interest in right third.
- **Negative space:** Left 65% quiet low-contrast terrain, no distracting bright patches.
- **Mobile crop:** Background center/right retains atmosphere; text must stay legible over the retained gradient. This is generic atmosphere, not a destination photo.
- **ChatGPT prompt:** “Create a subtle photographic landscape texture for a travel journal header, layered non-identifiable green hills, soft mist and a slight curving path, 60 mm lens compression, natural late-afternoon light. A very wide 5:1 frame, sophisticated forest, moss and sage palette with small warm-cream highlights. Keep the left 65 percent dark, soft and low contrast for a large destination name and two lines of white details; concentrate visual interest in the right third. No identifiable landmarks so the image can be used as generic journey atmosphere. Retain enough layered texture for a center-right 3:2 mobile crop. No letters, labels, logos, border, watermark, UI, exaggerated HDR, or artificial neon light.”

## Acceptance after assets are added

- All text remains readable, including with the image unavailable.
- Crops preserve the intended negative space, ticket and preview overlays.
- Images are compressed and sized before delivery; do not use an image API at runtime.
- Decorative background images carry no essential information. Meaningful future destination photographs need descriptive alt text if introduced as content images.
- Replacing the illustrated fallback must not change layout, introduce motion, or obscure form actions.
