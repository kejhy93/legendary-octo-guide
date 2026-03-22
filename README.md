# legendary-octo-guide

**An interactive Markdown presentation viewer built with vanilla HTML, CSS, and JavaScript.**

## Features

- 📊 **Dual View Modes**: View presentations as slideshows or continuous pages
- 🎨 **Dark Theme**: Eye-friendly dark interface with vibrant green accents
- ⌨️ **Keyboard Navigation**: Arrow keys, Home key, and R for restart
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop (768px and 480px breakpoints)
- 🔒 **XSS Protection**: Uses DOMPurify to sanitize Markdown HTML output
- 💅 **Syntax Highlighting**: Prism.js integration for code block highlighting
- ♿ **Accessible**: ARIA labels, semantic HTML, and keyboard support
- 📊 **Slide Counter**: Know which slide you're on in slideshow mode

## Project Structure

```
├── index.html       # Main application file
├── style.css        # Styling with CSS variables and responsive design
├── slide.md         # Slideshow content (split by --- )
├── page.md          # Page view content
├── README.md        # This file
```

## Usage

### File Setup

1. Add your slide content to `slide.md` (use `---` to separate slides)
2. Add your page content to `page.md`
3. Open `index.html` in a web browser

### Slideshow Navigation

| Action | Keyboard | Button |
|--------|----------|--------|
| Next Slide | Right Arrow | Next → |
| Previous Slide | Left Arrow | Previous ← |
| First Slide | Home, R | - |
| Switch to Page | - | Page |

### Keyboard Shortcuts (Slideshow Mode)

- **Right Arrow**: Next slide
- **Left Arrow**: Previous slide
- **Home** or **R**: Go to first slide
- **ESC**: Toggle keyboard shortcuts display

## Customization

### Theme Colors

Edit the CSS custom properties in `style.css` under `:root`:

```css
:root {
    --color-primary-green: #00ff00;         /* Main text color */
    --color-bright-green: #66ff66;          /* Headings */
    --color-dark-bg: #1a1a1a;              /* Background */
    --color-card-bg: #2b2b2b;              /* Card/slide background */
    /* ... other colors ... */
}
```

## Browser Compatibility

- Modern browsers with ES6 support (Chrome, Firefox, Safari, Edge 2018+)
- Requires: Fetch API, DOM APIs

## Dependencies

All dependencies are loaded from CDN:

- **Prism.js v1.29.0**: Syntax highlighting for code blocks
- **marked.js**: Markdown to HTML conversion  
- **DOMPurify**: XSS protection for sanitizing HTML
- **Google Fonts**: Roboto font family

## Responsive Breakpoints

- **Desktop** (>768px): Full-size layout
- **Tablet** (768px and below): Smaller fonts, reduced padding
- **Mobile** (480px and below): Compact layout, optimized buttons

## License

Open source - feel free to use and modify
