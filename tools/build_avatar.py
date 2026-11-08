"""Builds Patricia's faceless low-poly head avatar as a .glb (glTF 2.0 binary).

Style: flat-shaded facets, head + neck only, long straight near-black hair
with a middle part, a layered cut and face-framing pieces.
Units are metres, +Y up, the face looks toward +Z.

Usage (needs Python 3 and numpy):
    python tools/build_avatar.py assets/avatar-talking.glb --animated
        the site's avatar: adds the phantom mouth and its "Talk" animation
    python tools/build_avatar.py assets/avatar-static.glb
        a still version with no mouth
Optional: --brows adds eyebrows (left off on the site).
"""
import json, math, struct, sys
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else "avatar-static.glb"
ANIMATED = "--animated" in sys.argv   # adds a mouth and a looping "Talk" animation
BROWS = "--brows" in sys.argv         # adds low-poly eyebrows

# ---------------------------------------------------------------- head shape
# (y, half-width x, half-depth z, z offset) from crown to chin.
PROFILE = [
    (0.138, 0.000, 0.000, -0.006),
    (0.132, 0.034, 0.040, -0.007),
    (0.115, 0.062, 0.070, -0.008),
    (0.085, 0.083, 0.093, -0.006),
    (0.040, 0.091, 0.100, -0.004),
    (-0.010, 0.089, 0.097, 0.000),   # cheekbones
    (-0.058, 0.077, 0.087, 0.006),   # jaw
    (-0.094, 0.058, 0.072, 0.014),   # chin taper
    (-0.114, 0.040, 0.054, 0.024),   # chin
    (-0.123, 0.020, 0.030, 0.028),   # under the chin
    (-0.126, 0.000, 0.000, 0.028),
]
SEG = 10  # facets around the head: low enough to read as low-poly


def prof(y):
    """Interpolate the profile at height y (clamped)."""
    ys = [p[0] for p in PROFILE]
    if y >= ys[0]:
        return PROFILE[0][1:]
    if y <= ys[-1]:
        return PROFILE[-1][1:]
    for a, b in zip(PROFILE, PROFILE[1:]):
        if a[0] >= y >= b[0]:
            t = (a[0] - y) / (a[0] - b[0])
            return tuple(a[i] + (b[i] - a[i]) * t for i in (1, 2, 3))


def surf(theta, y, s=1.0):
    """Point on the head surface at angle theta (0 = front) and height y, pushed out by s."""
    rx, rz, zo = prof(y)
    return np.array([rx * s * math.sin(theta), y, rz * s * math.cos(theta) + zo])


def ring_mesh(rows_fn, n_cols, closed=True):
    """rows_fn(col) -> list of points (same length for every column). Returns triangles."""
    cols = [rows_fn(c) for c in range(n_cols)]
    tris = []
    rng = n_cols if closed else n_cols - 1
    for c in range(rng):
        a, b = cols[c], cols[(c + 1) % n_cols]
        for r in range(len(a) - 1):
            p00, p01, p10, p11 = a[r], a[r + 1], b[r], b[r + 1]
            tris += [(p00, p10, p11), (p00, p11, p01)]
    return tris


def hexa(c):
    """8 corners (bottom quad 0-3, top quad 4-7, same winding) -> 12 triangles."""
    f = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    tris = []
    for a, b, d, e in f:
        tris += [(c[a], c[b], c[d]), (c[a], c[d], c[e])]
    return tris


# head: rows follow the profile, columns go around
head = ring_mesh(lambda c: [surf(2 * math.pi * c / SEG, p[0]) for p in PROFILE], SEG)

# neck: 6-sided prism tucked up into the head
neck = []
N6, top, bot = 6, -0.05, -0.168
for i in range(N6):
    a0, a1 = 2 * math.pi * i / N6 + math.pi / 6, 2 * math.pi * (i + 1) / N6 + math.pi / 6
    def pt(a, y, r=0.043):
        return np.array([r * math.sin(a), y, r * 0.95 * math.cos(a) - 0.012])
    neck += [(pt(a0, bot), pt(a1, bot), pt(a1, top)), (pt(a0, bot), pt(a1, top), pt(a0, top))]
    neck += [(pt(a0, bot), np.array([0, bot, -0.012]), pt(a1, bot))]  # bottom cap

# ---------------------------------------------------------------- hair
HCOLS = 14


def hairline(theta):
    """Lowest point of the hair cap at each angle: high at the forehead, low at the back."""
    f = (1 + math.cos(theta)) / 2          # 1 at front, 0 at back
    th = math.atan2(math.sin(theta), math.cos(theta))
    part = 0.03 * max(0.0, 1 - abs(th) / 0.4)   # small notch at the centre part
    return 0.072 * f + (-0.05) * (1 - f) + part


def cap_rows(c):
    th = 2 * math.pi * c / HCOLS
    yh = hairline(th)
    crown = np.array([0, 0.152, -0.012])
    return [crown] + [surf(th, 0.138 + (yh - 0.138) * t, 1.14 - 0.05 * t) for t in (0.12, 0.35, 0.65, 1.0)]

hair = ring_mesh(cap_rows, HCOLS)

# hair body: one sheet that wraps the sides and back of the head. It is cut in
# layers: shortest at the front edges by the face, stepping longer toward the back.
# The bottom edge is uneven on purpose.
def body_rows(c, n=13, start=math.radians(58), end=math.radians(302)):
    th = start + (end - start) * c / (n - 1)
    side = min(1.0, abs(math.sin(th)) * 1.15)          # 1 at the sides, smaller at the back
    front = max(0.0, math.cos(th))                       # >0 only on the face-side columns
    bottom = -0.185 + 0.014 * ((c % 2) - 0.5) - 0.01 * side + 0.11 * front
    rows = []
    for y in (0.07, 0.03, -0.01):
        rows.append(surf(th, y, 1.085))
    for t, taper in ((0.3, 0.99), (0.58, 0.96), (0.8, 0.92), (1.0, 0.86)):
        y = -0.01 + (bottom + 0.01) * t
        rx, rz = 0.100 * taper, 0.104 * taper
        rows.append(np.array([rx * math.sin(th), y, rz * math.cos(th) - 0.012]))
    return rows

hair += ring_mesh(body_rows, 13, closed=False)

# face-framing layers: tapered pieces that fall from the temples in front of the
# main hair, a shorter one by the cheekbone and a longer one to the jaw, on each side.
def strand(side, th0, th1, y0, y1, w0, w1, scale, steps=6):
    secs = []
    for k in range(steps + 1):
        t = k / steps
        th = side * (th0 + (th1 - th0) * t)
        y = y0 + (y1 - y0) * t
        w = w0 + (w1 - w0) * t
        sc = 1.04 + (scale - 1.04) * min(1.0, t / 0.35)   # starts tucked under the cap
        base = surf(th, max(y, -0.03), sc); base[1] = y
        out = np.array([math.sin(th), 0, math.cos(th)])
        tan = np.array([math.cos(th), 0, -math.sin(th)])
        th_k = 0.011 * (1 - 0.5 * t)
        secs.append([base - tan * w, base + tan * w, base + tan * w + out * th_k, base - tan * w + out * th_k])
    tris = []
    for a, b in zip(secs, secs[1:]):
        tris += hexa(b + a)
    return tris

for sd in (1, -1):
    hair += strand(sd, math.radians(42), math.radians(52), 0.105, -0.06, 0.028, 0.004, 1.10)
    hair += strand(sd, math.radians(55), math.radians(61), 0.095, -0.112, 0.032, 0.005, 1.125)

# middle part: two mirrored pieces that start at the centre of the hairline and
# sweep outward and down to the temples, leaving a narrow V of forehead at the part.
def part_side(side):
    path = [(0.025, 0.134), (0.10, 0.118), (0.30, 0.088), (0.62, 0.058), (0.95, 0.025), (1.22, -0.005)]
    thick = [0.006, 0.012, 0.020, 0.026, 0.026, 0.020]
    rows = []
    for (th, y), t in zip(path, thick):
        th *= side
        rows.append([surf(th, y - t, 1.0), surf(th, y - t, 1.13),
                     surf(th, y + 0.014, 1.16), surf(th, y + 0.014, 1.0)])
    tris = []
    for a, b in zip(rows, rows[1:]):
        tris += hexa(a + b)
    return tris

hair += part_side(1) + part_side(-1)

# eyebrows: thin faceted wedges with a soft arch, thicker at the inner end
def brow(side):
    path = [(0.13, 0.026, 0.0105), (0.26, 0.033, 0.0100), (0.40, 0.035, 0.0086), (0.53, 0.028, 0.0058)]
    secs = []
    for th, y, h in path:
        th *= side
        secs.append([surf(th, y - h / 2, 1.008), surf(th, y - h / 2, 1.022),
                     surf(th, y + h / 2, 1.022), surf(th, y + h / 2, 1.008)])
    tris = []
    for a, b in zip(secs, secs[1:]):
        tris += hexa(a + b)
    return tris

brows = brow(1) + brow(-1) if BROWS else []

# phantom mouth (animated version only): a dark faceted oval on the lower face.
# It is built around its own centre so the animation can open and close it by
# scaling, and it shrinks to nothing when she isn't speaking.
MOUTH_Y = -0.060
MOUTH_C = surf(0, MOUTH_Y, 1.012)


def mouth():
    W, H, n = 0.03, 0.0125, 8
    ring = []
    for k in range(n):
        a = 2 * math.pi * k / n
        u, v = W * math.cos(a), H * math.sin(a)
        y = MOUTH_Y + v
        rx = prof(y)[0]
        ring.append(surf(math.asin(max(-1, min(1, u / rx))), y, 1.012) - MOUTH_C)
    mid = np.array([0, 0, 0.0015])
    return [(mid, ring[k], ring[(k + 1) % n]) for k in range(n)]

mouth_tris = mouth() if ANIMATED else []
MOUTH = (0.13, 0.04, 0.045)   # deep red-brown, darker than the skin

# ---------------------------------------------------------------- write glb
SKIN = (0.36, 0.22, 0.15)   # deep brown (sRGB)
HAIR = (0.07, 0.06, 0.065)  # near-black with a little warmth


def srgb_to_linear(c):
    return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c]


def finalize(tris, center):
    """Unindexed triangles with per-face normals (flat shading), wound to face outward."""
    pos, nrm = [], []
    for a, b, c in tris:
        n = np.cross(b - a, c - a)
        ln = np.linalg.norm(n)
        if ln < 1e-12:
            continue
        n = n / ln
        cen = (a + b + c) / 3
        if np.dot(n, cen - center) < 0:
            b, c, n = c, b, -n
        pos += [a, b, c]
        nrm += [n, n, n]
    return np.array(pos, np.float32), np.array(nrm, np.float32)


parts = [
    ("Skin", head + neck, np.array([0, -0.02, 0.0]), SKIN, False),
    ("Hair", hair, np.array([0, -0.02, -0.01]), HAIR, True),
]
if brows:
    parts.append(("Brows", brows, np.array([0, 0.0, 0.0]), HAIR, True))
if mouth_tris:
    parts.append(("Mouth", mouth_tris, np.array([0, 0, -0.05]), MOUTH, True))

bin_chunks, buffer_views, accessors, meshes, nodes, materials = [], [], [], [], [], []
offset = 0
for i, (name, tris, center, color, double) in enumerate(parts):
    pos, nrm = finalize(tris, center)
    for arr, kind in ((pos, "POSITION"), (nrm, "NORMAL")):
        data = arr.tobytes()
        buffer_views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(data), "target": 34962})
        acc = {"bufferView": len(buffer_views) - 1, "componentType": 5126, "count": len(arr), "type": "VEC3"}
        if kind == "POSITION":
            acc["min"] = pos.min(0).tolist(); acc["max"] = pos.max(0).tolist()
        accessors.append(acc)
        bin_chunks.append(data); offset += len(data)
    materials.append({"name": name, "doubleSided": double,
                      "pbrMetallicRoughness": {"baseColorFactor": srgb_to_linear(color) + [1.0],
                                               "metallicFactor": 0.0, "roughnessFactor": 0.85}})
    meshes.append({"name": name, "primitives": [{"attributes": {"POSITION": len(accessors) - 2, "NORMAL": len(accessors) - 1},
                                                 "material": i}]})
    nodes.append({"name": name, "mesh": i})
    print(name, len(pos) // 3, "triangles")

# Node layout: PatriciaHead sits at the base of the neck so it can nod and tilt
# from there; Model moves the meshes back up so the head stays centred.
PIVOT_Y = -0.15
nodes.append({"name": "Model", "translation": [0, -PIVOT_Y, 0], "children": list(range(len(parts)))})
nodes.append({"name": "PatriciaHead", "translation": [0, PIVOT_Y, 0], "children": [len(nodes) - 1]})
root = len(nodes) - 1
animations = []
HIDDEN = [1e-4, 1e-4, 1e-4]
mouth_node = next((i for i, p in enumerate(parts) if p[0] == "Mouth"), None)
if mouth_node is not None:
    nodes[mouth_node]["translation"] = [float(v) for v in MOUTH_C]
    nodes[mouth_node]["scale"] = HIDDEN       # invisible unless the animation is playing


def add_data(arr, kind, with_minmax=False):
    global offset
    arr = np.asarray(arr, np.float32)
    data = arr.tobytes()
    buffer_views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(data)})
    bin_chunks.append(data); offset += len(data)
    acc = {"bufferView": len(buffer_views) - 1, "componentType": 5126, "count": len(arr), "type": kind}
    if with_minmax:
        acc["min"] = [float(arr.min())]; acc["max"] = [float(arr.max())]
    accessors.append(acc)
    return len(accessors) - 1


def quat(axis, ang):
    s = math.sin(ang / 2)
    return np.array([axis[0] * s, axis[1] * s, axis[2] * s, math.cos(ang / 2)])


def qmul(a, b):
    x1, y1, z1, w1 = a; x2, y2, z2, w2 = b
    return np.array([w1*x2 + x1*w2 + y1*z2 - z1*y2, w1*y2 - x1*z2 + y1*w2 + z1*x2,
                     w1*z2 + x1*y2 - y1*x2 + z1*w2, w1*w2 - x1*x2 - y1*y2 - z1*z2])


if ANIMATED:
    # "Talk": the head stays still and only the mouth moves. The beats below are
    # timed from assets/intro.m4a (9.8 s): one beat per syllable, sized by how
    # loud it is, with the mouth hidden while she pauses. The animation and the
    # audio start together, so the mouth follows the recording all the way through.
    # Each entry is (seconds, how wide it opens); None marks a pause. Each group
    # below ends with the pause that follows the words in its comment.
    beats = [
        # start: silence before speaking
        (None, 0.802),
        # "Hi!"
        (0.370, 1.00), (None, 0.580),
        # "I'm Patricia."
        (0.175, 0.79), (0.155, 0.40), (0.175, 0.55), (0.215, 0.57), (None, 0.670),
        # "Nice to meet you."
        (0.190, 0.60), (0.185, 0.45), (0.275, 0.68), (0.290, 0.58), (None, 0.750),
        # "I'm a software engineer who's passionate ..." (first part, up to a short breath)
        (0.270, 0.84), (0.185, 0.78), (0.220, 0.61), (0.230, 0.61), (0.220, 0.40), (0.225, 0.70), (0.175, 0.45), (0.260, 0.57), (0.315, 0.61), (0.240, 0.54), (0.240, 0.63), (None, 0.110),
        # "... immerse, connect and help people." (rest of the sentence)
        (0.390, 0.57), (0.375, 0.56), (0.305, 0.50), (0.215, 0.59), (0.175, 0.75), (0.220, 0.56), (None, 0.768),
    ]
    FPS = 30
    timeline = []                     # (start, end, peak or None)
    t0 = 0.0
    for dur, peak in beats:
        if dur is None:
            timeline.append((t0, t0 + peak, None)); t0 += peak
        else:
            timeline.append((t0, t0 + dur, peak)); t0 += dur
    LOOP = t0

    def mouth_scale(t):
        for a0, a1, peak in timeline:
            if a0 <= t < a1:
                if peak is None:
                    return HIDDEN
                o = peak * math.sin(math.pi * (t - a0) / (a1 - a0)) ** 0.9
                return [1.0 - 0.2 * o, 0.12 + 0.88 * o, 1.0]
        return HIDDEN

    times = [k / FPS for k in range(int(LOOP * FPS) + 1)]
    times[-1] = LOOP
    scales = [mouth_scale(t) for t in times[:-1]] + [HIDDEN]
    t_acc = add_data(np.array(times), "SCALAR", True)
    s_acc = add_data(np.array(scales), "VEC3")
    animations.append({"name": "Talk",
                       "samplers": [{"input": t_acc, "output": s_acc, "interpolation": "LINEAR"}],
                       "channels": [{"sampler": 0, "target": {"node": mouth_node, "path": "scale"}}]})
    print("Talk loop", round(LOOP, 2), "s")

binary = b"".join(bin_chunks)
gltf = {
    "asset": {"version": "2.0", "generator": "patricia-luc avatar script"},
    "scene": 0,
    "scenes": [{"nodes": [root]}],
    "nodes": nodes,
    "meshes": meshes, "materials": materials,
    "accessors": accessors, "bufferViews": buffer_views,
    "buffers": [{"byteLength": len(binary)}],
}
if animations:
    gltf["animations"] = animations
js = json.dumps(gltf, separators=(",", ":")).encode()
js += b" " * ((4 - len(js) % 4) % 4)
binary += b"\0" * ((4 - len(binary) % 4) % 4)
total = 12 + 8 + len(js) + 8 + len(binary)
with open(OUT, "wb") as f:
    f.write(struct.pack("<III", 0x46546C67, 2, total))
    f.write(struct.pack("<II", len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack("<II", len(binary), 0x004E4942)); f.write(binary)
print("wrote", OUT, total, "bytes")

