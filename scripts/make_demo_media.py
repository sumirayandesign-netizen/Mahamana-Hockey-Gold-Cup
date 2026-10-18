from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, subprocess, math
ROOT=os.path.dirname(os.path.dirname(__file__))
out=os.path.join(ROOT,'assets/media');os.makedirs(out,exist_ok=True)
logo=Image.open(os.path.join(ROOT,'assets/brand/mhgc-2027-logo.png')).convert('RGBA');logo.thumbnail((320,320))
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def ft(n):return ImageFont.truetype(font,n)
fs=os.path.join(out,'demo-frames');os.makedirs(fs,exist_ok=True)
w,h=480,854
for i in range(48):
 t=i/48
 im=Image.new('RGB',(w,h)); px=im.load()
 for y in range(h):
  for x in range(w):
   light=max(0,1-math.hypot(x-250,y-385)/640)
   px[x,y]=(int(6+12*light),int(24+40*light),int(48+65*light))
 d=ImageDraw.Draw(im,'RGBA')
 for j in range(4):
  off=(t*400+j*150)%720
  d.line([(-160+off,0),(230+off,h)],fill=(90,155,227,22),width=32)
 d.ellipse((60,162,420,522),outline=(240,184,44,70),width=3)
 d.ellipse((95,196,385,486),outline=(240,184,44,35),width=2)
 bob=round(8*math.sin(t*2*math.pi))
 im.paste(logo,((w-logo.width)//2,180+bob),logo)
 d=ImageDraw.Draw(im,'RGBA')
 d.rounded_rectangle((32,25,448,72),13,fill=(247,183,48,255))
 d.text((49,36),'WEBSITE PLAYER DEMONSTRATION',fill=(10,31,59),font=ft(16))
 d.text((w/2,570),'HOCKEY GOLD CUP',font=ft(28),anchor='mm',fill=(255,255,255))
 d.text((w/2,611),'15 - 17 JAN 2027',font=ft(21),anchor='mm',fill=(251,194,54))
 d.line([(58,690),(422,690)], fill=(235,181,45,170),width=2)
 d.text((w/2,727),'NOT 2026 EVENT FOOTAGE',font=ft(15),anchor='mm',fill=(245,245,245))
 d.text((w/2,762),'Replace with official reels',font=ft(14),anchor='mm',fill=(190,206,227))
 im.save(os.path.join(fs,f'{i:03d}.jpg'),quality=86)
 if i==9: im.save(os.path.join(out,'player-demo-poster.jpg'),quality=88)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-framerate','12','-i',os.path.join(fs,'%03d.jpg'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','29','-movflags','+faststart',os.path.join(out,'player-demo.mp4')],check=True)
import shutil;shutil.rmtree(fs)
print('demo video created')
