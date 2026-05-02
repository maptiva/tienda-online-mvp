#!/usr/bin/env python3
"""
Export Instagram carousel slides as individual 1080x1350px PNGs.

Usage:
    python export_slides.py <carousel.html> <output_dir> [--slides N]

Requirements:
    pip install playwright
    playwright install chromium
"""

import argparse
import asyncio
import sys
from pathlib import Path


async def export_slides(html_path: Path, output_dir: Path, total_slides: int):
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
        sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Carousel designed at 420px wide, 4:5 aspect = 525px tall
    # Target output: 1080x1350 → scale factor = 1080/420
    VIEW_W = 420
    VIEW_H = 525
    SCALE = 1080 / 420  # ≈ 2.5714

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": VIEW_W, "height": VIEW_H},
            device_scale_factor=SCALE,
        )

        html_content = html_path.read_text(encoding="utf-8")
        await page.set_content(html_content, wait_until="networkidle")
        await page.wait_for_timeout(3000)  # Wait for Google Fonts to load

        # Strip IG frame chrome, expose only the slide viewport
        await page.evaluate("""() => {
            document.querySelectorAll('.ig-header,.ig-dots,.ig-actions,.ig-caption')
                .forEach(el => el.style.display = 'none');

            const frame = document.querySelector('.ig-frame');
            if (frame) {
                frame.style.cssText = 'width:420px;height:525px;max-width:none;border-radius:0;box-shadow:none;overflow:hidden;margin:0;';
            }

            const viewport = document.querySelector('.carousel-viewport');
            if (viewport) {
                viewport.style.cssText = 'width:420px;height:525px;aspect-ratio:unset;overflow:hidden;cursor:default;';
            }

            document.body.style.cssText = 'padding:0;margin:0;display:block;overflow:hidden;';
        }""")
        await page.wait_for_timeout(500)

        print(f"Exporting {total_slides} slides → {output_dir}/")

        for i in range(total_slides):
            # Snap to slide i instantly (no animation)
            await page.evaluate("""(idx) => {
                const track = document.querySelector('.carousel-track');
                if (track) {
                    track.style.transition = 'none';
                    track.style.transform = 'translateX(' + (-idx * 420) + 'px)';
                }
            }""", i)
            await page.wait_for_timeout(400)

            out_path = output_dir / f"slide_{i + 1:02d}.png"
            await page.screenshot(
                path=str(out_path),
                clip={"x": 0, "y": 0, "width": VIEW_W, "height": VIEW_H},
            )
            print(f"  ✓ slide {i + 1}/{total_slides} → {out_path.name}")

        await browser.close()

    print(f"\nDone. {total_slides} slides exported to: {output_dir.resolve()}")


def main():
    parser = argparse.ArgumentParser(description="Export carousel HTML slides as 1080x1350 PNGs")
    parser.add_argument("html", help="Path to the carousel HTML file")
    parser.add_argument("output_dir", help="Directory to save PNG slides")
    parser.add_argument("--slides", type=int, required=True, help="Total number of slides in the carousel")
    args = parser.parse_args()

    html_path = Path(args.html)
    if not html_path.exists():
        print(f"ERROR: File not found: {html_path}")
        sys.exit(1)

    output_dir = Path(args.output_dir)

    asyncio.run(export_slides(html_path, output_dir, args.slides))


if __name__ == "__main__":
    main()
