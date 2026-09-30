# Patricia Luc — personal website

A one-page personal site: landing intro with a talking avatar, about, experience (one role at a time), a 3D project carousel, and a "what's next" section with floating phrases.

It is plain HTML, CSS and JavaScript split into small files. There is no build step and nothing to install.

## Structure

```
.
├── index.html                        page structure and text (About, Experience)
├── css/
│   └── styles.css                    all styling; colors and font at the top
├── js/
│   ├── config.js                     your file paths, projects, experience tab labels
│   ├── utils.js                      shared helpers and icons
│   ├── nav.js                        nav highlighting and scroll reveal
│   ├── landing.js                    "Meet me", avatar intro, captions, roaming button
│   ├── experience.js                 one-role-at-a-time viewer
│   ├── portfolio.js                  3D project carousel
│   └── future.js                     floating "what's next" phrases
├── assets/                           your images, 3D models and audio
│   └── README.txt                    which file goes where
└── docs/
    └── build-personal-website.md     the original design brief
```

## Adding your own files

1. Put your files in `assets/`.
2. Open `js/config.js` and find the `CONFIG` block.
3. Replace each `null` with the path to your file, for example `introAudio: "assets/intro.mp3"`.

| Setting | What it's for | Format |
| --- | --- | --- |
| `navIcon` | Icon in the nav rail (links to matias.me/nsfw) | `.png` / `.jpg` / `.svg` |
| `avatar.staticModel` | Avatar at rest | `.glb` |
| `avatar.animatedModel` | Avatar while talking | `.glb` |
| `avatar.animationName` | Animation clip name inside the talking model (optional) | text |
| `introAudio` | Introduction recording | `.mp3` |
| `introCues` | When each caption line appears, in seconds | numbers |
| `projectModels.cone` / `segdimmer` / `stickyar` / `artgal` | One model per project tile | `.glb` |
| `futureAudio["interior decorating"]` etc. | One clip per floating phrase | `.mp3` |

Anything left as `null` uses a placeholder: a drawn avatar, wireframe shapes on the project tiles, and the browser's built-in voice instead of your recordings.

After adding `introAudio`, adjust the `t` values in `introCues` so the captions line up with your recording.

Paths are case-sensitive on GitHub Pages: `Intro.mp3` and `intro.mp3` are different files.

## Editing content

- **About**: the `<section id="about">` block in `index.html`.
- **Experience**: each `<li class="role">` inside `<section id="experience">` in `index.html`. The short tab labels are `ROLE_TABS` in `js/config.js`. Keep them in the same order as the roles.
- **Portfolio**: the `PROJECTS` list in `js/config.js` (name, date, blurb, tags, link).
- **What's next**: the phrases are the keys of `CONFIG.futureAudio` in `js/config.js`.
- **Look and feel**: colors and font are CSS variables at the top of `css/styles.css`.

The scripts load in the order listed in `index.html`, and `config.js` and `utils.js` must stay first because the others use them.

## Previewing locally

3D models and audio only load when the page is served, not when you double-click `index.html`. From this folder, run either:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open the address it prints (for example http://localhost:8000).

## Design notes

- **Colors:** deep red `#7a121c` background, warm off-white `#f8eee6`, apricot `#f6b58a` accent. They are defined as CSS variables at the top of `css/styles.css`.
- **Font:** EB Garamond from Google Fonts, with Garamond as the fallback.
- **Motion:** turned down automatically for visitors who have "reduce motion" set on their device.
- **Phones:** on narrow screens the left nav rail becomes a bar along the bottom.

## Acknowledgments
"Sticky Notes" (https://skfb.ly/o6QtW) by Cxrly97 is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
"Cône" (https://skfb.ly/6SRqU) by fmercier is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
