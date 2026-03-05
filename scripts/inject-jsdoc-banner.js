#!/usr/bin/env node
/**
 * Post-processing script: injects a promotional banner into all JSDoc HTML files.
 * Runs automatically after `npm run docs` via the docs npm script.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DOC_DIR = path.join(__dirname, '..', 'doc');

const BANNER_HTML = `
<!-- injected-banner-start -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
<div id="promo-banner" style="padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-bottom:1px solid #e5e7eb;">
  <a href="https://github.com/leotrinh/cf-node-client" target="_blank" rel="noreferrer" style="font-weight:700;font-size:14px;color:#333;text-decoration:none;margin-right:auto;">cf-node-client</a>
  <div style="width:1px;height:32px;background:#e7ebf3;margin:0 4px;"></div>
  <a href="https://me.momo.vn/2pIou1iyFkuKtGT9TbIy" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#d42a87;color:#ffffff;padding:8px 16px;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.1);transition:background .2s;" onmouseover="this.style.background='#d42a87'" onmouseout="this.style.background='#d42a87'">
    <span class="material-symbols-outlined" style="font-size:18px;">momo</span>
  </a>
  <a href="https://claudekit.cc/?ref=VAK416FU" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#4f46e5;color:#fff;padding:8px 16px;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.1);transition:background .2s;" onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
    <span class="material-symbols-outlined" style="font-size:18px;">auto_awesome</span>
    <span>BUY CLAUDE KIT WITH 20% OFF</span>
  </a>
  <a href="https://buymeacoffee.com/leotrinh" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#facc15;color:#b91c1c;padding:8px 16px;border-radius:9999px;font-weight:700;font-size:13px;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.1);transition:background .2s;" onmouseover="this.style.background='#fde047'" onmouseout="this.style.background='#facc15'">
    <span class="material-symbols-outlined" style="font-size:18px;">coffee</span>
    <span>BUY ME COFFEE</span>
  </a>
</div>
<!-- injected-banner-end -->
`;

function injectBanner() {
    if (!fs.existsSync(DOC_DIR)) {
        console.error('doc/ directory not found. Run "grunt jsdoc:dist" first.');
        process.exit(1);
    }

    const files = fs.readdirSync(DOC_DIR).filter(f => f.endsWith('.html'));
    let count = 0;

    for (const file of files) {
        const filePath = path.join(DOC_DIR, file);
        let html = fs.readFileSync(filePath, 'utf8');

        // Remove old injected banner if re-running
        html = html.replace(/<!-- injected-banner-start -->[\s\S]*?<!-- injected-banner-end -->\n?/g, '');

        // Inject after <div id="main">
        const target = '<div id="main">';
        if (html.includes(target)) {
            html = html.replace(target, target + '\n' + BANNER_HTML);
            fs.writeFileSync(filePath, html, 'utf8');
            count++;
        }
    }

    console.log(`Banner injected into ${count} HTML file(s) in doc/.`);

    // index.html only: replace empty <h3> with ClaudeKit ad image
    const indexPath = path.join(DOC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
        let indexHtml = fs.readFileSync(indexPath, 'utf8');
        // Remove old injected ad if re-running
        indexHtml = indexHtml.replace(/<!-- injected-ad-start -->[\s\S]*?<!-- injected-ad-end -->\n?/g, '');
        // Replace the empty <h3> </h3> with the ad
        const adHtml = `<!-- injected-ad-start -->\n<a href="https://claudekit.cc/?ref=VAK416FU" target="_blank">\n<img src="https://cdn.tinhtd.info/public/go1/ads_ck.png" width="100%">\n</a>\n<!-- injected-ad-end -->`;
        indexHtml = indexHtml.replace(/<h3>\s*<\/h3>/, adHtml);
        fs.writeFileSync(indexPath, indexHtml, 'utf8');
        console.log('ClaudeKit ad image injected into index.html.');
    }
}

injectBanner();
