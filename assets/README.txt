Put your own files in this folder, then set their paths in the CONFIG block in js/config.js.

  navIcon                      nav rail image (links to matias.me/nsfw)
  avatar.staticModel           avatar at rest (.glb)
  avatar.animatedModel         avatar while talking (.glb); animationName = clip name, optional
  introAudio                   introduction recording (.mp3); tune introCues times to match it
  projectModels.<id>           one .glb per project: cone, segdimmer, stickyar, artgal
  futureAudio["<phrase>"]      one clip per floating phrase

Anything left as null uses the built-in placeholder (browser voice for audio, drawn avatar, wireframe shapes for models).
Open index.html through a local server (e.g. `npx serve .`) so the models and audio load.
