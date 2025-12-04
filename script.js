// Color Conversion Functions

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: r * 255,
        g: g * 255,
        b: b * 255
    };
}

function rgbToCmyk(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);

    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
        c: c * 100,
        m: m * 100,
        y: y * 100,
        k: k * 100
    };
}

function cmykToRgb(c, m, y, k) {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;

    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);

    return { r, g, b };
}

// Luminance and Contrast Functions

function getRelativeLuminance(r, g, b) {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function rgbToGrayscale(r, g, b) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    return { r: gray, g: gray, b: gray };
}

// Global State
let currentColor = { r: 0, g: 0, b: 0 };

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeColorInputs();
    initializeHTMLColors();
    initializeIdealContrast();

    // Set default color
    updateColorFromRgb(255, 33, 122); // #FF217A
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Color Input Handlers
function initializeColorInputs() {
    // Hex input
    document.getElementById('input-hex').addEventListener('input', (e) => {
        const hex = e.target.value;
        if (/^#?[0-9A-Fa-f]{6}$/.test(hex) || /^#?[0-9A-Fa-f]{3}$/.test(hex)) {
            const rgb = hexToRgb(hex);
            updateColorFromRgb(rgb.r, rgb.g, rgb.b);
        }
    });

    // RGB inputs
    ['input-r', 'input-g', 'input-b'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const r = parseFloat(document.getElementById('input-r').value) || 0;
            const g = parseFloat(document.getElementById('input-g').value) || 0;
            const b = parseFloat(document.getElementById('input-b').value) || 0;
            updateColorFromRgb(r, g, b);
        });
    });

    // HSL inputs
    ['input-h', 'input-s', 'input-l'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const h = parseFloat(document.getElementById('input-h').value) || 0;
            const s = parseFloat(document.getElementById('input-s').value) || 0;
            const l = parseFloat(document.getElementById('input-l').value) || 0;
            const rgb = hslToRgb(h, s, l);
            updateColorFromRgb(rgb.r, rgb.g, rgb.b);
        });
    });

    // CMYK inputs
    ['input-c', 'input-m', 'input-y', 'input-k'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const c = parseFloat(document.getElementById('input-c').value) || 0;
            const m = parseFloat(document.getElementById('input-m').value) || 0;
            const y = parseFloat(document.getElementById('input-y').value) || 0;
            const k = parseFloat(document.getElementById('input-k').value) || 0;
            const rgb = cmykToRgb(c, m, y, k);
            updateColorFromRgb(rgb.r, rgb.g, rgb.b);
        });
    });
}

function updateColorFromRgb(r, g, b) {
    currentColor = { r, g, b };
    updateAllDisplays();
}

function updateAllDisplays() {
    const { r, g, b } = currentColor;

    // Update input fields
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    document.getElementById('input-hex').value = hex;
    document.getElementById('input-r').value = Math.round(r);
    document.getElementById('input-g').value = Math.round(g);
    document.getElementById('input-b').value = Math.round(b);
    document.getElementById('input-h').value = hsl.h.toFixed(1);
    document.getElementById('input-s').value = hsl.s.toFixed(1);
    document.getElementById('input-l').value = hsl.l.toFixed(1);
    document.getElementById('input-c').value = cmyk.c.toFixed(1);
    document.getElementById('input-m').value = cmyk.m.toFixed(1);
    document.getElementById('input-y').value = cmyk.y.toFixed(1);
    document.getElementById('input-k').value = cmyk.k.toFixed(1);

    // Update color display
    document.getElementById('color-display').style.backgroundColor = hex;

    // Update color values
    document.getElementById('color-values').innerHTML = `
        <div class="color-value-item"><strong>Hex:</strong> ${hex}</div>
        <div class="color-value-item"><strong>RGB:</strong> rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})</div>
        <div class="color-value-item"><strong>HSL:</strong> hsl(${hsl.h.toFixed(1)}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%)</div>
        <div class="color-value-item"><strong>CMYK:</strong> cmyk(${cmyk.c.toFixed(1)}%, ${cmyk.m.toFixed(1)}%, ${cmyk.y.toFixed(1)}%, ${cmyk.k.toFixed(1)}%)</div>
    `;

    // Update relative luminance
    const luminance = getRelativeLuminance(r, g, b);
    document.getElementById('relative-luminance').textContent = luminance.toFixed(10);

    // Update contrast displays
    updateContrastDisplays(r, g, b, luminance);

    // Update grayscale
    updateGrayscaleDisplay(r, g, b);
}

function updateContrastDisplays(r, g, b, luminance) {
    const hex = rgbToHex(r, g, b);
    const whiteLuminance = 1;
    const blackLuminance = 0;

    // Color on white background
    const colorOnWhiteRatio = getContrastRatio(luminance, whiteLuminance);
    updateContrastItem('color-on-white', hex, '#FFFFFF', 'Color on White', colorOnWhiteRatio);

    // Color on black background
    const colorOnBlackRatio = getContrastRatio(luminance, blackLuminance);
    updateContrastItem('color-on-black', hex, '#000000', 'Color on Black', colorOnBlackRatio);

    // White on color background
    const whiteOnColorRatio = getContrastRatio(whiteLuminance, luminance);
    updateContrastItem('white-on-color', '#FFFFFF', hex, 'White on Color', whiteOnColorRatio);

    // Black on color background
    const blackOnColorRatio = getContrastRatio(blackLuminance, luminance);
    updateContrastItem('black-on-color', '#000000', hex, 'Black on Color', blackOnColorRatio);
}

function updateContrastItem(elementId, textColor, bgColor, label, ratio) {
    const element = document.getElementById(elementId);
    const display = element.querySelector('.contrast-display');
    const info = element.querySelector('.contrast-info');

    display.style.color = textColor;
    display.style.backgroundColor = bgColor;
    display.textContent = 'Sample Text';

    const aaLargePass = ratio >= 3;
    const aaPass = ratio >= 4.5;
    const aaaPass = ratio >= 7;

    info.innerHTML = `
        <h4>${label}</h4>
        <p><span class="contrast-ratio">Contrast Ratio: ${ratio.toFixed(2)}:1</span></p>
        <p>WCAG AA (Normal): <span class="${aaPass ? 'wcag-pass' : 'wcag-fail'}">${aaPass ? 'Pass' : 'Fail'}</span></p>
        <p>WCAG AA (Large): <span class="${aaLargePass ? 'wcag-pass' : 'wcag-fail'}">${aaLargePass ? 'Pass' : 'Fail'}</span></p>
        <p>WCAG AAA: <span class="${aaaPass ? 'wcag-pass' : 'wcag-fail'}">${aaaPass ? 'Pass' : 'Fail'}</span></p>
    `;
}

function updateGrayscaleDisplay(r, g, b) {
    const gray = rgbToGrayscale(r, g, b);
    const grayHex = rgbToHex(gray.r, gray.g, gray.b);
    const grayHsl = rgbToHsl(gray.r, gray.g, gray.b);
    const grayCmyk = rgbToCmyk(gray.r, gray.g, gray.b);

    document.querySelector('.grayscale-color').style.backgroundColor = grayHex;
    document.querySelector('.grayscale-values').innerHTML = `
        <div class="color-value-item"><strong>Hex:</strong> ${grayHex}</div>
        <div class="color-value-item"><strong>RGB:</strong> rgb(${Math.round(gray.r)}, ${Math.round(gray.g)}, ${Math.round(gray.b)})</div>
        <div class="color-value-item"><strong>HSL:</strong> hsl(${grayHsl.h.toFixed(1)}, ${grayHsl.s.toFixed(1)}%, ${grayHsl.l.toFixed(1)}%)</div>
        <div class="color-value-item"><strong>CMYK:</strong> cmyk(${grayCmyk.c.toFixed(1)}%, ${grayCmyk.m.toFixed(1)}%, ${grayCmyk.y.toFixed(1)}%, ${grayCmyk.k.toFixed(1)}%)</div>
    `;
}

// HTML Colors Data (140 standard HTML colors)
const htmlColors = [
    { name: 'AliceBlue', hex: '#F0F8FF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'AntiqueWhite', hex: '#FAEBD7', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Aqua', hex: '#00FFFF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '11', cgaName: 'Cyan', cgaAlias: 'Aqua' },
    { name: 'Aquamarine', hex: '#7FFFD4', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Azure', hex: '#F0FFFF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Beige', hex: '#F5F5DC', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Bisque', hex: '#FFE4C4', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Black', hex: '#000000', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '0', cgaName: 'Black', cgaAlias: '' },
    { name: 'BlanchedAlmond', hex: '#FFEBCD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Blue', hex: '#0000FF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '9', cgaName: 'Blue', cgaAlias: '' },
    { name: 'BlueViolet', hex: '#8A2BE2', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Brown', hex: '#A52A2A', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'BurlyWood', hex: '#DEB887', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'CadetBlue', hex: '#5F9EA0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Chartreuse', hex: '#7FFF00', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Chocolate', hex: '#D2691E', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Coral', hex: '#FF7F50', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'CornflowerBlue', hex: '#6495ED', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Cornsilk', hex: '#FFF8DC', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Crimson', hex: '#DC143C', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Cyan', hex: '#00FFFF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '11', cgaName: 'Cyan', cgaAlias: 'Aqua' },
    { name: 'DarkBlue', hex: '#00008B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkCyan', hex: '#008B8B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkGoldenRod', hex: '#B8860B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkGray', hex: '#A9A9A9', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkGreen', hex: '#006400', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkKhaki', hex: '#BDB76B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkMagenta', hex: '#8B008B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkOliveGreen', hex: '#556B2F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkOrange', hex: '#FF8C00', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkOrchid', hex: '#9932CC', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkRed', hex: '#8B0000', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkSalmon', hex: '#E9967A', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkSeaGreen', hex: '#8FBC8F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkSlateBlue', hex: '#483D8B', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkSlateGray', hex: '#2F4F4F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkTurquoise', hex: '#00CED1', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DarkViolet', hex: '#9400D3', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DeepPink', hex: '#FF1493', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DeepSkyBlue', hex: '#00BFFF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DimGray', hex: '#696969', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'DodgerBlue', hex: '#1E90FF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'FireBrick', hex: '#B22222', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'FloralWhite', hex: '#FFFAF0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'ForestGreen', hex: '#228B22', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Fuchsia', hex: '#FF00FF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '13', cgaName: 'Magenta', cgaAlias: 'Fuchsia' },
    { name: 'Gainsboro', hex: '#DCDCDC', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'GhostWhite', hex: '#F8F8FF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Gold', hex: '#FFD700', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'GoldenRod', hex: '#DAA520', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Gray', hex: '#808080', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '7', cgaName: 'LightGray', cgaAlias: 'Gray' },
    { name: 'Green', hex: '#008000', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '2', cgaName: 'Green', cgaAlias: '' },
    { name: 'GreenYellow', hex: '#ADFF2F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'HoneyDew', hex: '#F0FFF0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'HotPink', hex: '#FF69B4', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'IndianRed', hex: '#CD5C5C', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Indigo', hex: '#4B0082', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Ivory', hex: '#FFFFF0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Khaki', hex: '#F0E68C', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Lavender', hex: '#E6E6FA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LavenderBlush', hex: '#FFF0F5', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LawnGreen', hex: '#7CFC00', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LemonChiffon', hex: '#FFFACD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightBlue', hex: '#ADD8E6', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightCoral', hex: '#F08080', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightCyan', hex: '#E0FFFF', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightGoldenRodYellow', hex: '#FAFAD2', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightGray', hex: '#D3D3D3', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightGreen', hex: '#90EE90', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightPink', hex: '#FFB6C1', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightSalmon', hex: '#FFA07A', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightSeaGreen', hex: '#20B2AA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightSkyBlue', hex: '#87CEFA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightSlateGray', hex: '#778899', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightSteelBlue', hex: '#B0C4DE', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'LightYellow', hex: '#FFFFE0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Lime', hex: '#00FF00', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '10', cgaName: 'Lime', cgaAlias: '' },
    { name: 'LimeGreen', hex: '#32CD32', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Linen', hex: '#FAF0E6', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Magenta', hex: '#FF00FF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '13', cgaName: 'Magenta', cgaAlias: 'Fuchsia' },
    { name: 'Maroon', hex: '#800000', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '1', cgaName: 'Maroon', cgaAlias: '' },
    { name: 'MediumAquaMarine', hex: '#66CDAA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumBlue', hex: '#0000CD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumOrchid', hex: '#BA55D3', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumPurple', hex: '#9370DB', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumSeaGreen', hex: '#3CB371', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumSlateBlue', hex: '#7B68EE', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumSpringGreen', hex: '#00FA9A', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumTurquoise', hex: '#48D1CC', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MediumVioletRed', hex: '#C71585', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MidnightBlue', hex: '#191970', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MintCream', hex: '#F5FFFA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'MistyRose', hex: '#FFE4E1', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Moccasin', hex: '#FFE4B5', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'NavajoWhite', hex: '#FFDEAD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Navy', hex: '#000080', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '1', cgaName: 'Navy', cgaAlias: '' },
    { name: 'OldLace', hex: '#FDF5E6', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Olive', hex: '#808000', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '6', cgaName: 'Olive', cgaAlias: '' },
    { name: 'OliveDrab', hex: '#6B8E23', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Orange', hex: '#FFA500', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'OrangeRed', hex: '#FF4500', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Orchid', hex: '#DA70D6', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PaleGoldenRod', hex: '#EEE8AA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PaleGreen', hex: '#98FB98', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PaleTurquoise', hex: '#AFEEEE', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PaleVioletRed', hex: '#DB7093', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PapayaWhip', hex: '#FFEFD5', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PeachPuff', hex: '#FFDAB9', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Peru', hex: '#CD853F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Pink', hex: '#FFC0CB', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Plum', hex: '#DDA0DD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'PowderBlue', hex: '#B0E0E6', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Purple', hex: '#800080', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '5', cgaName: 'Purple', cgaAlias: '' },
    { name: 'Red', hex: '#FF0000', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '12', cgaName: 'Red', cgaAlias: '' },
    { name: 'RosyBrown', hex: '#BC8F8F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'RoyalBlue', hex: '#4169E1', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SaddleBrown', hex: '#8B4513', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Salmon', hex: '#FA8072', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SandyBrown', hex: '#F4A460', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SeaGreen', hex: '#2E8B57', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SeaShell', hex: '#FFF5EE', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Sienna', hex: '#A0522D', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Silver', hex: '#C0C0C0', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '15', cgaName: 'Silver', cgaAlias: '' },
    { name: 'SkyBlue', hex: '#87CEEB', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SlateBlue', hex: '#6A5ACD', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SlateGray', hex: '#708090', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Snow', hex: '#FFFAFA', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SpringGreen', hex: '#00FF7F', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'SteelBlue', hex: '#4682B4', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Tan', hex: '#D2B48C', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Teal', hex: '#008080', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '3', cgaName: 'Teal', cgaAlias: '' },
    { name: 'Thistle', hex: '#D8BFD8', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Tomato', hex: '#FF6347', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Turquoise', hex: '#40E0D0', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Violet', hex: '#EE82EE', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Wheat', hex: '#F5DEB3', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'White', hex: '#FFFFFF', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '15', cgaName: 'White', cgaAlias: '' },
    { name: 'WhiteSmoke', hex: '#F5F5F5', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' },
    { name: 'Yellow', hex: '#FFFF00', webSafe: 'Yes', basic: 'Yes', extended: 'Yes', cgaNum: '14', cgaName: 'Yellow', cgaAlias: '' },
    { name: 'YellowGreen', hex: '#9ACD32', webSafe: 'No', basic: 'No', extended: 'Yes', cgaNum: '', cgaName: '', cgaAlias: '' }
];

let filteredColors = [...htmlColors];

function initializeHTMLColors() {
    renderHTMLColorsTable();
    initializeFilters();
}

function renderHTMLColorsTable() {
    const tbody = document.getElementById('html-colors-body');
    tbody.innerHTML = '';

    filteredColors.forEach(color => {
        const rgb = hexToRgb(color.hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${color.name}</td>
            <td><div class="color-swatch" style="background-color: ${color.hex}"></div></td>
            <td>${color.webSafe}</td>
            <td>${color.basic}</td>
            <td>${color.extended}</td>
            <td>${color.cgaNum}</td>
            <td>${color.cgaName}</td>
            <td>${color.cgaAlias}</td>
            <td>${color.hex}</td>
            <td>rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})</td>
            <td>cmyk(${cmyk.c.toFixed(0)}%, ${cmyk.m.toFixed(0)}%, ${cmyk.y.toFixed(0)}%, ${cmyk.k.toFixed(0)}%)</td>
            <td>hsl(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%)</td>
        `;
        tbody.appendChild(row);
    });
}

function initializeFilters() {
    const filters = document.querySelectorAll('.filter-input');
    filters.forEach(filter => {
        filter.addEventListener('input', applyFilters);
        filter.addEventListener('change', applyFilters);
    });
}

function applyFilters() {
    const filters = document.querySelectorAll('.filter-input');
    filteredColors = htmlColors.filter(color => {
        let match = true;

        filters.forEach(filter => {
            const column = parseInt(filter.dataset.column);
            const value = filter.value.toLowerCase();

            if (!value) return;

            let cellValue = '';
            switch (column) {
                case 0: cellValue = color.name.toLowerCase(); break;
                case 2: cellValue = color.webSafe.toLowerCase(); break;
                case 3: cellValue = color.basic.toLowerCase(); break;
                case 4: cellValue = color.extended.toLowerCase(); break;
                case 5: cellValue = color.cgaNum.toLowerCase(); break;
                case 6: cellValue = color.cgaName.toLowerCase(); break;
                case 7: cellValue = color.cgaAlias.toLowerCase(); break;
            }

            if (!cellValue.includes(value)) {
                match = false;
            }
        });

        return match;
    });

    renderHTMLColorsTable();
}

// Ideal Contrast Tab
function initializeIdealContrast() {
    const hueInput = document.getElementById('hue-input');
    const hueSlider = document.getElementById('hue-slider');

    hueInput.addEventListener('input', (e) => {
        const hue = parseFloat(e.target.value) || 0;
        hueSlider.value = hue;
        updateIdealContrast(hue);
    });

    hueSlider.addEventListener('input', (e) => {
        const hue = parseFloat(e.target.value);
        hueInput.value = hue.toFixed(1);
        updateIdealContrast(hue);
    });

    updateIdealContrast(0);
}

function updateIdealContrast(hue) {
    const targetLuminance = 0.1791287847;

    // Find saturation and lightness that gives us the target luminance
    // We'll use binary search for lightness while keeping saturation at 100%
    let saturation = 100;
    let lightness = findLightnessForLuminance(hue, saturation, targetLuminance);

    const rgb = hslToRgb(hue, saturation, lightness);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const actualLuminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

    // Update display
    document.getElementById('ideal-color-preview').style.backgroundColor = hex;

    document.getElementById('ideal-color-info').innerHTML = `
        <div class="color-value-item"><strong>Hex:</strong> ${hex}</div>
        <div class="color-value-item"><strong>RGB:</strong> rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})</div>
        <div class="color-value-item"><strong>HSL:</strong> hsl(${hue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)</div>
        <div class="color-value-item"><strong>CMYK:</strong> cmyk(${cmyk.c.toFixed(1)}%, ${cmyk.m.toFixed(1)}%, ${cmyk.y.toFixed(1)}%, ${cmyk.k.toFixed(1)}%)</div>
        <div class="color-value-item"><strong>Rel. Luminance:</strong> ${actualLuminance.toFixed(10)}</div>
    `;

    // Update contrast examples
    const whiteLuminance = 1;
    const blackLuminance = 0;
    const whiteContrast = getContrastRatio(whiteLuminance, actualLuminance);
    const blackContrast = getContrastRatio(actualLuminance, blackLuminance);

    document.getElementById('ideal-on-white').innerHTML = `
        <div class="contrast-display" style="background: #FFF; color: ${hex}; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
            Sample Text
        </div>
        <div class="contrast-info" style="padding: 15px; background: #f9f9f9;">
            <h4>Color on White Background</h4>
            <p><span class="contrast-ratio">Contrast: ${whiteContrast.toFixed(2)}:1</span></p>
        </div>
    `;

    document.getElementById('ideal-on-black').innerHTML = `
        <div class="contrast-display" style="background: #000; color: ${hex}; height: 100px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold;">
            Sample Text
        </div>
        <div class="contrast-info" style="padding: 15px; background: #f9f9f9;">
            <h4>Color on Black Background</h4>
            <p><span class="contrast-ratio">Contrast: ${blackContrast.toFixed(2)}:1</span></p>
        </div>
    `;
}

function findLightnessForLuminance(hue, saturation, targetLuminance) {
    let low = 0;
    let high = 100;
    let best = 50;
    let bestDiff = Infinity;

    // Binary search for the lightness value
    for (let i = 0; i < 50; i++) {
        const mid = (low + high) / 2;
        const rgb = hslToRgb(hue, saturation, mid);
        const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
        const diff = Math.abs(luminance - targetLuminance);

        if (diff < bestDiff) {
            bestDiff = diff;
            best = mid;
        }

        if (luminance < targetLuminance) {
            low = mid;
        } else {
            high = mid;
        }

        if (diff < 0.0000001) break;
    }

    return best;
}
