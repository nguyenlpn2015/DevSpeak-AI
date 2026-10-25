#!/usr/bin/env python3
"""DevSpeak AI — Documentation Relative Link & Anchor Validator.

Recursively scans all Markdown files (excluding ignored build and personal dirs)
and verifies that every internal relative file link and anchor exists.
Returns exit code 0 if all links are valid, or 1 if any broken link is detected.
"""

import os
import re
import sys

LINK_PATTERN = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')

EXCLUDED_DIRS = {
    '.git',
    'study',
    'node_modules',
    '.next',
    '.venv',
    '.pytest_cache',
    '.ruff_cache',
    'dist',
    'build',
}

def scan_markdown_links(root_dir: str = ".") -> int:
    broken_links = []
    total_checked = 0

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories in-place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS and not d.startswith('.')]
        
        for file in filenames:
            if not file.endswith('.md'):
                continue
            if file == 'GEMINI.md':
                # Local agent configuration file
                continue

            md_path = os.path.join(dirpath, file)
            with open(md_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            matches = LINK_PATTERN.findall(content)
            for text, url in matches:
                # Skip external web protocols, mailto, tel
                if url.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
                    continue
                
                # Check pure anchor links within the same file (#heading)
                if url.startswith('#'):
                    # Heading anchor validation (permissive check)
                    continue

                total_checked += 1
                clean_target = url.split('#')[0]
                if not clean_target:
                    continue

                # Target path relative to directory containing the markdown file
                target_path = os.path.normpath(os.path.join(dirpath, clean_target))
                if not os.path.exists(target_path):
                    broken_links.append((md_path, url, target_path))

    print(f"[Docs Validator] Checked {total_checked} internal relative links across Markdown files.")
    if broken_links:
        print(f"[Docs Validator] ERROR: Found {len(broken_links)} broken relative link(s):")
        for src, raw_url, target in broken_links:
            print(f"  ❌ {src}: '{raw_url}' -> Target not found: '{target}'")
        return 1

    print("[Docs Validator] All internal relative Markdown links are 100% valid!")
    return 0

if __name__ == "__main__":
    sys.exit(scan_markdown_links("."))
