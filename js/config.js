/* Content and file paths: the things you edit most often. */

/* =====================================================================
   CONFIG — drop your own files in and set the paths here.
   Anything left as null uses the built-in placeholder.
   ===================================================================== */
const CONFIG = {
  navIcon: null,                      // e.g. "assets/nav-icon.png"
  avatar: {
    staticModel: null,                // e.g. "assets/avatar-static.glb"
    animatedModel: null,              // e.g. "assets/avatar-talking.glb"
    animationName: null               // optional clip name inside the animated model
  },
  introAudio: "assets/intro.m4a",                   // e.g. "assets/intro.mp3"
  // Caption timings in seconds. Adjust to match your recording.
  introCues: [
    { t: 0.7, text: "Hi! I'm Patricia." },
    { t: 2.8, text: "Nice to meet you." },
    { t: 4.4, text: "I'm a software engineer who's passionate about building things that immerse, connect and help people." }
  ],
  projectModels: {                    // e.g. "assets/segdimmer.glb"
    cone: "assets/cone.glb", segdimmer: "assets/segdimmer.glb", stickyar: "assets/stickyar.glb", artgal: "assets/artgal.glb"
  },
  futureAudio: {                      // e.g. "assets/interior.mp3"
    "interior decorating": "assets/interior-decorating.m4a", "making content": "assets/making-content.m4a", "living in LA": "assets/los-angeles.m4a"
  }
};

const PROJECTS = [
  { id: "cone", when: "Spring 2024", name: "Cone of Silence",
    blurb: "A Unity VR tool for a DARPA-funded research project. Teams plan strategy together on annotated battalion maps, with viewpoint sharing and time-synced playback.",
    tags: ["Unity", "C#", "VR", "Meta Quest", "Varjo XR-3"], link: null },
  { id: "segdimmer", when: "Fall 2023", name: "SegDimmer",
    blurb: "A mixed reality tool for Magic Leap that reads ambient light by region and adjusts segmented dimming, keeping virtual content visible during task guidance.",
    tags: ["Unity", "C#", "Magic Leap", "MLCamera API", "Segmented Dimming"],
    link: { href: "https://github.com/pbluc/SegDimmer", label: "SegDimmer on GitHub", icon: "github" } },
  { id: "stickyar", when: "Spring 2022", name: "StickyAR",
    blurb: "A cross-platform mobile sticky-note app for mixed reality. Pin notes to walls, save workspaces across physical spaces, and find your way with a minimap.",
    tags: ["Unity", "C#", "AR Foundation", "ARCore", "ARKit"],
    link: { href: "https://github.com/pbluc/StickyAR", label: "StickyAR on GitHub", icon: "github" } },
  { id: "artgal", when: "Summer 2021", name: "ARt Gal",
    blurb: "A social, art-sharing AR app for Android. Attach augmented effects to physical artwork, then discover nearby pieces and what others left on a map.",
    tags: ["Java", "Android", "ARCore", "Augmented Images", "Google Maps SDK", "Firebase"],
    link: { href: "https://drive.google.com/file/d/1ZX14min_zv4yYU89gADbT_s3iTIuN4Uy/view?usp=sharing", label: "ARt Gal demo video", icon: "play" } }
];

/* Short labels for the Experience tabs, in the same order as the roles in index.html. */
const ROLE_TABS = [
  { name: "Microsoft", year: "2024 – 26" },
  { name: "Lamont-Doherty", year: "2022 – 24" },
  { name: "Microsoft", year: "Intern · 2023" },
  { name: "Meta", year: "Intern · 2022" },
  { name: "Facebook", year: "Intern · 2021" }
];
