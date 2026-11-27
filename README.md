# kolektiva. — website

The website for the architecture studio **kolektiva.**

A dark, scroll-driven site told in five chapters: Studio, Work, Process,
Places and Contact. It is a plain website — no installation and no build
step. Open `index.html` in a browser and you are looking at the site.

## What is in this folder

| File | What it is |
| --- | --- |
| `index.html` | All the words, the projects and the order of the chapters |
| `styles.css` | Colours, fonts, layout, the phone version |
| `script.js` | The scroll effects, the menu and chapter bar, the typing logo, the contact form |
| `assets/images/` | Pictures: project photos in `photos/`, line drawings elsewhere |
| `assets/fonts/` | The fonts the site uses |

## Still to replace before going live

- **Pictures** — project photos live in `assets/images/photos/`. The Hillside
  Residence photos are in; the Garage Loft, Aubergine Kitchen, Car Showroom and
  Business Units tiles still show placeholder drawings until their photos are added.
- **Project places and years** — in "Chapter II — Work" in `index.html`.
- **The three numbers** — "00 years / 00 projects / 00 people" in Chapter V.
- **Contact details** — email, phone, address and social links. They appear in
  the menu and in Chapter V; the email also appears once more as the contact
  form's `action`, which is where the form sends.
- **Texts** — all headlines and paragraphs are a first draft.
- **Logo font** — the logo uses *Special Elite*. To use a different typewriter
  font, add the font file to `assets/fonts/` and point the first `@font-face`
  rule in `styles.css` at it.

## Changing things with Claude

You do not need to edit these files by hand. Open this project in Claude Code
and say what you want in normal words, for example:

- "Replace project 01 with this photo. It is called Villa X, in Prishtina, 2024."
- "Change the email to … and the phone number to …"
- "We have 12 years of practice, 40 built projects and 9 people."
- "Translate the whole site into Albanian and add a language switch."

## Good to know

- The menu and the chapter bar at the bottom are built from the chapters, so
  adding, removing or renaming a chapter in `index.html` updates both.
- Projects number themselves (01, 02 …) and the "Selected works" count follows
  the number of project tiles, so adding a tile needs no renumbering. A new tile
  needs a position in `styles.css` (`.tile--6`, and so on).

- The contact form opens the visitor's own email app with the message filled
  in. It does not store or send anything by itself.
- Visitors who have "reduce motion" switched on, or no JavaScript, get the same
  content as a normal top-to-bottom page without the pinned scroll scenes.

## Fonts

Special Elite (Apache 2.0), Montserrat and Inter Tight (SIL Open Font
License 1.1) — all free to use on a commercial website.
