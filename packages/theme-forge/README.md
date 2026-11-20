# @anymousdex/theme-forge

Generate a complete AnymousDEX theme from a single accent color.

```bash
node packages/theme-forge/index.js --name aurora --accent "#59F7C0"
node packages/theme-forge/index.js --name ice --accent "#4FC3F7" --background "#07101C"
```

The generated JSON is written to `src/assets/themes/<name>.json`. Restart the
app (or pick the theme in Settings) to load it.

All colors are derived with simple mixing, so the result stays readable:
backgrounds are tinted with the accent, text keeps a near-white tone, and the
terminal palette gets matching red/green/yellow/blue/magenta variants.
