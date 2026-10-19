"""Create a quiet original 24-second ambient chord, loopable and royalty-free."""
import math, struct, wave
rate=22050
seconds=24
with wave.open('public/audio/forest-ambient.wav','w') as out:
    out.setnchannels(1);out.setsampwidth(2);out.setframerate(rate)
    frames=bytearray()
    for i in range(rate*seconds):
        t=i/rate
        envelope=min(1,t/3,(seconds-t)/3)
        tone=sum(math.sin(2*math.pi*f*t)*(.7+.3*math.sin(2*math.pi*t/seconds+j)) for j,f in enumerate([130.8128,196,261.6256,329.6276]))/4
        frames.extend(struct.pack('<h',int(tone*envelope*5000)))
    out.writeframes(frames)
