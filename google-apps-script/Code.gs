/**
 * Mahamana Hockey Gold Cup 2027 — Google Sheets form receiving service.
 * Deploy from mmmbiharunit@gmail.com account only after organizer authorization.
 * Users fill ADULT-ONLY contact, sponsor or team-interest enquiries.
 * It deliberately does NOT accept player DOB, roster, identity-document or file uploads.
 */
const EVENT_NAME = 'Mahamana Hockey Gold Cup 2027';
const ADMIN_EMAIL = 'mmmbiharunit@gmail.com';
const SHEET_ID_KEY = 'MHGC_GOOGLE_SHEET_ID';
const LABELS = {contact:'Contact',sponsor:'Sponsorship',register:'Team Interest'};
const HEADERS = ['Submitted at (India)', 'Reference','Type','Adult contact person','Institution / organization','Email','Phone','Category / subject','State / region','Message','Adult consent'];

function setup() {
  const prop=PropertiesService.getScriptProperties();
  let id=prop.getProperty(SHEET_ID_KEY);
  if (!id) {
    const book=SpreadsheetApp.create(EVENT_NAME+' — Official Enquiry Submissions');
    id=book.getId();prop.setProperty(SHEET_ID_KEY,id);
    const first=book.getSheets()[0];first.setName(LABELS.contact);
  }
  const book=SpreadsheetApp.openById(id);
  Object.keys(LABELS).forEach(k=>{
    let sh=book.getSheetByName(LABELS[k]);
    if(!sh)sh=book.insertSheet(LABELS[k]);
    if(sh.getLastRow()===0){sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold');sh.setFrozenRows(1);}
  });
  Logger.log('Created/verified Google Sheet in this account\'s Drive: '+book.getUrl());
  return book.getUrl();
}
function clean_(v,max){return String(v||'').trim().slice(0,max);}
function safeCell_(v){v=clean_(v,1850);return /^[=+@\-\t\r]/.test(v)?"'"+v:v;}
function cleanHtml_(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function receipt_(ok,headline,details,ref){
  const color=ok?'#1b9365':'#c75050';
  const html='<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gold Cup enquiry status</title>'+ 
  '<style>body{background:#061d38;color:#153353;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px;font-family:Arial,sans-serif}main{background:white;max-width:560px;border-radius:18px;padding:42px;box-shadow:0 20px 70px #0005;border-top:7px solid '+color+'}h1{margin:14px 0}small{color:#668}p{line-height:1.7}b{color:#164973}a{color:#116aab}</style>'+ 
  '<main><small>MAHAMANA HOCKEY GOLD CUP 2027 · OFFICIAL RECEIVING SERVICE</small><h1>'+cleanHtml_(headline)+'</h1><p>'+cleanHtml_(details)+'</p>'+(ref?'<p><b>Reference:</b> '+cleanHtml_(ref)+'</p>':'')+'<p>Questions? <a href="mailto:'+ADMIN_EMAIL+'">'+ADMIN_EMAIL+'</a></p><small>You may now close this tab.</small></main></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Mahamana Gold Cup enquiry status');
}
function doGet(){return receipt_(true,'Form receiving service is ready','Submissions must be sent through the official website form. Do not enter personal information into this page.','');}
function doPost(e){
  try{
    if(!e||!e.parameter) return receipt_(false,'No form data received','Please return to the website and complete the required fields.','');
    const p=e.parameter;
    const type=clean_(p.formType,20);
    if(!Object.prototype.hasOwnProperty.call(LABELS,type))return receipt_(false,'Invalid form type','No data were recorded.','');
    if(clean_(p.website_field,255))return receipt_(false,'Submission rejected','Please contact the organizer by email.','');
    if(p.consent!=='yes')return receipt_(false,'Adult consent required','The enquiry was not recorded.','');
    const representative=clean_(p.representative,180),organization=clean_(p.organization,180),email=clean_(p.email,180),phone=clean_(p.phone,40);
    const category=clean_(p.category,150),state=clean_(p.state,120),message=clean_(p.message,1800);
    if(!representative||!email||!/^\S+@\S+\.\S+$/.test(email))return receipt_(false,'Please verify your contact information','No data were recorded.','');
    if(type!=='contact'&&!organization)return receipt_(false,'Organization name needed','No data were recorded.','');
    const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,type+'|'+email.toLowerCase());
    const key=Utilities.base64EncodeWebSafe(digest).slice(0,80);
    const cache=CacheService.getScriptCache();
    if(cache.get(key))return receipt_(false,'Please wait before resubmitting','We allow one form submission per email/category every 45 seconds to prevent duplicates.','');
    const id=PropertiesService.getScriptProperties().getProperty(SHEET_ID_KEY);
    if(!id)return receipt_(false,'Receiving service not configured','Please ask the organizer to run the one-time setup function. No data were recorded.','');
    const lock=LockService.getScriptLock();lock.waitLock(15000);
    let reference='';
    try{
      const book=SpreadsheetApp.openById(id);
      const sh=book.getSheetByName(LABELS[type]);
      if(!sh)throw new Error('Form sheet missing');
      const time=Utilities.formatDate(new Date(),'Asia/Kolkata','yyyy-MM-dd HH:mm:ss');
      reference='MHGC-'+Utilities.formatDate(new Date(),'Asia/Kolkata','yyMMdd')+'-'+Utilities.getUuid().slice(0,7).toUpperCase();
      sh.appendRow([time,reference,LABELS[type],safeCell_(representative),safeCell_(organization),safeCell_(email),safeCell_(phone),safeCell_(category),safeCell_(state),safeCell_(message),'yes']);
      SpreadsheetApp.flush();
      cache.put(key,'1',45);
    }finally{lock.releaseLock();}
    // Email notification is best-effort; saving to organizer-owned Drive Sheet is authoritative.
    try{MailApp.sendEmail({to:ADMIN_EMAIL,subject:'MHGC 2027 | '+LABELS[type]+' | '+reference,body:'A new adult enquiry has been added to your official Google Drive spreadsheet.\n\nReference: '+reference+'\nType: '+LABELS[type]+'\nCheck your Google Sheet for full details.\n\nDo not reply to this automated notification.'});}catch(ex){console.warn('Notification failed, sheet record saved: '+ex.message);}
    return receipt_(true,'Enquiry received','Your information has been saved in the organizer\'s Google Drive spreadsheet. This acknowledgement is not a confirmed tournament registration or team selection.',reference);
  }catch(err){console.error(err);return receipt_(false,'Submission not confirmed','Please try again later or contact the organizer directly at '+ADMIN_EMAIL+'. Do not assume your enquiry was recorded.','');}
}
