/* Mahamana Hockey Gold Cup 2027 — client interactions, no third-party JS dependencies. */
(()=>{'use strict';
const $=(s,parent=document)=>parent.querySelector(s), $$=(s,parent=document)=>[...parent.querySelectorAll(s)];
const DATA=window.MHGC_CONTENT||{reels:[],albums:[]};
const prefix=document.body.dataset.prefix||'';
const absoluteLocal=(path)=>prefix+String(path||'').replace(/^\//,'');
const escapeHTML=(s)=>String(s??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const modal=$('#media-modal');const mediaBox=$('.modal-media',modal);const mediaCaption=$('.modal-caption',modal);const outsideLink=$('.modal-action',modal);
let queue=[],position=0,focusReturn=null,mode='video';
const hideModal=()=>{if(!modal.classList.contains('show'))return; const v=$('video',mediaBox);if(v)v.pause();mediaBox.replaceChildren();modal.classList.remove('show');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';if(focusReturn)focusReturn.focus();};
const mediaShow=(n)=>{
 if(!queue.length)return;position=(n+queue.length)%queue.length; const item=queue[position];mediaBox.replaceChildren();outsideLink.style.display='none';outsideLink.removeAttribute('href');
 if(mode==='video'){
  if(item.src){const v=document.createElement('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.poster=item.poster?absoluteLocal(item.poster):'';v.src=absoluteLocal(item.src);v.setAttribute('aria-label',item.title||'Tournament video');mediaBox.append(v);v.play().catch(()=>{});}
  else if(item.instagram&&/^https:\/\/(www\.)?instagram\.com\/(reel|p)\/[A-Za-z0-9_-]+\/?/i.test(item.instagram)){
    const frame=document.createElement('iframe');frame.title=item.title||'Instagram tournament post';frame.loading='lazy';
    frame.setAttribute('allow','encrypted-media; picture-in-picture; fullscreen');frame.allowFullscreen=true;
    const clean=item.instagram.match(/^https:\/\/(?:www\.)?instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/i);
    frame.src='https://www.instagram.com/'+clean[1]+'/'+clean[2]+'/embed/';
    mediaBox.append(frame);
  }else {const pane=document.createElement('div');pane.className='embed-unavailable';pane.innerHTML='<strong>Instagram preview unavailable</strong><p>Open the original post using the link below.</p>';mediaBox.append(pane);}

  if(item.instagram&&/^https:\/\/(www\.)?instagram\.com\//i.test(item.instagram)){outsideLink.href=item.instagram;outsideLink.style.display='block';}
  mediaCaption.textContent=(item.title||'Video')+(item.demo?' · Demonstration only — NOT actual 2026 tournament footage':'');
 }else{
  let image=document.createElement('img');image.src=absoluteLocal(item.src);image.alt=item.alt||item.title||'Photo';image.addEventListener('error',()=>{image.alt='Image could not be loaded';});mediaBox.append(image);
  mediaCaption.textContent=(position+1)+' / '+queue.length+' — '+(item.title||'Event image')+(item.credit?' · '+item.credit:'');
 }
 $$('.modal-change',modal).forEach(b=>{b.style.display=queue.length>1?'':'none';});
};
const showModal=(list,n,type,source)=>{queue=list;mode=type;position=n;focusReturn=source||document.activeElement;modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';mediaShow(n);$('.modal-close',modal).focus();};
$('.modal-close',modal).addEventListener('click',hideModal);
$('.modal-change.prev',modal).addEventListener('click',()=>mediaShow(position-1));
$('.modal-change.next',modal).addEventListener('click',()=>mediaShow(position+1));
modal.addEventListener('mousedown',(e)=>{if(e.target===modal)hideModal();});
document.addEventListener('keydown',(e)=>{
 if(modal.classList.contains('show')){if(e.key==='Escape'){e.preventDefault();hideModal();}if(e.key==='ArrowRight'){e.preventDefault();mediaShow(position+1);}if(e.key==='ArrowLeft'){e.preventDefault();mediaShow(position-1);}return;}
 if(e.key==='Escape'){$$('.dropdown-wrap.open').forEach(n=>{n.classList.remove('open');$('.nav-trigger',n)?.setAttribute('aria-expanded','false');});}
});
// Desktop header: click, hover, focus, Escape and outside-click.
$$('.nav-trigger').forEach(btn=>{
 const parent=btn.closest('.dropdown-wrap');
 btn.addEventListener('click',(e)=>{e.stopPropagation();const open=parent.classList.contains('open');$$('.dropdown-wrap.open').forEach(x=>{x.classList.remove('open');$('.nav-trigger',x)?.setAttribute('aria-expanded','false');});parent.classList.toggle('open',!open);btn.setAttribute('aria-expanded',String(!open));});
 parent.addEventListener('mouseenter',()=>btn.setAttribute('aria-expanded','true'));
 parent.addEventListener('mouseleave',()=>{if(!parent.classList.contains('open'))btn.setAttribute('aria-expanded','false');});
});
document.addEventListener('click',(e)=>{if(!e.target.closest('.dropdown-wrap'))$$('.dropdown-wrap.open').forEach(el=>{el.classList.remove('open');$('.nav-trigger',el)?.setAttribute('aria-expanded','false');});});
const hamburger=$('.hamburger');const mobile=$('.mobile-panel');
hamburger?.addEventListener('click',()=>{const opened=mobile.classList.toggle('open');hamburger.setAttribute('aria-expanded',String(opened));hamburger.textContent=opened?'×':'☰';});
$$('.mobile-group>button').forEach(b=>b.addEventListener('click',()=>{const open=b.parentElement.classList.toggle('open');b.setAttribute('aria-expanded',String(open));$('span',b).textContent=open?'−':'+';}));
// Horizontal video carousels; content is supplied by editable content/site-content.json.
const previews=[];
$$('[data-reel-scroller]').forEach(scroller=>{
 const reels=(DATA.reels||[]).filter(r=>r.src||r.instagram);
 const ready=[];
 reels.forEach(r=>{let button=document.createElement('button');button.type='button';button.className='reel-card';button.setAttribute('aria-label','Play '+r.title);
  button.innerHTML=(r.poster?`<img src="${absoluteLocal(r.poster)}" alt="${escapeHTML(r.title)}" loading="lazy">`:'')+`<div class="reel-top">${escapeHTML(r.tag||'OFFICIAL REEL')}</div><div class="reel-play" aria-hidden="true">▶</div><div class="reel-info"><b>${escapeHTML(r.title)}</b><small>${r.instagram?'Tap for Instagram post':'Play tournament footage'}</small></div>`;
  const ix=ready.length;ready.push(r);button.addEventListener('click',()=>showModal(ready,ix,'video',button));scroller.append(button);
 });
 previews.forEach(([name,caption],i)=>{let c=document.createElement('div');c.className='reel-card coming';c.setAttribute('aria-label',name+' — upcoming');c.innerHTML=`<div class="reel-top">OFFICIAL MEDIA SOON</div><div class="reel-info"><b>${escapeHTML(name)}</b><small>${escapeHTML(caption)}</small></div>`;scroller.append(c);});
 const parent=scroller.closest('.section');parent?.querySelectorAll('[data-scroll-reels]').forEach(btn=>btn.addEventListener('click',()=>scroller.scrollBy({left:btn.dataset.scrollReels==='next'?460:-460,behavior:'smooth'})));
});
// Original photos from the tournament are organized by album and opened in a lightbox.
$$('[data-gallery]').forEach(target=>{
 const requested=target.dataset.gallery;const albums=DATA.albums||[];let active=requested==='all'?'all':requested;
 const flatten=()=>albums.flatMap(a=>(a.photos||[]).map(p=>({...p,album:a.slug,category:a.category})));
 const all=flatten();
 const wrap=document.createElement('div');const tabs=document.createElement('div');tabs.className='filter-bar';const grid=document.createElement('div');const status=document.createElement('div');target.append(wrap,tabs,grid,status);
 const render=()=>{
  tabs.replaceChildren();if(requested==='all'){
   const add=(key,name)=>{let b=document.createElement('button');b.className='filter-button'+(active===key?' active':'');b.type='button';b.textContent=name;b.addEventListener('click',()=>{active=key;render();});tabs.append(b);};
   add('all','All Photos');albums.forEach(a=>add(a.slug,a.name));
  }
  grid.replaceChildren();status.replaceChildren();const set=all.filter(p=>active==='all'||p.album===active);
  if(!set.length){let msg=document.createElement('div');msg.className='empty-media';msg.innerHTML='<div class="empty-symbol" aria-hidden="true">⌑</div><h3>Original photographs will appear here</h3><p>This gallery is fully prepared for authentic Mahamana Hockey Gold Cup 2026 photography. No unrelated or invented pictures have been inserted.</p><div class="small-note">An organizer can add images to <b>content/site-content.json</b> and rebuild the website.</div>';status.append(msg);return;}
  grid.className='photo-grid';const pageSize=32;let shown=0;
  const addBatch=()=>{const end=Math.min(set.length,shown+pageSize);for(let i=shown;i<end;i++){let photo=set[i],b=document.createElement('button');b.className='photo-card';b.setAttribute('aria-label','Open photo: '+(photo.title||'Event photo'));b.innerHTML=`<img src="${absoluteLocal(photo.thumbnail||photo.src)}" alt="${escapeHTML(photo.alt||photo.title||'Event photo')}" loading="lazy"><div class="photo-cap">${escapeHTML(photo.title||'Gallery image')}</div>`;b.addEventListener('click',()=>showModal(set,i,'photo',b));grid.append(b);}shown=end;status.replaceChildren();if(shown<set.length){const more=document.createElement('button');more.className='button outline';more.textContent='Load more photographs';more.addEventListener('click',addBatch);status.append(more);}};
  addBatch();
 };render();
});
// Forms send an adult enquiry directly to organizer-owned Google Apps Script once configured.
// Without a deployed endpoint, no data are sent and no success is claimed.
$$('[data-draft-form]').forEach(form=>{
 const message=$('.form-message',form), kind=form.dataset.formType||'contact';
 const endpoint=String(DATA.integrations?.googleAppsScriptUrl||'').trim();
 const valid=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
 if(valid){form.action=endpoint;form.method='POST';form.target='_blank';}
 form.addEventListener('submit',e=>{
  if(!form.reportValidity()){e.preventDefault();return;}
  if(!valid){e.preventDefault(); message.innerHTML='Online form submission has not been connected to Google Sheets yet. Please email <a href="mailto:mmmbiharunit@gmail.com">mmmbiharunit@gmail.com</a> or call the organizing team. No data were sent.';message.classList.add('show');return;}
  // The official Apps Script page is the ONLY confirmation of receipt.
  message.textContent='A new tab is opening with the official receiving service. Your enquiry is complete only if that tab displays a successful submission receipt. If not, contact mmmbiharunit@gmail.com.';
  message.classList.add('show');
 });
 form.addEventListener('reset',()=>{message.classList.remove('show');});
});
// Footer developer credit — appears beneath copyright on every page.
const copyrightLine=document.querySelector('.footer-bottom > span:first-child');
if(copyrightLine && !copyrightLine.querySelector('.site-credit')){
 const credit=document.createElement('div');credit.className='site-credit';
 credit.append(document.createTextNode('Designed & Maintained by '));
 const link=document.createElement('a');link.href='https://www.sumirayandesign.com/';
 link.target='_blank';link.rel='noopener noreferrer';link.textContent='Sumirayan Design';
 credit.append(link);copyrightLine.append(credit);
}

})();
