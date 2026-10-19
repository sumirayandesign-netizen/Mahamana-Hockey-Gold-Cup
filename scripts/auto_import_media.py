#!/usr/bin/env python3
"""Build a fast 2026 archive from raw photographs/ in GitHub Actions.

Inputs stay unchanged under photographs/. Outputs go to assets/ and the
site's structured content; the existing 2026 galleries stay intact.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "photographs"
DATA_FILE = ROOT / "content" / "site-content.json"
IMAGE_DIR = ROOT / "assets" / "photos" / "2026-uploaded"
VIDEO_DIR = ROOT / "assets" / "media" / "2026-uploaded"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v"}
ALBUM_SLUG = "event-photographs"

def unique_stem(path: Path) -> str:
    relative = path.relative_to(SOURCE).as_posix()
    readable = re.sub(r"[^a-z0-9-]+", "-", path.stem.lower()).strip("-")[:55] or "media"
    digest = hashlib.sha256(relative.encode("utf-8")).hexdigest()[:9]
    return readable + "-" + digest

def convert_images(files: list[Path]) -> list[dict]:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    rows = []
    for number, source in enumerate(files, 1):
        name = unique_stem(source)
        display = IMAGE_DIR / (name + ".webp")
        thumbnail = IMAGE_DIR / (name + "-thumb.webp")
        try:
            with Image.open(source) as original:
                image = ImageOps.exif_transpose(original).convert("RGB")
                full = image.copy()
                full.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
                full.save(display, "WEBP", quality=79, method=5)
                full.close()
                image.thumbnail((580, 440), Image.Resampling.LANCZOS)
                image.save(thumbnail, "WEBP", quality=69, method=5)
        except (OSError, ValueError, UnidentifiedImageError) as error:
            print("Skipping unreadable photo:", source, error)
            continue
        rows.append({
            "id": "uploaded-photo-" + name,
            "src": display.relative_to(ROOT).as_posix(),
            "thumbnail": thumbnail.relative_to(ROOT).as_posix(),
            "title": "Tournament Photograph " + str(number).zfill(2),
            "alt": "Mahamana Hockey Gold Cup 2026: tournament photograph " + str(number),
            "credit": "Mahamana Hockey Gold Cup 2026 event archive",
            "downloadable": False,
        })
        print("Optimized photo:", source.name, "=>", display.name)
    return rows

def convert_videos(files: list[Path]) -> list[dict]:
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    reels = []
    for number, source in enumerate(files, 1):
        name = unique_stem(source)
        output = VIDEO_DIR / (name + ".mp4")
        poster = VIDEO_DIR / (name + ".webp")
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(source),
            "-vf", "scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "27",
            "-maxrate", "1600k", "-bufsize", "3200k", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
            "-map_metadata", "-1", str(output),
        ]
        try:
            subprocess.run(cmd, check=True)
            subprocess.run([
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-ss", "1", "-i", str(output), "-frames:v", "1",
                "-vf", "scale=640:-2", "-c:v", "libwebp", "-quality", "75",
                str(poster),
            ], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError) as error:
            print("Skipping invalid/unavailable video:", source, error)
            output.unlink(missing_ok=True)
            poster.unlink(missing_ok=True)
            continue
        reels.append({
            "id": "uploaded-video-" + name,
            "title": "2026 Tournament Video " + str(number).zfill(2),
            "tag": "2026 · EVENT FOOTAGE",
            "poster": poster.relative_to(ROOT).as_posix(),
            "src": output.relative_to(ROOT).as_posix(),
            "instagram": "",
            "type": "mp4",
            "demo": False,
        })
        print("Optimized video:", source.name, "=>", output.name)
    return reels

def main() -> None:
    if not SOURCE.is_dir():
        print("No photographs/ directory yet. Waiting for original uploads.")
        return

    originals = sorted((p for p in SOURCE.rglob("*") if p.is_file()), key=lambda p: p.as_posix().lower())
    photos = [p for p in originals if p.suffix.lower() in IMAGE_EXTENSIONS]
    videos = [p for p in originals if p.suffix.lower() in VIDEO_EXTENSIONS]
    print("Raw uploads found:", len(photos), "photos and", len(videos), "videos.")
    if not photos and not videos:
        return

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    if photos:
        optimized_photos = convert_images(photos)
        album = next((a for a in data["albums"] if a["slug"] == ALBUM_SLUG), None)
        if album is None:
            album = {
                "slug": ALBUM_SLUG,
                "name": "2026 Event Photographs",
                "description": "Original moments from the Mahamana Hockey Gold Cup 2026 in Rajgir.",
                "category": "Tournament Archive",
                "photos": [],
            }
            data["albums"].insert(0, album)
        album["photos"] = optimized_photos
    if videos:
        data["reels"] = [r for r in data.get("reels", []) if not r.get("id", "").startswith("uploaded-video-")]
        data["reels"] = convert_videos(videos) + data["reels"]

    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run(["python", "scripts/build.py"], cwd=ROOT, check=True)
    print("Complete: website gallery and video pages rebuilt.")

if __name__ == "__main__":
    main()
