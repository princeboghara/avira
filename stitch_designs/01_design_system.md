---
name: Lumina Momentum
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered to project a high-energy, success-oriented environment that balances technical sophistication with human approachability. It targets modern entrepreneurs who value speed, transparency, and technological edges.

The visual style is a fusion of **Glassmorphism** and **Modern Corporate** aesthetics. It utilizes deep gradients to signify depth and momentum, paired with translucent "frosted" surfaces to evoke clarity and trust. High-quality 3D illustrations should be used as primary focal points to represent growth, connectivity, and digital assets, ensuring the UI feels premium and forward-thinking rather than purely transactional.

## Colors

This design system utilizes a high-contrast, vibrant palette to drive user action and symbolize financial vitality.

- **Primary Gradient:** A blend of Deep Violet and Bright Cyan. This is the "Momentum" gradient, used for primary calls-to-action, progress indicators, and hero elements.
- **Accent Growth:** Lime Green is reserved exclusively for positive financial data, "Success" states, and "Join" triggers.
- **Accent Warmth:** Amber is used for notifications, warnings, and highlighting "Limited Time" opportunities.
- **Backgrounds:** A clean `slate-50` (#F8FAFC) ensures that the glassmorphic cards and vibrant gradients remain the focal point without causing visual fatigue.

## Typography

Typography is used to establish authority and urgency. **Montserrat** provides the "Success-driven" personality for headings, with heavy weights used to anchor the page layout. **Inter** is utilized for all functional text to ensure high legibility in data-heavy dashboard views and marketing copy.

For headlines, use tighter letter-spacing to create a "compact" and modern editorial feel. Body text should maintain generous line-heights to ensure the platform feels accessible and easy to navigate during long reading sessions.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum container width for desktop to maintain readability. 

- **Desktop (1280px+):** 12-column grid with 24px gutters. Use large section gaps (80px+) to create a "premium" feel through whitespace.
- **Tablet (768px - 1279px):** 8-column grid. Margins compress to 32px.
- **Mobile (< 768px):** 4-column grid. Margins compress to 16px. Vertical stack spacing becomes the primary driver of hierarchy.

Utilize an 8px spacing scale for all internal component padding and margins to maintain a tight, systematic rhythm.

## Elevation & Depth

Depth is a core differentiator of this design system. It is achieved through two primary methods:

1.  **Glassmorphism:** Secondary containers (like dashboard widgets or sidebar navigation) should use a backdrop filter (`blur(12px)`) with a white background at 60-70% opacity. A subtle 1px white border at 20% opacity should define the edges.
2.  **Soft Ambient Shadows:** Elements that are "interactive" or "raised" use ultra-diffused shadows. Shadows should carry a slight tint of the primary violet color (`rgba(99, 102, 241, 0.1)`) rather than pure black, keeping the UI looking clean and vibrant.
3.  **Layering:** 3D icons should break the "bounds" of their containers, overlapping edges to create a sense of physical space.

## Shapes

The shape language is extremely soft and approachable.
- **Standard UI Elements:** Use a `0.5rem` (8px) radius.
- **Cards & Large Containers:** Use a `1.5rem` (24px) radius to emphasize the modern, friendly aesthetic.
- **Interactive Triggers:** Buttons and Chips should use a fully rounded "Pill" shape (999px) to encourage clicking and provide a distinct contrast against rectangular content cards.

## Components

### Buttons
- **Primary:** Momentum gradient background, white text, pill-shaped, with a subtle glow shadow that matches the gradient color.
- **Secondary:** Transparent background with a 2px gradient border. Text should use the primary violet color.
- **Ghost:** No background or border. High-contrast label font.

### Cards
Cards are the primary vehicle for information. They must feature the 24px corner radius and a subtle 1px border. For "Featured" or "Pro" tiers, apply a glassmorphic background effect over a subtle background gradient.

### Input Fields
Inputs should be clean with a light gray background (`#F1F5F9`). On focus, the border should transition to the primary cyan color with a soft glow effect.

### Chips & Badges
Used for status (e.g., "Active", "Pending"). These should use a low-opacity version of the status color (e.g., Lime Green at 15% opacity) with high-saturation text of the same hue for maximum legibility and style.

### Success Trackers
Specialized components for MLM: Progress bars should always use the Momentum gradient. Use 3D "trophy" or "growth" icons when a user hits a milestone.
