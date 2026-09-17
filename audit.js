const fs = require('fs');
const path = require('path');

const filesToAudit = ['index.html', 'index_en.html'];
const errors = [];
const warnings = [];

filesToAudit.forEach(file => {
    if (!fs.existsSync(file)) {
        errors.push(`File not found: ${file}`);
        return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // 1. Check internal IDs and anchors
    const ids = Array.from(content.matchAll(/id="([^"]+)"/g)).map(m => m[1]);
    const hrefs = Array.from(content.matchAll(/href="([^"]+)"/g)).map(m => m[1]);
    
    hrefs.forEach(href => {
        if (href.startsWith('#') && href !== '#') {
            const targetId = href.substring(1);
            if (!ids.includes(targetId)) {
                errors.push(`[${file}] Broken anchor link: ${href} (ID '${targetId}' not found)`);
            }
        }
    });

    // 2. Check asset paths
    const assetSources = Array.from(content.matchAll(/(?:src|poster)="([^"]+)"/g)).map(m => decodeURIComponent(m[1]));
    assetSources.forEach(src => {
        if (!src.startsWith('http') && !src.startsWith('#') && !src.startsWith('mailto:')) {
            const assetPath = path.join(__dirname, src);
            if (!fs.existsSync(assetPath)) {
                errors.push(`[${file}] Missing asset: ${src}`);
            }
        }
    });

    // 3. Check tracking
    if (!content.includes('data-track-checkout')) {
        warnings.push(`[${file}] Missing 'data-track-checkout' tracking on payment buttons.`);
    }

    // 4. Check for alt tags on images
    const imgTags = Array.from(content.matchAll(/<img([^>]+)>/g));
    imgTags.forEach(match => {
        if (!match[1].includes('alt=')) {
            warnings.push(`[${file}] Image missing alt attribute: ${match[0]}`);
        }
    });
});

console.log(JSON.stringify({errors, warnings}, null, 2));
