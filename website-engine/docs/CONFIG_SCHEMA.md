# Config Schema Reference

The JSON config file is the only thing that changes between clients. It is validated against the Pydantic models in `backend/app/models/config_schema.py` at startup.

## Root Fields

| Field | Type | Notes |
|---|---|---|
| `client_id` | string | slug, e.g. `"sunrise-clinic"` — used for asset folder name |
| `meta` | MetaConfig | Business identity |
| `seo` | SeoConfig | SEO and Open Graph tags |
| `theme` | ThemeConfig | Colors, fonts, border radius |
| `contact` | ContactConfig | Phone, email, address, hours, social |
| `navigation` | NavItem[] | Links shown in the navbar |
| `sections` | Sections | All page sections (each has `enabled: bool`) |
| `features` | Features | Feature flags (reserved for future use) |

## Sections

Every section has `enabled: bool`. Components return `null` when `enabled` is `false`.

| Section | Key fields |
|---|---|
| `hero` | headline, subheadline, cta_text, cta_link, background_image |
| `about` | title, body, image, stats[] |
| `offerings` | title, type (services/menu/programs), items[] |
| `gallery` | title, images[] |
| `team` | title, members[] |
| `testimonials` | title, items[] |
| `pricing` | title, plans[] |
| `faq` | title, items[] |
| `contact` | title, show_form, show_map |

## Offerings `type` field

The `type` field only affects icon/label defaults — the data shape is identical across all business types:

- `"services"` — clinics, salons
- `"menu"` — restaurants, cafés  
- `"programs"` — gyms, studios

## Theme

Colors are hex strings injected as CSS custom properties:

- `--color-primary` ← `theme.primary_color`
- `--color-secondary` ← `theme.secondary_color`
- `--color-accent` ← `theme.accent_color`
- `--font-heading` ← `theme.font_heading` (Google Font name)
- `--font-body` ← `theme.font_body` (Google Font name)
- `--radius` ← `theme.border_radius` (sm=0.25rem, md=0.5rem, lg=0.75rem, full=9999px)

Use `bg-[var(--color-primary)]` in Tailwind classes — never hardcode hex values in components.

## Adding a new client

See `NEW_CLIENT_WORKFLOW.md`.
