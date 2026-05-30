---
name: Public Innovation Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201c'
  on-tertiary-container: '#009485'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for the intersection of public sector reliability and modern AI-driven professional development. It targets government officials, policy innovators, and mentors who require a high-trust environment that feels both institutional and cutting-edge.

The visual style is **Corporate / Modern** with a focus on precision and clarity. It blends the structural integrity of enterprise tools like Microsoft Teams with the fluid, content-first experience of Notion. The interface prioritizes whitespace and legible information density to minimize cognitive load, ensuring that complex data visualizations and learning pathways remain approachable.

## Colors
The palette is built on a foundation of **Deep Navy (#0F172A)** and **Slate Blues**, establishing an immediate sense of institutional trust and authority. 

- **Primary:** Deep Navy is used for global navigation, primary headings, and critical UI anchors.
- **Secondary (AI-Accent):** Indigo Purple (#6366F1) is reserved exclusively for AI-powered features, smart recommendations, and "Innovation" prompts, creating a distinct visual signifier for machine-learning capabilities.
- **Tertiary:** Innovation Teal (#14B8A6) is utilized for progress indicators, success states, and growth-related metrics.
- **Neutral:** A refined scale of Slates provides soft contrast for borders, secondary text, and background surfaces.

The system supports a native **Dark Mode** where the navy foundation shifts to a deeper midnight tone, maintaining high accessibility standards through elevated surface layers rather than pure black.

## Typography
This design system utilizes **Inter** for all roles to leverage its exceptional legibility in data-heavy environments. The typeface is systematic and utilitarian, ensuring accessibility across all screen sizes.

- **Headlines:** Use tighter letter-spacing and semi-bold weights to create a strong visual anchor for page sections.
- **Body Text:** Standardized at 16px for optimal reading comfort. For long-form learning content, the `body-lg` (18px) variant should be used to improve focus.
- **Labels:** Small caps or increased letter spacing should be applied to `label-sm` when used for overlines or metadata to distinguish them from interactive body text.

## Layout & Spacing
The system employs a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile. 

- **Grid Logic:** Use 24px gutters for desktop to provide generous breathing room between cards and data modules.
- **Spacing Rhythm:** All spacing must be a multiple of the 4px base unit. 16px (`md`) is the standard padding for components like inputs and small cards; 24px (`lg`) is the standard for primary container padding.
- **Breakpoints:** 
  - Mobile: < 600px (16px margins)
  - Tablet: 600px - 1024px (24px margins)
  - Desktop: > 1024px (40px margins, 1280px max-width)

## Elevation & Depth
Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. 

- **Surface Levels:** The base background is the lowest level. Content sits on "Surface-Cards" which are pure white (Light Mode) or Slate-900 (Dark Mode).
- **Shadows:** Use extra-diffused, low-opacity shadows (e.g., `box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08)`) to lift interactive elements like cards and menus without creating visual clutter.
- **Interactive States:** Hover states should slightly increase the shadow spread and lift the element by 1-2px to provide tactile feedback.
- **AI Surfaces:** Elements powered by AI may use a subtle 1px border with a soft Indigo glow to distinguish them from standard administrative content.

## Shapes
The design system adopts a **Rounded** aesthetic (8px default) to balance professional structure with a friendly, modern SaaS feel.

- **Components:** Buttons, Input fields, and Chips use the `0.5rem` (8px) radius.
- **Containers:** Large cards and modals use `rounded-lg` (16px) to soften the layout and emphasize the "platform" feel.
- **Media:** Mentor avatars should be circular (pill-shaped) to add a humanizing touch to the professional environment.

## Components
- **Buttons:** 
  - *Primary:* Solid Deep Navy. 
  - *Secondary:* Outline Slate-200. 
  - *AI-Special:* Gradient background (Indigo to Teal) with a "Sparkle" icon prefix.
- **Inputs & Search:** High-contrast borders (Slate-300) that thicken and shift to Indigo on focus. Labels are always positioned above the field in `label-md`.
- **Cards:** White background with an 8px radius and the ambient shadow. Use a 1px Slate-100 border for definition. Mentorship cards include a "Verified" badge for trust.
- **Navigation:**
  - *Web:* Persistent left-hand sidebar in Deep Navy for high-level categories (Dashboard, Courses, Mentors, Analytics).
  - *Mobile:* Bottom tab bar with centered AI-assistant action button.
- **Data Viz:** Charts must use the Primary Navy, Secondary Indigo, and Tertiary Teal. Avoid red unless indicating negative performance or errors.
- **Feedback States:**
  - *Success:* Teal background/text with checkmark.
  - *Error:* Soft red background with bold red text; never use for AI "limitations."
  - *Loading:* A custom skeleton screen that mimics the card structure of the specific page.