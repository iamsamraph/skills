# Do Less Co website

This folder contains the website published at https://do-less.co. The skills library lives at https://do-less.co/skills/.

## Automatic updates

Netlify builds and publishes the website whenever this repository's `main` branch changes. The build discovers every top-level folder containing `SKILL.md`. No list of skill folders needs to be maintained.

- Edit a skill's `README.md` to change its public guide and title.
- Edit its `SKILL.md` to change the instructions people read, copy and download.
- Card summaries come from the table in the repository's main `README.md`. If there is no table entry, the skill's first introductory paragraph is used.
- Add a folder containing `SKILL.md` to add a skill; `README.md` is optional.
- Remove the folder to remove its page on the next deployment.
- Supporting files are copied with the skill. Files directly inside `references/` get download links. Hidden files, symlinks and dependency folders are excluded.

Changes appear after Netlify's build and deployment complete, usually within a few minutes. If a build fails, the previously published site stays live. Build status is at https://app.netlify.com/projects/do-lessco/deploys.

Optional category, tagline, requirements and order for existing skills are in `skill-display.json`. New skills work without these. A skill can override its display metadata in the `SKILL.md` YAML header:

```yaml
website:
  category: Meeting prep
  tagline: Walk in knowing.
  needs: Public web
```

Everything in a public skill folder may be included in its website downloads. Keep drafts and private material outside those folders.

## Website design

`public/` contains the approved homepage, photography, fonts and skills styles. `build.mjs` renders the repository content into `dist/`. Generated output and installed packages are ignored by Git.

From this directory, use Node 22 or newer:

```sh
npm ci
npm test
npm run build
```

The root `netlify.toml` sets the base to `website`, publishes `website/dist`, and deliberately rebuilds even when only skill files outside `website/` change. No deployment credentials are stored in this repository.
