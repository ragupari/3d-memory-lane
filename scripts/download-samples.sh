#!/usr/bin/env bash
set -eu
names=(coast mountains ocean forest lake friends road sunset flowers city camp morning)
ids=(photo-1476514525535-07fb3b4ae5f1 photo-1464822759023-fed622ff2c3b photo-1507525428034-b723cf961d3e photo-1448375240586-882707db888b photo-1470770841072-f978cf4d019e photo-1529156069898-49953e39b3ac photo-1500534623283-312aade485b7 photo-1472120435266-53107fd0c44a photo-1490750967868-88aa4486c946 photo-1519501025264-65ba15a82390 photo-1504280390367-361c6d9f38f4 photo-1441974231531-c6227db76b6e)
for i in "${!names[@]}"; do
 curl -fsSL --retry 2 "https://images.unsplash.com/${ids[$i]}?auto=format&fit=crop&w=1400&q=85" -o "public/photos/${names[$i]}.jpg"
 curl -fsSL --retry 2 "https://images.unsplash.com/${ids[$i]}?auto=format&fit=crop&w=480&q=80" -o "public/photos/${names[$i]}-thumb.jpg"
done
