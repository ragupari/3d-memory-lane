"""Create royalty-free ambient soundscape and 4 romantic memory audio clips."""
import math
import os
import struct
import wave

os.makedirs("public/audio", exist_ok=True)
rate = 22050


def write_wav(filename: str, seconds: int, sample_fn):
    with wave.open(filename, "w") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        frames = bytearray()
        total = rate * seconds
        for i in range(total):
            t = i / rate
            env = min(1.0, t / 1.5, (seconds - t) / 1.5)
            val = max(-1.0, min(1.0, sample_fn(t) * env))
            frames.extend(struct.pack("<h", int(val * 14000)))
        out.writeframes(frames)


# 1. Main ambient background
write_wav(
    "public/audio/forest-ambient.wav",
    24,
    lambda t: sum(
        math.sin(2 * math.pi * f * t) * (0.7 + 0.3 * math.sin(2 * math.pi * t / 24 + j))
        for j, f in enumerate([130.8128, 196.0, 261.6256, 329.6276])
    )
    / 4
    * 0.36,
)

# 2. Paris Waltz Music Box (Amaj7 / Dmaj7 romantic arpeggio)
paris_notes = [220.0, 277.18, 329.63, 415.30, 440.0, 329.63, 293.66, 369.99, 440.0, 554.37, 440.0, 369.99]
def paris_fn(t: float) -> float:
    idx = int(t * 2.5) % len(paris_notes)
    local_t = (t * 2.5) % 1.0
    freq = paris_notes[idx]
    decay = math.exp(-local_t * 3.2)
    chime = (math.sin(2 * math.pi * freq * t) + 0.35 * math.sin(4 * math.pi * freq * t)) * decay
    pad = 0.22 * (math.sin(2 * math.pi * 220.0 * t) + math.sin(2 * math.pi * 277.18 * t))
    return (chime * 0.65 + pad) * 0.55

write_wav("public/audio/paris-valse.wav", 12, paris_fn)

# 3. Taj Mahal Moonlight Flute & Harp (Serene Raga Yaman inspired)
taj_notes = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 329.63]
def taj_fn(t: float) -> float:
    idx = int(t * 1.5) % len(taj_notes)
    local_t = (t * 1.5) % 1.0
    freq = taj_notes[idx]
    vibrato = math.sin(2 * math.pi * 5.2 * t) * 1.8
    env = math.sin(math.pi * local_t)
    flute = math.sin(2 * math.pi * (freq + vibrato) * t) * env
    tanpura = 0.25 * (math.sin(2 * math.pi * 130.81 * t) + 0.6 * math.sin(2 * math.pi * 196.0 * t))
    return (flute * 0.6 + tanpura) * 0.55

write_wav("public/audio/taj-moonlight-flute.wav", 12, taj_fn)

# 4. Kyoto Sakura Chimes (Pentatonic Koto & Wind Chime)
kyoto_notes = [293.66, 329.63, 392.00, 440.00, 587.33, 440.00, 392.00, 329.63]
def kyoto_fn(t: float) -> float:
    idx = int(t * 2.0) % len(kyoto_notes)
    local_t = (t * 2.0) % 1.0
    freq = kyoto_notes[idx]
    pluck = math.exp(-local_t * 4.5) * (
        math.sin(2 * math.pi * freq * t) + 0.5 * math.sin(6 * math.pi * freq * t)
    )
    breeze = 0.18 * math.sin(2 * math.pi * 146.83 * t) * (0.7 + 0.3 * math.sin(t * 1.5))
    return (pluck * 0.65 + breeze) * 0.55

write_wav("public/audio/kyoto-koto-chimes.wav", 12, kyoto_fn)

# 5. Venice Sunset Serenade (Warm Romantic Strings & Harbor Waves)
venice_notes = [196.00, 246.94, 293.66, 369.99, 392.00, 369.99, 293.66, 246.94]
def venice_fn(t: float) -> float:
    idx = int(t * 1.8) % len(venice_notes)
    local_t = (t * 1.8) % 1.0
    freq = venice_notes[idx]
    tremolo = 0.75 + 0.25 * math.sin(2 * math.pi * 6.5 * t)
    note = math.sin(2 * math.pi * freq * t) * math.exp(-local_t * 2.2) * tremolo
    chord = 0.25 * (math.sin(2 * math.pi * 196.0 * t) + math.sin(2 * math.pi * 246.94 * t))
    return (note * 0.6 + chord) * 0.55

write_wav("public/audio/venice-serenade.wav", 12, venice_fn)
