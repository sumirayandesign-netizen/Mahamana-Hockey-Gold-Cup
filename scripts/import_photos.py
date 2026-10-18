#!/usr/bin/env python3
"""Import genuine event photographs in bulk by album slug.
Example: python scripts/import_photos.py /path/to/2026/match-action match-action
Requires Pillow. Uses sequential filenames and generates WebP previews.
"""
from pathlib import Path
import sys,json,shutil,re
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1]
if len(sys.argv)<3:
 print('Usage: python scripts/import_photos.py /path/to/photos ALBUM_SLUG [CREDIT]');sys.exit(1)
folder=Path(sys.argv[1]).expanduser().resolve();slug=sys.argv[2];credit=sys.argv[3] if len(sys.argv)>3 else ''
source=root/'content/site-content.json'
data=json.loads(source.read_text());album=next((a for a in data['albums'] if a['slug']==slug),None)
if not album:sys.exit('Unknown album: '+slug+'\nAvailable: '+', '.join(x['slug'] for x in data['albums']))
if not folder.exists():sys.exit('Folder not found: '+str(folder))
dest=root/'assets'/'photos'/slug;dest.mkdir(parents=True,exist_ok=True)
files=sorted(p for p in folder.iterdir() if p.suffix.lower() in ['.jpeg','.jpg','.png','.webp'])
existing={p.get('src') for p in album['photos']}
new=0
for i,p in enumerate(files,1):
 stem=re.sub('[^a-zA-Z0-9_-]+','-',p.stem.lower()).strip('-')[:55] or 'photo'
 with Image.open(p) as image:
  image=ImageOps.exif_transpose(image).convert('RGB')
  original=dest/f'{stem}-{i:04d}.webp';image.thumbnail((2200,2200));image.save(original,'WEBP',quality=90,method=5)
  thumb=dest/f'{stem}-{i:04d}-thumb.webp';image.thumbnail((630,500));image.save(thumb,'WEBP',quality=78,method=5)
 original_rel=original.relative_to(root).as_posix();thumb_rel=thumb.relative_to(root).as_posix()
 if original_rel in existing:continue
 title=p.stem.replace('_',' ').replace('-',' ').strip().title()
 album['photos'].append({'id':f'{slug}-{i:04d}','src':original_rel,'thumbnail':thumb_rel,'title':title,'alt':f'{album["name"]}: {title}','credit':credit,'downloadable':False})
 new+=1
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'Imported {new} photographs into {slug}. Now run: python scripts/build.py')
