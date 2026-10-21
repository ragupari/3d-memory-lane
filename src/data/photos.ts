import type {
  MemoryPhoto,
  PathDefinition,
  PathId,
  RomanticThemeId,
} from "../types/memory";

export const romanticPaths: PathDefinition[] = [
  {
    id: "paris-path",
    name: "Pont des Arts Promenade",
    shortName: "Entry Bridge · Seine",
    event: "First Stroll on the Bridge",
    subtitle: "Sunlit stone balustrades, vintage lamps & Eiffel Tower views",
    theme: "eiffel-tower",
    landmarkName: "Pont des Arts, Paris",
    connectedPaths: ["taj-path", "kyoto-path", "venice-path"],
    accentColor: "#ff9ebb",
    turnDirection: "straight",
  },
  {
    id: "taj-path",
    name: "West Rose Garden Bridge",
    shortName: "Left Branch · Rose Arch",
    event: "Afternoon Among the Blossoms",
    subtitle: "Turning left onto the rose-draped bridge over the river",
    theme: "eiffel-tower",
    landmarkName: "West Bank Rose Bridge",
    connectedPaths: ["paris-path", "kyoto-path", "venice-path"],
    accentColor: "#ffb86c",
    turnDirection: "left",
  },
  {
    id: "kyoto-path",
    name: "East Lantern Cross-Bridge",
    shortName: "Right Branch · Lantern Walk",
    event: "Golden Hour by the Lamps",
    subtitle: "Crossing the lateral stone arches toward the East Bank",
    theme: "eiffel-tower",
    landmarkName: "East Seine Lantern Bridge",
    connectedPaths: ["taj-path", "venice-path", "paris-path"],
    accentColor: "#7ad6f5",
    turnDirection: "right",
  },
  {
    id: "venice-path",
    name: "Eiffel Belvedere Overlook",
    shortName: "North Plaza · Eiffel Vista",
    event: "Promise Beneath the Tower",
    subtitle: "Where all bridge branches meet before the Eiffel Tower",
    theme: "eiffel-tower",
    landmarkName: "Champ de Mars Belvedere",
    connectedPaths: ["kyoto-path", "paris-path", "taj-path"],
    accentColor: "#ffe082",
    turnDirection: "straight",
  },
];

export const romanticThemes: {
  id: RomanticThemeId;
  label: string;
  landmark: string;
}[] = [
  {
    id: "eiffel-tower",
    label: "Parisian Bridge Vista",
    landmark: "Eiffel Tower & Seine Bridge",
  },
];

export function getPathById(id: PathId): PathDefinition {
  return romanticPaths.find((p) => p.id === id) ?? romanticPaths[0];
}

/** Add a local image, video, or audio entry here. IDs must be unique and stable. */
export const photos: MemoryPhoto[] = [
  // === BRANCH 1: PONT DES ARTS PROMENADE (Entry Bridge) ===
  {
    id: "1",
    type: "photo",
    pathId: "paris-path",
    event: "",
    src: "/photos/1.jpg",
    thumbnail: "/photos/1.jpg",
    title: "My Baby Girl",
    description:
      "Forever in love with your inner baby girl: the girl who sings, dances, does exactly what she wants, and simply loves being loved.",
    caption:
      "Forever in love with your inner baby girl: the girl who sings, dances, does exactly what she wants, and simply loves being loved.",
    time: "04:15 PM · Sunlit Promenade",
    date: "",
    location: "Pont des Arts, Paris",
  },
  {
    id: "2",
    type: "photo",
    pathId: "paris-path",
    event: "",
    src: "/photos/2.jpg",
    thumbnail: "/photos/2.jpg",
    title: "Those few minutes",
    description:
      "You have no idea how I waited for those few minutes, just to see your smile, your eyes.",
    caption:
      "You have no idea how I waited for those few minutes, just to see your smile, your eyes.",
    time: "04:15 PM · Sunlit Promenade",
    date: "",
    location: "Pont des Arts, Paris",
  },
  {
    id: "3",
    type: "video",
    pathId: "paris-path",
    event: "First Stroll on the Bridge",
    src: "/videos/1.mp4",
    thumbnail: "/videos/1.mp4",
    videoSrc: "/videos/1.mp4",
    duration: "",
    title: "Stunning Beauty",
    description:
      "It’s not the saree that’s gorgeous, it’s you who made the saree look good.",
    caption:
      "It’s not the saree that’s gorgeous, it’s you who made the saree look good.",
    time: "04:42 PM · River Breeze",
    date: "",
    location: "Pont Alexandre III, Paris",
  },
  // {
  //   id: "paris-valse-audio",
  //   type: "audio",
  //   pathId: "paris-path",
  //   event: "First Stroll on the Bridge",
  //   src: "/photos/road.jpg",
  //   thumbnail: "/photos/road.jpg",
  //   audioSrc: "/audio/paris-valse.wav",
  //   duration: "0:12",
  //   title: "Bridge Accordion & Music Box Waltz",
  //   description:
  //     "Listen to the delicate Parisian waltz echoing from the first bridge rotunda while gentle waves lapped against the stone piers below.",
  //   caption:
  //     "Listen to the delicate Parisian waltz echoing from the first bridge rotunda while gentle waves lapped against the stone piers below.",
  //   time: "05:05 PM · Rotunda Melody",
  //   date: "2024-10-14",
  //   location: "Place de la Seine, Paris",
  // },

  // === BRANCH 2: WEST ROSE GARDEN BRIDGE (Left Turn Branch) ===
  {
    id: "taj-dawn-photo",
    type: "photo",
    pathId: "taj-path",
    event: "",
    src: "/photos/3.jpg",
    thumbnail: "/photos/3.jpg",
    title: "The New Year",
    description:
      "On New Year at Nallur, you passed me so close, I wanted to tap you on the shoulder and say hi, but I didn’t. You looked so beautiful and elegant in that red top.”",
    caption:
      "On New Year at Nallur, you passed me so close, I wanted to tap you on the shoulder and say hi, but I didn’t. You looked so beautiful and elegant in that red top.”",
    time: "05:20 PM · Rose Terrace",
    date: "",
    location: "West Rose Bridge, Paris",
  },
  // {
  //   id: "taj-reflection-video",
  //   type: "video",
  //   pathId: "taj-path",
  //   event: "",
  //   src: "/photos/lake.jpg",
  //   thumbnail: "/photos/lake.jpg",
  //   videoSrc: "/videos/taj-reflection.mp4",
  //   duration: "0:06",
  //   title: "Turquoise Seine Reflections",
  //   description:
  //     "Ripples shimmering across the bright blue river below the west bridge arch as warm lantern light began to glow inside the vintage streetlamps.",
  //   caption:
  //     "Ripples shimmering across the bright blue river below the west bridge arch as warm lantern light began to glow inside the vintage streetlamps.",
  //   time: "05:45 PM · Water Mirror",
  //   date: "2024-11-22",
  //   location: "Île aux Cygnes Walkway",
  // // },
  // {
  //   id: "taj-flute-audio",
  //   type: "audio",
  //   pathId: "taj-path",
  //   event: "Afternoon Among the Blossoms",
  //   src: "/photos/mountains.jpg",
  //   thumbnail: "/photos/mountains.jpg",
  //   audioSrc: "/audio/taj-moonlight-flute.wav",
  //   duration: "0:12",
  //   title: "Whispered Flute by the Stone Arch",
  //   description:
  //     "A serene acoustic flute melody recorded at the west bridge overlook while the breeze rustled through the lush green canopy overhead.",
  //   caption:
  //     "A serene acoustic flute melody recorded at the west bridge overlook while the breeze rustled through the lush green canopy overhead.",
  //   time: "06:00 PM · West Pavilion",
  //   date: "2024-11-22",
  //   location: "Jardin des Roses Bridge",
  // },

  // === BRANCH 3: EAST LANTERN CROSS-BRIDGE (Right Turn Branch) ===
  {
    id: "kyoto-blossoms-photo",
    type: "photo",
    pathId: "kyoto-path",
    event: "Golden Hour by the Lamps",
    src: "/photos/4.PNG",
    thumbnail: "/photos/4.PNG",
    title: "With Love",
    description:
      "We’re long distance, so we fantasised about being together and made AI-generated pics of us. Yes, I was cringe, but cringe is good.",
    caption:
      "We’re long distance, so we fantasised about being together and made AI-generated pics of us. Yes, I was cringe, but cringe is good.",
    time: "06:20 PM · Golden Breeze",
    date: "",
    location: "East Cross-Bridge, Paris",
  },
  // {
  //   id: "kyoto-sakura-video",
  //   type: "video",
  //   pathId: "kyoto-path",
  //   event: "Golden Hour by the Lamps",
  //   src: "/photos/forest.jpg",
  //   thumbnail: "/photos/forest.jpg",
  //   videoSrc: "/videos/sakura-breeze.mp4",
  //   duration: "0:06",
  //   title: "Sunbeams Through the Bridge Canopy",
  //   description:
  //     "Short video capturing the emerald leaves swaying over the bridge pillars as golden afternoon light painted warm shadows along our path.",
  //   caption:
  //     "Short video capturing the emerald leaves swaying over the bridge pillars as golden afternoon light painted warm shadows along our path.",
  //   time: "06:35 PM · Lantern Glow",
  //   date: "2025-04-03",
  //   location: "East Seine Walk",
  // },
  // {
  //   id: "kyoto-chimes-audio",
  //   type: "audio",
  //   pathId: "kyoto-path",
  //   event: "Golden Hour by the Lamps",
  //   src: "/photos/camp.jpg",
  //   thumbnail: "/photos/camp.jpg",
  //   audioSrc: "/audio/kyoto-koto-chimes.wav",
  //   duration: "0:12",
  //   title: "Harp & Chimes on the East Span",
  //   description:
  //     "Listen to the gentle plucked strings and chimes recorded where the east bridge curves back toward the northern belvedere.",
  //   caption:
  //     "Listen to the gentle plucked strings and chimes recorded where the east bridge curves back toward the northern belvedere.",
  //   time: "06:50 PM · East Rotunda",
  //   date: "2025-04-03",
  //   location: "Belleville Bridge Terrace",
  // },

  // === BRANCH 4: EIFFEL BELVEDERE OVERLOOK (North Converging Bridge) ===
  {
    id: "venice-coast-photo",
    type: "photo",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/5.PNG",
    thumbnail: "/photos/5.PNG",
    title: "Cutie Pie",
    description:
      "My rasagulla, so cute. I always lose every argument to those eyes. That Kalli look.",
    caption:
      "My rasagulla, so cute. I always lose every argument to those eyes. That Kalli look.",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
   {
    id: "6",
    type: "photo",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/6.jpg",
    thumbnail: "/photos/6.jpg",
    title: "Two But One",
    description:
      "Two but one heart, no distance can change that. I love you, Paddu kutty.",
    caption:
      "Two but one heart, no distance can change that. I love you, Paddu kutty.",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
   {
    id: "8",
    type: "photo",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/8.jpg",
    thumbnail: "/photos/8.jpg",
    title: "First Hug",
    description:
      "The American Corner, the first day I hugged you. Not exactly a hug, but it felt like more than that. Forever, I will be your safe place.",
    caption:
      "The American Corner, the first day I hugged you. Not exactly a hug, but it felt like more than that. Forever, I will be your safe place.",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
    {
    id: "venice-wserenade-audio",
    type: "audio",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/audio.jpg",
    thumbnail: "/photos/audio.jpg",
    audioSrc: "/audio/2.m4a",
    duration: "0:12",
    title: "You in All the Love Songs",
    description:
      "Suddenly, All the love songs in the world are about you.",
    caption:
      "Suddenly, All the love songs in the world are about you.",
    time: "08:00 PM · Belvedere Serenade",
    date: "",
    location: "Champ de Mars Belvedere, Paris",
  },
    {
    id: "11",
    type: "photo",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/11.jpg",
    thumbnail: "/photos/11.jpg",
    title: "That Jimikki",
    description:
      "காதோரமாய் ஊஞ்சல் கொடு பெண்ணே உன்கம்மல் போல் நான் ஆடுவேன்",
    caption:
      "காதோரமாய் ஊஞ்சல் கொடு பெண்ணே உன்கம்மல் போல் நான் ஆடுவேன்",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
   {
    id: "10",
    type: "photo",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/10.PNG",
    thumbnail: "/photos/10.PNG",
    title: "My Spotify",
    description:
      "The voice I love, my Spotify. No playlist could ever compare.",
    caption:
      "The voice I love, my Spotify. No playlist could ever compare.",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
  {
    id: "venice-sunset-video",
    type: "video",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/videos/2.mp4",
    thumbnail: "/videos/2.mp4",
    videoSrc: "/videos/2.mp4",
    duration: "0:07",
    title: "Pinnal",
    description:
      "Forver Adimai to that pinnal. Umma",
    caption:
      "Forver Adimai to that pinnal. Umma",
    time: "07:40 PM · Sunset Glow",
    date: "",
    location: "Pont d’Iéna Overlook, Paris",
  },
  {
    id: "venice2-sunset-video",
    type: "video",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/videos/2.mp4",
    thumbnail: "/videos/3.mov",
    videoSrc: "/videos/3.mov",
    duration: "2:07",
    title: "20",
    description:
      "It was your birthday, but it was me who got the gift.",
    caption:
      "It was your birthday, but it was me who got the gift.",
    date: "",
    location: "Pont d’Iéna Overlook, Paris",
  },
  {
    id: "venice-serenade-audio",
    type: "audio",
    pathId: "venice-path",
    event: "Promise Beneath the Tower",
    src: "/photos/audio.jpg",
    thumbnail: "/photos/audio.jpg",
    audioSrc: "/audio/1.opus",
    duration: "0:12",
    title: "Hmmm",
    description:
      "Call it humming if you want, I call it music. Your voice, my Spotify.",
    caption:
      "Call it humming if you want, I call it music. Your voice, my Spotify.",
    time: "08:00 PM · Belvedere Serenade",
    date: "",
    location: "Champ de Mars Belvedere, Paris",
  },{
    id: "13",
    type: "photo",
    pathId: "venice-path",
    event: "",
    src: "/photos/13.jpeg",
    thumbnail: "/photos/13.jpeg",
    title: "My Heart as Her Throne",
    description:
      "She is my cute little tyrant, ruling my heart as her dynasty.",
    caption:
      "She is my cute little tyrant, ruling my heart as her dynasty.",
    time: "07:15 PM · Golden Horizon",
    date: "",
    location: "Eiffel Belvedere, Paris",
  },
];
