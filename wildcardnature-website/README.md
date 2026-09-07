# WildCard Nature - Marketing Website

A modern, professional landing page for the WildCard Nature mobile app.

## Quick Start

Simply open `index.html` in a web browser, or serve using any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Deployment Options

### Vercel (Recommended)
```bash
npx vercel
```

### Netlify
Drag and drop the `website_demo` folder to [Netlify Drop](https://app.netlify.com/drop)

### GitHub Pages
Push to a GitHub repo and enable Pages in repository settings.

### Cloudflare Pages
Connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --color-primary: #22c55e;      /* Main brand color */
  --color-bg: #0a0a0f;           /* Background color */
  /* ... */
}
```

### Content
Edit `index.html` to update:
- Hero text and descriptions
- Feature cards
- Stats and social proof numbers
- Footer links

### Waitlist Integration
Replace the simulated API call in `script.js` with your actual endpoint:
```javascript
// In initWaitlistForm()
const response = await fetch('YOUR_API_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});
```

Popular waitlist services:
- [Waitlist.dev](https://waitlist.dev)
- [LaunchList](https://launchlist.com)
- [Mailchimp](https://mailchimp.com)

## Features

- Fully responsive (mobile, tablet, desktop)
- Dark mode design with subtle gradients
- Smooth scroll animations
- Interactive card hover effects
- Floating particle background
- Modern typography (Space Grotesk + Inter)
- SEO-friendly semantic HTML
- Accessibility considerations
- No external dependencies (pure HTML/CSS/JS)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- No JavaScript frameworks (vanilla JS)
- Minimal CSS (single file, ~700 lines)
- SVG favicon (tiny footprint)
- Lazy animations (Intersection Observer)
- Passive scroll listeners

## License

Part of the WildCard Nature project.
