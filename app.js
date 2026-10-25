'use strict';
const $ = (s, root = document) => root.querySelector(s);
const content = window.PORTFOLIO_CONTENT;
let lang = 'ar';
try { lang = localStorage.getItem('portfolio-language') === 'en' ? 'en' : 'ar'; } catch {}
const dialog = $('#project-dialog');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let paused = false, observer, lastFocus, activeProject = null, scrollFrame = 0, wirdSection = 'mushaf';
const tr = (ar, en) => lang === 'ar' ? ar : en;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img = (name, alt, cls = '', eager = false) => `<img class="${cls}" src="assets/images/${name}.webp" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
function duo(screen = 'wird-reading', eager = false) { return `<div class="duo">${img('duo-frame','', 'duo-frame',eager)}${img(screen,tr('وِرد على شاشة iPhone Duo','Wird on iPhone Duo'),'duo-screen',eager)}</div>`; }
function phone(screen) { return `<div class="phone"><div class="phone-screen">${screen}</div>${img('iphone-frame','','phone-chrome')}<span class="island" aria-hidden="true"></span></div>`; }
function iphone18(screen, alt) { return `<div class="iphone18">${img('iphone-18-pro-frame','','iphone18-chrome')}${img(screen,alt,'iphone18-screen')}</div>`; }
function wirdSections() {
  return [
    {id:'mushaf', label:tr('المصحف','Mushaf'), device:'iPhone Duo', title:tr('اقرأ. افهم. راجع.','Read. Understand. Review.'), detail:tr('مصاحف متعددة، وتفسير وتلاوة ومراجعة حفظك.','Mushaf editions, tafsir, recitation and memorization practice.'), points:[tr('تفسير وترجمة عند الآية','Tafsir and translation at the ayah'),tr('مراجعة من الموضع الذي تختاره','Review from your chosen place'),tr('مشاركة الآيات بصورة أو فيديو','Share ayahs as an image or video')]},
    {id:'tasbih', label:tr('المسبحة','Tasbih'), device:'iPhone 18 Pro', title:tr('سبّح بالصوت أو اللمس.','Count by voice or touch.'), detail:tr('اختر الذكر وابدأ. وكل تسبيحة تُحسب.','Choose a dhikr and begin. Every count is kept.'), points:[tr('خرز يتحرك مع كل تسبيحة','Beads that move with each count'),tr('العدّ بالصوت أو اللمس','Voice or touch counting'),tr('متابعة جلساتك في رحلتي','Your sessions in My Journey')]},
    {id:'prayer', label:tr('الصلاة','Prayer'), device:'iPhone 18 Pro', title:tr('اعرف وقت صلاتك.','Know your prayer times.'), detail:tr('المواقيت والقبلة ومسجدك في مكان واحد.','Prayer times, Qibla and your mosque in one place.'), points:[tr('مواقيت الصلاة والقبلة','Prayer times and Qibla'),tr('المساجد القريبة ومواعيد الإقامة','Nearby mosques and iqama times'),tr('تنبيهات الصلاة والإقامة','Prayer and iqama reminders')]}
  ];
}
function wirdSectionLinks(){return `<div class="wird-section-links" aria-label="${tr('أقسام وِرد','Wird sections')}">${wirdSections().map(s=>`<a href="#project-wird/${s.id}">${s.label}</a>`).join('')}</div>`;}
function wakeScreen(interactive = false) {
  const rows = [['06:30',tr('استيقاظ','Wake up')],['06:45',tr('استعداد','Get ready')],['07:00',tr('وقت الخروج','Time to leave')]];
  return `<div class="wake-ui"><span class="wake-status" dir="ltr">9:41</span>${img('wakebear-icon','WakeBear','wake-icon')}<h4>${tr('صباحك مرتب.','Morning, sorted.')}</h4><p class="small">${tr('منبّهاتك، على كيفك','Your alarms, your way')}</p><div class="alarm-group"><div class="group-head"><span class="group-name">${tr('الدوام','Workday')}</span>${toggle('group',tr('تفعيل مجموعة المنبهات','Enable alarm group'),interactive)}</div>${rows.map(([time,name],i)=>`<div class="alarm-row"><div><div class="alarm-time" dir="ltr">${time}</div><div class="alarm-name">${name}<span class="sound-name" data-row="${i}"> · ${tr(['نسيم','بيانو','شروق'][i],['Breeze','Piano','Sunrise'][i])}</span></div></div>${toggle(String(i),name,interactive)}</div>`).join('')}</div><p class="alarm-note">${tr('مجموعة واحدة ليومك','One group for your day')}</p></div>`;
}
function toggle(id,label,interactive){return interactive?`<button class="toggle" role="switch" aria-checked="true" aria-label="${label}" data-alarm="${id}"></button>`:`<span class="toggle" aria-hidden="true" aria-checked="true"></span>`;}
function projectLink(p){return `<a href="#project-${p.id}" class="text-link" aria-label="${content[lang].openProject}: ${p.name}">${content[lang].openProject}<span aria-hidden="true">↗</span></a>`;}
function render() {
  const t=content[lang], [w,b,c]=t.projects;
  document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.title=`${t.name} — UX/UI`;
  $('[name=description]').content=t.heroIntro;
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t[el.dataset.i18n]);
  $('#language').innerHTML=`${lang==='ar'?'English':'العربية'} <span aria-hidden="true">↗</span>`;
  $('#language').lang=lang==='ar'?'en':'ar';$('#language').ariaLabel=tr('Switch to English','التبديل إلى العربية');
  $('.nav').ariaLabel=tr('التنقل الرئيسي','Main navigation');
  $('.identity').ariaLabel=tr('الصفحة الرئيسية','Home');
  $('#back-top').textContent=tr('إلى الأعلى ↑','Back to top ↑');
  $('#close-dialog').ariaLabel=t.close;
  $('#main').innerHTML=`
    <section class="hero" id="top" aria-labelledby="hero-title"><div class="eyebrow hero-head"><span class="status-dot"></span><span>${t.name} · UX/UI</span></div>
    <h1 id="hero-title"><span>${t.heroLine1}</span><span class="soft">${t.heroLine2}</span></h1><p class="hero-intro">${t.heroIntro}</p><a class="hero-cta" href="#project-wird">${tr('اكتشف وِرد','Explore Wird')} <span aria-hidden="true">↗</span></a>
    <div class="hero-stage"><div class="fold-device" aria-label="${tr('وِرد على آيفون دو','Wird on iPhone Duo')}"><div class="fold-half fold-left">${duo('wird-reading',true)}</div><div class="fold-half fold-right" aria-hidden="true">${duo('wird-reading',true)}</div></div></div>
    <div class="hero-label"><span><strong>${w.name}</strong> &nbsp; / &nbsp; ${tr('القرآن، بمساحة أوسع.','More room for the Quran.')}</span><button class="motion-control" id="motion-control" aria-pressed="${paused}"><span aria-hidden="true">${paused?'▷':'Ⅱ'}</span>${paused?tr('تشغيل الحركة','Enable motion'):tr('إيقاف الحركة','Pause motion')}</button><span dir="ltr">iPhone Duo</span></div></section>
    <section class="section" id="work" aria-labelledby="work-title"><div class="section-heading reveal"><h2 id="work-title">${t.selectedWork}</h2><span class="index">01 — 03</span></div>
    <article class="project-wird reveal"><div class="project-info"><span class="project-kicker">01 / ${w.category}</span><h3>${w.name}</h3><p>${w.tagline}</p>${wirdSectionLinks()}${projectLink(w)}</div><div class="wird-card-art">${duo('wird-home')}</div></article>
    <div class="project-grid"><article class="project-card wake-card reveal"><div class="project-info"><span class="project-kicker">02 / ${b.category}</span><h3>WakeBear</h3><p>${b.tagline}</p>${projectLink(b)}</div><div class="card-art" aria-label="${tr('عرض توضيحي لفكرة WakeBear','WakeBear concept demo')}">${phone(wakeScreen())}</div></article>
    <article class="project-card creative-card reveal"><div class="project-info"><span class="project-kicker">03 / ${c.category}</span><h3>App Store Creative</h3><p>${c.tagline}</p>${projectLink(c)}</div><div class="card-art">${phone(img('creative-studio',tr('واجهة تطبيق App Store Creative الأصلية','Actual App Store Creative interface')))}</div></article></div></section>
    <section class="section about" id="about" aria-labelledby="about-title"><div class="about-layout reveal"><h2 id="about-title">${t.aboutTitle}</h2><div><p class="about-lead">${t.aboutLine}</p><p class="credentials"><span class="credential-mark" aria-hidden="true">✓</span>${t.certification}</p><div class="careers"><article class="career"><img src="assets/images/boubyan.svg" class="bank-logo" alt="${tr('بنك بوبيان','Boubyan Bank')}" width="114" height="57" loading="lazy"><p>${tr('مدير تصميم UX/UI','UX/UI Design Manager')}</p><small>${tr('بوبيان · حاليًا','Boubyan · Current')}<br>${tr('منذ أبريل ٢٠٢٥','Since April 2025')}</small></article><article class="career"><img src="assets/images/warba.svg" class="bank-logo" alt="${tr('بنك وربة','Warba Bank')}" width="114" height="57" loading="lazy"><p>${tr('التسويق الرقمي والاستراتيجية','Digital Marketing & Strategy')}</p><small>${tr('وربة · ٢٠١٦–٢٠١٩','Warba · 2016–2019')}</small></article></div></div></div></section>
    <section class="contact reveal" id="contact"><div class="eyebrow">${tr('عندك فكرة؟','Have something in mind?')}</div><h2>${t.contactTitle}</h2><div class="contact-links"><a href="mailto:alkwsh@gmail.com" dir="ltr">alkwsh@gmail.com ↗</a><a href="https://kw.linkedin.com/in/abdulrahman-al-wasmi-uxc-574a7b142" target="_blank" rel="noopener noreferrer" dir="ltr">LinkedIn ↗</a></div></section>`;
  observe();$('#motion-control').addEventListener('click',()=>{paused=!paused;document.body.classList.toggle('motion-paused',paused);$('#motion-control').ariaPressed=String(paused);$('#motion-control').innerHTML=`<span aria-hidden="true">${paused?'▷':'Ⅱ'}</span>${paused?tr('تشغيل الحركة','Enable motion'):tr('إيقاف الحركة','Pause motion')}`;});
}
function observe(){observer?.disconnect();if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('visible'));return;}observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));}
function features(p){return `<section class="feature-area"><h2>${content[lang].featuresTitle}</h2><div class="features">${p.features.map((f,i)=>`<article class="feature"><span class="feature-number">0${i+1}</span><div><h3>${f.title}</h3><p>${f.body}</p></div></article>`).join('')}</div></section>`;}
function openProject(id, section = 'mushaf'){
 const t=content[lang],p=t.projects.find(p=>p.id===id);if(!p)return;
 if(!dialog.open)lastFocus=document.activeElement;
 activeProject=id;if(id==='wird')wirdSection=wirdSections().some(s=>s.id===section)?section:'mushaf';$('#dialog-name').textContent=p.name;
 const visual=id==='wird'?screenTour():id==='creative'?`<div class="case-creative-media">${img('creative-home',tr('مساحة العمل الأصلية في التطبيق','Original app workspace'),'creative-home')}${phone(img('creative-studio',tr('استوديو الموكاب داخل التطبيق','Device mockup studio in the app')))}</div>`:wakeDemo();
 const whyTitle=id==='wird'?tr('لماذا صنعنا وِرد؟','Why we made Wird'):t.whyTitle;
 $('#project-content').innerHTML=`<article class="case case-${id}"><header class="case-header"><div class="eyebrow">${p.category} · UX/UI</div><h1 id="project-title">${p.name}</h1><p class="tagline">${p.tagline}</p><p class="summary">${p.summary}</p></header>${visual}${id==='wird'?`<section class="why"><h2>${whyTitle}</h2><p>${p.why}</p></section>`:''}${id==='wird'?'':features(p)}<div class="next-project"><a href="#project-${id==='wird'?'wakebear':id==='wakebear'?'creative':'wird'}">${tr('المشروع التالي','Next project')} ↗</a></div></article>`;
 if(!dialog.open)dialog.showModal();document.body.style.overflow='hidden';dialog.scrollTop=0;$('#close-dialog').focus({preventScroll:true});
 if(id==='wakebear')bindDemo();if(id==='wird')bindTour();
}
function sectionPanel(id){
 const s=wirdSections().find(s=>s.id===id)||wirdSections()[0];
 const device=s.id==='mushaf'?duo('wird-reading',true):iphone18('wird-'+s.id,tr(s.id==='tasbih'?'المسبحة في وِرد على آيفون 18 برو':'الصلاة في وِرد على آيفون 18 برو',s.id==='tasbih'?'Wird Tasbih on iPhone 18 Pro':'Wird Prayer on iPhone 18 Pro'));
 return `<div class="wird-section-layout ${s.id==='mushaf'?'mushaf-layout':'portrait-layout'}"><figure class="wird-device">${device}<figcaption dir="ltr">${s.device}</figcaption></figure><div class="wird-section-copy"><span class="project-kicker">${s.label}</span><h2>${s.title}</h2><p>${s.detail}</p><ul>${s.points.map(x=>`<li>${x}</li>`).join('')}</ul></div></div>`;
}
function screenTour(){return `<section class="wird-showcase" aria-label="${tr('أقسام وِرد','Wird sections')}"><div class="wird-tabs tabs" role="tablist" aria-label="${tr('أقسام وِرد','Wird sections')}">${wirdSections().map(s=>`<button role="tab" id="tab-${s.id}" aria-controls="tour-panel" data-screen="${s.id}" aria-selected="${s.id===wirdSection}" tabindex="${s.id===wirdSection?0:-1}">${s.label}</button>`).join('')}</div><div class="wird-section-panel" data-section="${wirdSection}" id="tour-panel" role="tabpanel" aria-labelledby="tab-${wirdSection}" tabindex="0">${sectionPanel(wirdSection)}</div></section>`;}
function selectWirdSection(id){
 if(!wirdSections().some(s=>s.id===id))id='mushaf';
 wirdSection=id;
 const panel=$('#tour-panel');if(!panel)return;
 dialog.querySelectorAll('[data-screen]').forEach(b=>{const selected=b.dataset.screen===id;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
 panel.setAttribute('aria-labelledby','tab-'+id);panel.dataset.section=id;panel.innerHTML=sectionPanel(id);panel.classList.remove('changing');requestAnimationFrame(()=>panel.classList.add('changing'));
}
function bindTour(){const tabs=[...dialog.querySelectorAll('[data-screen]')];const select=b=>{if(wirdSection===b.dataset.screen)return;location.hash='project-wird/'+b.dataset.screen;};tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(b));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+(lang==='ar'?-1:1)+tabs.length)%tabs.length;else if(e.key==='ArrowLeft')n=(i+(lang==='ar'?1:-1)+tabs.length)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();tabs[n].focus();select(tabs[n]);});});}
function wakeDemo(){return `<section class="demo-area"><div class="demo-controls"><h2>${tr('جرّب الفكرة.','Try the idea.')}</h2><p>${tr('سمّ المجموعة. غيّر النغمة. أوقفها كلها بمفتاح واحد.','Name the group. Pick a sound. Switch them all off together.')}</p><label for="group-input">${tr('اسم المجموعة','Group name')}</label><input id="group-input" value="${tr('الدوام','Workday')}" maxlength="24" autocomplete="off"><label for="sound-select">${tr('نغمة منبّه 6:30','Sound for the 6:30 alarm')}</label><select id="sound-select"><option value="breeze">${tr('نسيم','Breeze')}</option><option value="piano">${tr('بيانو','Piano')}</option><option value="sunrise">${tr('شروق','Sunrise')}</option></select><p class="demo-caption">${tr('عرض تفاعلي للفكرة؛ لا يضبط منبّهًا على جهازك.','An interactive concept; it does not set an alarm on your device.')}</p><div class="demo-feedback" aria-live="polite"></div></div>${phone(wakeScreen(true))}</section>`;}
function bindDemo(){const ui=$('.demo-area .wake-ui');$('#group-input').addEventListener('input',e=>$('.group-name',ui).textContent=e.target.value.trim()||tr('مجموعتي','My group'));$('#sound-select').addEventListener('change',e=>{const label=e.target.selectedOptions[0].textContent;$('[data-row="0"]',ui).textContent=' · '+label;$('.demo-feedback').textContent=tr('نغمة 6:30: ','6:30 sound: ')+label;});dialog.querySelectorAll('[data-alarm]').forEach(b=>b.addEventListener('click',()=>{const enabled=b.ariaChecked!=='true';b.ariaChecked=String(enabled);if(b.dataset.alarm==='group'){dialog.querySelectorAll('[data-alarm]').forEach(s=>s.ariaChecked=String(enabled));ui.classList.toggle('off',!enabled);$('.demo-feedback').textContent=enabled?tr('كل المنبّهات مفعّلة','All alarms enabled'):tr('كل المنبّهات متوقفة','All alarms paused');}else{const any=[...dialog.querySelectorAll('[data-alarm]:not([data-alarm="group"])')].some(x=>x.ariaChecked==='true');$('[data-alarm="group"]').ariaChecked=String(any);ui.classList.toggle('off',!any);}}));}
function closeProject(){const wasOpen=dialog.open;if(wasOpen)dialog.close();activeProject=null;document.body.style.overflow='';if(wasOpen){lastFocus?.focus({preventScroll:true});lastFocus=null;}}
function route(){const [id,section='mushaf']=location.hash.replace('#project-','').split('/');if(location.hash.startsWith('#project-')&&content[lang].projects.some(p=>p.id===id)){if(id==='wird'&&activeProject==='wird'&&dialog.open)selectWirdSection(section);else openProject(id,section);}else closeProject();}
$('#close-dialog').addEventListener('click',()=>{history.replaceState(null,'',location.pathname+location.search+'#work');closeProject();});
dialog.addEventListener('cancel',e=>{e.preventDefault();$('#close-dialog').click();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#close-dialog').click();}});
$('#language').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';try{localStorage.setItem('portfolio-language',lang);}catch{}render();if(activeProject)openProject(activeProject,wirdSection);});
window.addEventListener('hashchange',route);
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#project-"]');if(a&&location.hash===a.getAttribute('href')){e.preventDefault();route();}});
window.addEventListener('scroll',()=>{if(scrollFrame||paused||motionQuery.matches||dialog.open)return;scrollFrame=requestAnimationFrame(()=>{const device=$('.fold-device');if(device&&window.scrollY<1000){const p=Math.min(window.scrollY/800,1);device.style.transform=`translateY(${p*12}px) rotateX(${p*5}deg)`;}scrollFrame=0;});},{passive:true});
motionQuery.addEventListener('change',()=>{if(motionQuery.matches&&$('.fold-device'))$('.fold-device').style.transform='none';});
render();route();
