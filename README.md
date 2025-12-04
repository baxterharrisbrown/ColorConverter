# Color Converter

An interactive web-based color conversion tool that converts between HSL, RGB, CMYK, and Hex color formats with comprehensive contrast analysis.

## Features

### Color Converter
- Convert between multiple color formats: Hex, RGB, HSL, and CMYK
- Real-time color preview
- Relative luminance calculation
- Comprehensive contrast analysis with WCAG compliance indicators
- Grayscale conversion with all format values

### HTML Colors Reference
- Complete database of 140 standard HTML colors
- Filterable table with Web-Safe, Basic, and Extended indicators
- CGA color information
- View all color formats for each named color

### Ideal Contrast Calculator
- Select any hue (0-359.9 degrees)
- Automatically calculates colors with optimal contrast to both white and black
- Target relative luminosity: ~0.1791287847
- Real-time contrast ratio display

## Usage

Simply open `index.html` in a web browser, or visit the live demo.

### Running Locally

1. Clone the repository
2. Open `index.html` in your browser, or
3. Run a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Technologies

- Pure HTML5, CSS3, and JavaScript
- No external dependencies
- Fully responsive design
- WCAG 2.0 compliant contrast calculations

## Color Conversion Algorithms

- **RGB to HSL**: Standard color space conversion
- **RGB to CMYK**: Subtractive color model conversion
- **Relative Luminance**: WCAG 2.0 formula using sRGB color space
- **Contrast Ratio**: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter

## License

MIT License - Feel free to use and modify for your projects.
