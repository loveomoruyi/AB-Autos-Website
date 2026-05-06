#!/usr/bin/env python3
"""
Script to update AB Autos Website:
1. Center 'Our Vehicle Inventory' title in inventory.html
2. Update music toggle button across all 12 HTML files
"""

import os

WEBSITE_DIR = os.path.expanduser("~/AB-Autos-Website")

HTML_FILES = [
    "index.html", "inventory.html", "rental.html", "gallery.html",
    "contact.html", "aboutus.html", "garage.html", "dealership.html",
    "scheduling.html", "service.html", "autobody.html", "tire-service.html"
]

log_lines = []

def log(msg):
    print(msg)
    log_lines.append(msg)

def fix_inventory_centering():
    """Add text-align: center; to .hero-banner CSS block in inventory.html"""
    filepath = os.path.join(WEBSITE_DIR, "inventory.html")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_css = ".hero-banner {\n    padding: 60px 20px;\n    position: relative;\n    overflow: hidden;\n}"
    new_css = ".hero-banner {\n    padding: 60px 20px;\n    position: relative;\n    overflow: hidden;\n    text-align: center;\n}"
    
    if old_css in content:
        content = content.replace(old_css, new_css)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        log("OK inventory.html: Added text-align: center; to .hero-banner CSS block")
        return True
    elif "text-align: center;" in content and ".hero-banner" in content:
        log("SKIP inventory.html: text-align: center; already present")
        return True
    else:
        log("FAIL inventory.html: Could not find expected .hero-banner CSS block")
        return False

def fix_music_toggle():
    """Update music toggle button in all 12 HTML files"""
    success_count = 0
    
    for filename in HTML_FILES:
        filepath = os.path.join(WEBSITE_DIR, filename)
        if not os.path.exists(filepath):
            log(f"FAIL {filename}: File not found")
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        changes_made = 0
        
        # 1. Replace initial b.textContent="OFF"
        old_initial = 'b.textContent="OFF";'
        new_initial = 'b.innerHTML="<span style=\\"position:relative;display:inline-block;\\">\\u266B<span style=\\"position:absolute;top:-2px;left:0;font-size:22px;transform:rotate(-45deg);pointer-events:none;\\">\\u2014</span></span>";'
        
        if old_initial in content:
            content = content.replace(old_initial, new_initial)
            changes_made += 1
        
        # 2. Replace setOn function
        old_setOn = 'function setOn(){playing=true;b.textContent="ON";b.style.setProperty("border-color","#00ff00","important");}'
        new_setOn = 'function setOn(){playing=true;b.innerHTML="\\u266B";b.style.setProperty("border-color","#00ff00","important");}'
        
        if old_setOn in content:
            content = content.replace(old_setOn, new_setOn)
            changes_made += 1
        
        # 3. Replace setOff function
        old_setOff = 'function setOff(){playing=false;b.textContent="OFF";b.style.setProperty("border-color","#d4af37","important");}'
        new_setOff = 'function setOff(){playing=false;b.innerHTML="<span style=\\"position:relative;display:inline-block;\\">\\u266B<span style=\\"position:absolute;top:-2px;left:0;font-size:22px;transform:rotate(-45deg);pointer-events:none;\\">\\u2014</span></span>";b.style.setProperty("border-color","#d4af37","important");}'
        
        if old_setOff in content:
            content = content.replace(old_setOff, new_setOff)
            changes_made += 1
        
        # 4. Replace font-size:14px with font-size:22px
        old_font = 'font-size:14px !important;font-weight:bold'
        new_font = 'font-size:22px !important;font-weight:bold'
        
        if old_font in content:
            content = content.replace(old_font, new_font)
            changes_made += 1
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        if changes_made > 0:
            log(f"OK {filename}: {changes_made} replacements made")
            success_count += 1
        else:
            log(f"SKIP {filename}: No changes needed (already updated or patterns not found)")
    
    return success_count

if __name__ == "__main__":
    log("=" * 60)
    log("AB Autos Website Update Script")
    log("=" * 60)
    log("")
    
    log("--- Step 1: Center inventory title ---")
    fix_inventory_centering()
    log("")
    
    log("--- Step 2: Update music toggle buttons ---")
    count = fix_music_toggle()
    log(f"\nUpdated {count} files successfully")
    log("")
    log("=" * 60)
    log("Update complete!")
    log("=" * 60)
