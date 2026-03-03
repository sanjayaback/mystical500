/**
 * MysticTools Engine v3.0 — 498 tools
 * Astrology, Numerology, Love, Lucky, Birthday, Tarot, Dream, Chinese, Wellness, Text
 */
(function () {
  'use strict';

  const TOOLS = {};
  const reg = (id, cfg) => { TOOLS[id] = cfg; };

  /* ── SHARED DATA ─────────────────────────────── */
  const Z = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const ZE = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const ZEL = ['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water'];
  const ZRULE = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Pluto','Jupiter','Saturn','Uranus','Neptune'];
  const ZTRAIT = ['Bold, courageous, enthusiastic, impulsive','Patient, reliable, sensual, stubborn','Curious, adaptable, witty, sociable','Intuitive, nurturing, loyal, moody','Creative, generous, warm-hearted, dramatic','Analytical, precise, hardworking, critical','Diplomatic, fair, social, indecisive','Passionate, intense, determined, secretive','Optimistic, honest, restless, philosophical','Disciplined, responsible, patient, traditional','Innovative, humanitarian, eccentric, independent','Compassionate, artistic, empathetic, dreamy'];
  const ZCOMPAT = {Aries:['Leo','Sagittarius','Gemini','Aquarius'],Taurus:['Virgo','Capricorn','Cancer','Pisces'],Gemini:['Libra','Aquarius','Aries','Leo'],Cancer:['Scorpio','Pisces','Taurus','Virgo'],Leo:['Aries','Sagittarius','Gemini','Libra'],Virgo:['Taurus','Capricorn','Cancer','Scorpio'],Libra:['Gemini','Aquarius','Leo','Sagittarius'],Scorpio:['Cancer','Pisces','Virgo','Capricorn'],Sagittarius:['Aries','Leo','Libra','Aquarius'],Capricorn:['Taurus','Virgo','Scorpio','Pisces'],Aquarius:['Gemini','Libra','Aries','Sagittarius'],Pisces:['Cancer','Scorpio','Taurus','Capricorn']};
  const LP = {1:'The Leader — Independent, original, ambitious. Born to pioneer.',2:'The Peacemaker — Cooperative, sensitive, diplomatic. Born to unite.',3:'The Creative — Expressive, joyful, artistic. Born to inspire.',4:'The Builder — Practical, disciplined, dependable. Born to build.',5:'The Free Spirit — Adventurous, versatile, curious. Born to explore.',6:'The Nurturer — Caring, responsible, compassionate. Born to serve.',7:'The Seeker — Analytical, spiritual, introspective. Born for truth.',8:'The Achiever — Ambitious, authoritative. Born for mastery.',9:'The Humanitarian — Compassionate, creative. Born for humanity.',11:'Master Illuminator — Highly intuitive and spiritually inspired.',22:'Master Builder — Visionary power to manifest on a grand scale.',33:'Master Teacher — Most spiritually elevated, devoted to others.'};
  const CZ = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  const CZ_EMOJI = {Rat:'🐭',Ox:'🐂',Tiger:'🐯',Rabbit:'🐰',Dragon:'🐲',Snake:'🐍',Horse:'🐴',Goat:'🐑',Monkey:'🐒',Rooster:'🐓',Dog:'🐕',Pig:'🐷'};
  const CZ_COMPAT = {Rat:['Dragon','Monkey','Ox'],Ox:['Snake','Rooster','Rat'],Tiger:['Horse','Dog','Pig'],Rabbit:['Sheep','Pig','Dog'],Dragon:['Rat','Monkey','Rooster'],Snake:['Ox','Rooster','Monkey'],Horse:['Tiger','Dog','Sheep'],Goat:['Rabbit','Pig','Horse'],Monkey:['Rat','Dragon','Snake'],Rooster:['Ox','Snake','Dragon'],Dog:['Tiger','Horse','Rabbit'],Pig:['Tiger','Rabbit','Sheep']};
  const TAROT = [{n:'The Fool',s:'0',k:'New beginnings, innocence',m:'A new journey awaits. Embrace the unknown with an open heart.'},{n:'The Magician',s:'I',k:'Manifestation, power',m:'You have all tools needed. Channel your will to create reality.'},{n:'The High Priestess',s:'II',k:'Intuition, mystery',m:'Trust your intuition. The answers lie within. Be still.'},{n:'The Empress',s:'III',k:'Abundance, fertility',m:'A time of abundance and growth. Nurture your projects.'},{n:'The Emperor',s:'IV',k:'Authority, stability',m:'Build strong foundations. Take charge with wisdom.'},{n:'The Hierophant',s:'V',k:'Tradition, wisdom',m:'Seek guidance from tradition and established knowledge.'},{n:'The Lovers',s:'VI',k:'Love, choices',m:'A meaningful relationship or important choice. Follow your heart.'},{n:'The Chariot',s:'VII',k:'Willpower, victory',m:'Victory through determination. Overcome obstacles with will.'},{n:'Strength',s:'VIII',k:'Courage, patience',m:'Your inner strength is greater than you know. Be patient.'},{n:'The Hermit',s:'IX',k:'Introspection, guidance',m:'Seek inner wisdom. The answer comes from within.'},{n:'Wheel of Fortune',s:'X',k:'Change, cycles',m:'The wheel turns in your favor. A lucky change approaches.'},{n:'Justice',s:'XI',k:'Fairness, truth',m:'A balanced outcome. Truth will prevail. Be honest.'},{n:'The Hanged Man',s:'XII',k:'Surrender, perspective',m:'Pause and gain a new perspective. Surrender may be wise.'},{n:'Death',s:'XIII',k:'Transformation, endings',m:'An ending makes way for powerful new beginnings.'},{n:'Temperance',s:'XIV',k:'Balance, moderation',m:'Find the middle path. Balance brings lasting results.'},{n:'The Devil',s:'XV',k:'Bondage, shadow',m:'Examine what holds you captive. You can free yourself.'},{n:'The Tower',s:'XVI',k:'Sudden change, truth',m:'Disruption reveals truth. What falls was built on shaky ground.'},{n:'The Star',s:'XVII',k:'Hope, renewal',m:'A beautiful time of hope and healing. Better days come.'},{n:'The Moon',s:'XVIII',k:'Illusion, subconscious',m:'Trust intuition through uncertainty. Things are not as they seem.'},{n:'The Sun',s:'XIX',k:'Joy, success',m:'A wonderful time of success and happiness. Radiate your light.'},{n:'Judgement',s:'XX',k:'Awakening, reckoning',m:'A powerful awakening. Answer your higher calling.'},{n:'The World',s:'XXI',k:'Completion, triumph',m:'Successful completion of a major cycle. Celebrate your journey.'}];
  const RUNES = [{n:'Fehu',s:'ᚠ',m:'Wealth and abundance ahead. Financial prosperity.'},{n:'Uruz',s:'ᚢ',m:'Raw strength and vitality. Primal power and determination.'},{n:'Thurisaz',s:'ᚦ',m:'Protection and force. Powerful energy — use with care.'},{n:'Ansuz',s:'ᚨ',m:'Divine message coming. Listen for wisdom and guidance.'},{n:'Raidho',s:'ᚱ',m:'A journey begins. Your path forward opens now.'},{n:'Kenaz',s:'ᚲ',m:'Inner fire and creativity. Knowledge illuminates the way.'},{n:'Gebo',s:'ᚷ',m:'A gift or partnership. Meaningful exchange arrives.'},{n:'Wunjo',s:'ᚹ',m:'Joy and harmony. Happiness and fellowship are near.'},{n:'Hagalaz',s:'ᚺ',m:'Disruption transforms. Controlled chaos leads to growth.'},{n:'Nauthiz',s:'ᚾ',m:'Patience in restriction. Need drives creative solutions.'},{n:'Isa',s:'ᛁ',m:'Stillness and pause. Reassess before acting.'},{n:'Jera',s:'ᛃ',m:'Harvest time. The fruits of your labor are ready.'},{n:'Eihwaz',s:'ᛇ',m:'Endurance and protection through transitions.'},{n:'Perth',s:'ᛈ',m:'Mystery and fate. A hidden force works in your favor.'},{n:'Algiz',s:'ᛉ',m:'Protection. You are divinely shielded right now.'},{n:'Sowilo',s:'ᛊ',m:'Sun and success. Victory and clarity are coming.'},{n:'Tiwaz',s:'ᛏ',m:'Justice and honor. Victory through sacrifice.'},{n:'Berkano',s:'ᛒ',m:'New beginnings and growth. A fresh chapter opens.'},{n:'Ehwaz',s:'ᛖ',m:'Movement and partnership. Forward progress in teamwork.'},{n:'Mannaz',s:'ᛗ',m:'Look inward. The answer is within you.'},{n:'Laguz',s:'ᛚ',m:'Trust the flow. Be fluid and intuitive.'},{n:'Ingwaz',s:'ᛜ',m:'Potential gestating before birth. Something grows within.'},{n:'Othala',s:'ᛟ',m:'Honor your roots. Inheritance and home.'},{n:'Dagaz',s:'ᛞ',m:'A major breakthrough or awakening arrives now.'}];
  const ANGEL = {'111':'New beginnings manifest. Your thoughts become reality. Think positively!','222':'Balance and harmony. Trust divine timing — all is working out.','333':'Ascended Masters surround you with love and support.','444':'Your angels are near. You are on the right path. Foundation builds.','555':'Major changes coming. Embrace transformation — it leads to freedom.','666':'Realign with love. Release fear and refocus on your higher purpose.','777':'Spiritual alignment and divine luck. You are in perfect flow.','888':'Abundance flows. Financial blessings and success are coming.','999':'A chapter ends to make way for something beautiful. Release the past.','000':'You are one with the universe. Infinite divine nature reminds you.','1111':'A powerful gateway opens. Make a wish — the universe listens.','1212':'Step out of comfort zone. New opportunities await outside your door.','1234':'Steady upward progress. Take one step at a time.'};
  const CHAKRAS = [{n:'Root',c:'#DC2626',k:'Safety, stability',a:'I am safe and grounded.'},{n:'Sacral',c:'#F97316',k:'Creativity, pleasure',a:'I am creative and passionate.'},{n:'Solar Plexus',c:'#EAB308',k:'Confidence, power',a:'I am confident and powerful.'},{n:'Heart',c:'#22C55E',k:'Love, compassion',a:'I am love and I am loved.'},{n:'Throat',c:'#3B82F6',k:'Communication, truth',a:'I speak my truth freely.'},{n:'Third Eye',c:'#6366F1',k:'Intuition, insight',a:'I see with clarity and wisdom.'},{n:'Crown',c:'#A855F7',k:'Enlightenment, unity',a:'I am connected to the divine.'}];
  const MOON = [{n:'New Moon',e:'🌑',m:'Set intentions. Plant seeds. Begin new projects.'},{n:'Waxing Crescent',e:'🌒',m:'Take first steps. Build momentum.'},{n:'First Quarter',e:'🌓',m:'Take decisive action. Commit fully.'},{n:'Waxing Gibbous',e:'🌔',m:'Refine and improve. Keep going.'},{n:'Full Moon',e:'🌕',m:'Celebrate. Release what no longer serves. High emotion and intuition.'},{n:'Waning Gibbous',e:'🌖',m:'Express gratitude. Share wisdom.'},{n:'Third Quarter',e:'🌗',m:'Let go. Clear clutter. Tie up loose ends.'},{n:'Waning Crescent',e:'🌘',m:'Rest. Recharge. Prepare for the new cycle.'}];
  const DREAMS = {water:'Emotions and flow. Clear water = clarity; murky = confusion.',fire:'Transformation, passion, purification, spiritual awakening.',flying:'Freedom, transcendence, rising above challenges.',falling:'Loss of control, anxiety, letting go.',teeth:'Communication anxieties, self-image and personal power.',snake:'Transformation, healing, wisdom, primal energy.',death:'Endings become new beginnings. Major life transformation.',house:'The self. Rooms represent different aspects of your psyche.',car:'Your direction in life. Who is driving? At what speed?',baby:'New beginnings, vulnerability, a new project being birthed.',money:'Self-worth, energy exchange, prosperity consciousness.',running:'Chasing goals or fleeing fears — which resonates for you?',school:'Life lessons and tests you are being given.',ocean:'The vast unconscious, emotional depth, spiritual mystery.',tree:'Growth, stability, connection to roots, strength through seasons.',moon:'Intuition, cycles, mystery, the subconscious mind.',sun:'Vitality, joy, success, the higher self and life force.',door:'Opportunity, choice, transition between life phases.',bird:'Freedom, spiritual messages, the soul taking flight.'};
  const FORTUNE = ['The greatest risk is not taking one.','Your kindness returns to you tenfold.','A beautiful journey begins with a single step.','Someone thinks of you and wishes you well.','The solution already exists within you.','An opportunity approaches from an unexpected direction.','Your smile is your most powerful asset.','Patience is peaceful trust, not empty waiting.','What you seek is also seeking you.','The stars align for those who align with their truth.','Abundance flows to a grateful heart.','Your intuition is a wise and trusted friend.','Today is a perfect day to begin something wonderful.','Love multiplies when freely given.','Change is the only constant — flow gracefully.'];
  const LUCKY_MSG = ['🌟 Today the stars align in your favor. Trust the process.','🍀 Fortune smiles upon you. A pleasant surprise is near.','✨ Your positive energy attracts wonderful opportunities.','🌈 After the storm comes the rainbow. Joy is on its way.','💫 The universe conspires to bring you exactly what you need.','🎯 Your focus and dedication will pay off in a big way today.','🌙 The moon supports your deepest desires right now.','⭐ A lucky encounter or message brightens your day.'];

  /* ── UTIL ─────────────────────────────────────── */
  function getZodiac(m, d) {
    const bounds = [[3,21],[4,20],[5,21],[6,21],[7,23],[8,23],[9,23],[10,23],[11,22],[12,22],[1,20],[2,19]];
    for (let i = 0; i < 12; i++) {
      if (m === bounds[i][0] && d >= bounds[i][1]) return Z[i];
      if (m === bounds[(i+1)%12][0] && d < bounds[(i+1)%12][1]) return Z[i];
    }
    return Z[11];
  }
  function reduce(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33)
      n = String(n).split('').reduce((a,d)=>a+Number(d),0);
    return n;
  }
  function lifePath(dob) {
    const d = new Date(dob); if (isNaN(d)) return null;
    return reduce(`${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`.split('').reduce((a,n)=>a+Number(n),0));
  }
  function nameNum(name) {
    const V = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
    return reduce(name.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((s,c)=>s+(V[c]||0),0));
  }
  function ageCalc(dob) {
    const d = new Date(dob), now = new Date();
    let y = now.getFullYear()-d.getFullYear(), mo = now.getMonth()-d.getMonth(), dy = now.getDate()-d.getDate();
    if (dy < 0) { mo--; dy += 30; } if (mo < 0) { y--; mo += 12; }
    return {years:y, months:mo, days:dy};
  }
  function daysBetween(d1, d2) { return Math.round(Math.abs(new Date(d1)-new Date(d2))/86400000); }
  function moonPhase(date) {
    const known = new Date('2000-01-06');
    const diff = (new Date(date)-known)/86400000;
    const phase = ((diff % 29.53) + 29.53) % 29.53;
    return MOON[Math.min(Math.floor(phase/3.69), 7)];
  }
  function luckyNums(seed, count=6) {
    const s = new Set(); let x = seed;
    while (s.size < count) { x = (x*1664525+1013904223)&0xffffffff; s.add(Math.abs(x%49)+1); }
    return [...s].sort((a,b)=>a-b);
  }
  function loveScore(a, b) {
    let h = 0; for (const c of (a+b).toLowerCase()) h = (h*31+c.charCodeAt(0))&0xffff;
    return 45 + (h % 50);
  }
  function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

  /* ── UI BUILDERS ──────────────────────────────── */
  function inp(id, lbl, type='text', ph='') {
    return `<div class="f"><label for="${id}">${lbl}</label><input type="${type}" id="${id}" placeholder="${ph}" autocomplete="off"></div>`;
  }
  function sel(id, lbl, opts) {
    return `<div class="f"><label for="${id}">${lbl}</label><select id="${id}">${opts.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></div>`;
  }
  function btn(id, txt, cls='btn-primary') { return `<button class="tool-btn ${cls}" id="${id}" type="button">${txt}</button>`; }
  function ta(id, lbl, ph='', rows=6) { return `<div class="f"><label for="${id}">${lbl}</label><textarea id="${id}" placeholder="${ph}" rows="${rows}" spellcheck="false"></textarea></div>`; }
  function out(id) { return `<div class="output-box" id="${id}" aria-live="polite"><span class="ph">Result appears here</span></div>`; }
  function big(emoji, val, lbl) { return `<div class="big-r"><div class="big-e">${emoji}</div><div class="big-v">${val}</div><div class="big-l">${lbl}</div></div>`; }
  function card(title, body, color='#2563EB') { return `<div class="r-card" style="border-left:4px solid ${color}"><div class="r-title">${title}</div><div class="r-body">${body}</div></div>`; }
  function badge(txt, c='#2563EB') { return `<span class="badge" style="background:${c}20;color:${c};border:1px solid ${c}40">${txt}</span>`; }
  function bar(pct, c='#2563EB') { return `<div class="bar-w"><div class="bar-f" style="width:${pct}%;background:${c}"></div></div>`; }
  function signCard(sign) {
    const i = Z.indexOf(sign);
    return `<div class="sign-c"><span>${ZE[i]}</span><div><strong>${sign}</strong><small>${ZEL[i]} · ${ZRULE[i]}</small></div></div>`;
  }

  /* ── TOOL IMPLEMENTATIONS ─────────────────────── */

  reg('zodiac-sign-finder',{
    render:()=>`<div class="tf">${inp('m','Month','number','1-12')}${inp('d','Day','number','1-31')}${btn('go','Find Zodiac Sign ⭐')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const m=+r.querySelector('#m').value, d=+r.querySelector('#d').value; if(!m||!d) return;
        const s=getZodiac(m,d), i=Z.indexOf(s);
        r.querySelector('#o').innerHTML=`${big(ZE[i],s,'Your Zodiac Sign')}${card('Element & Ruler',badge(ZEL[i])+' '+badge(ZRULE[i]+' rules'),'#7C3AED')}${card('Your Traits',ZTRAIT[i],'#2563EB')}${card('Best Matches',ZCOMPAT[s].join(' · '),'#059669')}`;
      };
    }
  });

  reg('birth-chart-calculator',{
    render:()=>`<div class="tf">${inp('dob','Date of Birth','date')}${inp('time','Birth Time (optional)','time')}${btn('go','Calculate Birth Chart ⭐')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const dob=r.querySelector('#dob').value; if(!dob) return;
        const d=new Date(dob), m=d.getMonth()+1, dy=d.getDate(), sun=getZodiac(m,dy);
        const moon=Z[(Z.indexOf(sun)+2)%12], rising=Z[(Z.indexOf(sun)+4)%12];
        const lp=lifePath(dob);
        r.querySelector('#o').innerHTML=`${big('⭐',sun,'Sun Sign')}${card('Your Big Three',`☀️ Sun: <strong>${sun}</strong><br>🌙 Moon: <strong>${moon}</strong><br>⬆️ Rising: <strong>${rising}</strong>`,'#7C3AED')}${card('Sun Sign Traits',ZTRAIT[Z.indexOf(sun)],'#2563EB')}${card('Life Path Number',`${lp} — ${LP[lp]?.split('—')[0]}`,'#059669')}${card('Chart Summary',`Your ${sun} sun brings ${ZTRAIT[Z.indexOf(sun)].split(',')[0]} energy. Your ${moon} moon shapes your emotional world. Your ${rising} rising is how others first see you.`,'#D97706')}`;
      };
    }
  });

  reg('zodiac-compatibility',{
    render:()=>`<div class="tf two-col"><div>${sel('s1','Sign 1',Z.map(s=>[s,ZE[Z.indexOf(s)]+' '+s]))}</div><div>${sel('s2','Sign 2',Z.map(s=>[s,ZE[Z.indexOf(s)]+' '+s]))}</div></div>${btn('go','Check Compatibility')}${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const s1=r.querySelector('#s1').value, s2=r.querySelector('#s2').value;
        const compat=ZCOMPAT[s1]||[];
        const pct=compat.includes(s2)?80+Math.floor(Math.random()*15):ZEL[Z.indexOf(s1)]===ZEL[Z.indexOf(s2)]?65+Math.floor(Math.random()*20):45+Math.floor(Math.random()*30);
        const c=pct>=75?'#059669':pct>=55?'#D97706':'#DC2626';
        r.querySelector('#o').innerHTML=`${big('⭐',pct+'%',s1+' & '+s2)}${bar(pct,c)}${signCard(s1)}${signCard(s2)}${card('Verdict',compat.includes(s2)?`🌟 ${s1} and ${s2} are among the most naturally compatible signs!`:`These signs create growth through contrast. Understanding bridges all differences.`,c)}`;
      };
    }
  });

  reg('life-path-number',{
    render:()=>`<div class="tf">${inp('dob','Date of Birth','date')}${btn('go','Calculate Life Path 🔢')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const dob=r.querySelector('#dob').value; if(!dob) return;
        const n=lifePath(dob);
        r.querySelector('#o').innerHTML=`${big('🔢',n,'Life Path Number')}${card('Your Life Path',LP[n]||'A unique individualized life path.','#2563EB')}${card('Master Number?',[11,22,33].includes(n)?'✨ Yes! You carry the rare Master Number '+n+'. Heightened spiritual responsibility and extraordinary potential.':'A standard life path — equally powerful and purposeful.','#7C3AED')}${card('Personal Year','Your current Personal Year is <strong>'+(()=>{const d=new Date(dob),now=new Date();return reduce(d.getMonth()+1+d.getDate()+String(now.getFullYear()).split('').reduce((a,n)=>a+Number(n),0));})()+'</strong>','#059669')}`;
      };
    }
  });

  reg('love-compatibility-calculator',{
    render:()=>`<div class="tf two-col"><div><h4>Person 1</h4>${inp('n1','Name','text','Your name')}${inp('d1','Birthday','date')}</div><div><h4>Person 2</h4>${inp('n2','Name','text','Their name')}${inp('d2','Birthday','date')}</div></div>${btn('go','Check Love Compatibility ❤️')}${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const n1=r.querySelector('#n1').value.trim(), n2=r.querySelector('#n2').value.trim();
        if(!n1||!n2) return;
        const pct=loveScore(n1,n2);
        const c=pct>=75?'#DB2777':pct>=55?'#D97706':'#6B7280';
        const d1=r.querySelector('#d1').value, d2=r.querySelector('#d2').value;
        const s1=d1?getZodiac(new Date(d1).getMonth()+1,new Date(d1).getDate()):null;
        const s2=d2?getZodiac(new Date(d2).getMonth()+1,new Date(d2).getDate()):null;
        r.querySelector('#o').innerHTML=`${big('❤️',pct+'%',n1+' & '+n2)}${bar(pct,c)}${card('Love Score',pct>=80?'💕 Soulmate Energy! A deeply compatible, beautiful match.':pct>=65?'💛 Great match! Love and effort make this wonderful.':pct>=50?'🤝 Good potential. Understanding bridges the gaps.':'🔥 Passionate and challenging. Growth through differences.',c)}${s1&&s2?card('Zodiac Match',badge(s1)+' + '+badge(s2)+' — '+(ZCOMPAT[s1]?.includes(s2)?'⭐ Highly compatible!':'Complementary energies.'),'#7C3AED'):''}${card('Love Quote',rand(['"The best thing to hold onto in life is each other." — Audrey Hepburn','"Love is composed of a single soul inhabiting two bodies." — Aristotle','"Where there is love, there is life." — Gandhi']),'#DB2777')}`;
      };
    }
  });

  reg('lucky-day-finder',{
    render:()=>`<div class="tf">${inp('dob','Date of Birth','date')}${btn('go','Find Lucky Days 🍀')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const dob=r.querySelector('#dob').value; if(!dob) return;
        const lp=lifePath(dob)||7;
        const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const lucky=[days[(lp-1)%7],days[lp%7]];
        r.querySelector('#o').innerHTML=`${big('🍀',lucky[0],'Luckiest Day')}${card('Your Lucky Days',lucky.map(d=>badge(d,'#059669')).join(' '),'#059669')}${card('Lucky Numbers',luckyNums(lp*137+new Date().getDate()).join(' · '),'#2563EB')}${card("Today's Fortune",rand(LUCKY_MSG),'#7C3AED')}`;
      };
    }
  });

  reg('lucky-number-generator',{
    render:()=>`<div class="tf">${inp('name','Full Name','text','Enter your name')}${inp('dob','Date of Birth','date')}${btn('go','Generate Lucky Numbers 🎯')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const name=r.querySelector('#name').value.trim();
        const dob=r.querySelector('#dob').value;
        const seed=nameNum(name||'seeker');
        const lp=dob?lifePath(dob):seed;
        const today=luckyNums(lp*7+new Date().getDate()*31);
        const personal=luckyNums(seed*13+lp*5);
        r.querySelector('#o').innerHTML=`${big('🎯',today.slice(0,3).join(' · '),'Today\'s Lucky Numbers')}${card('📅 Daily Numbers',today.map(n=>'<span class="nball">'+n+'</span>').join(''),'#2563EB')}${card('✨ Personal Numbers',personal.map(n=>'<span class="nball">'+n+'</span>').join(''),'#7C3AED')}${card('🎰 Lottery Picks',luckyNums(seed*lp+17).map(n=>'<span class="nball">'+n+'</span>').join(''),'#059669')}`;
      };
    }
  });

  reg('age-calculator',{
    render:()=>`<div class="tf">${inp('dob','Date of Birth','date')}${btn('go','Calculate My Age 🎂')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const dob=r.querySelector('#dob').value; if(!dob) return;
        const {years,months,days}=ageCalc(dob);
        const total=daysBetween(dob,new Date().toISOString().split('T')[0]);
        const d=new Date(dob), sign=getZodiac(d.getMonth()+1,d.getDate());
        const now=new Date(), next=new Date(now.getFullYear(),d.getMonth(),d.getDate());
        if(next<=now) next.setFullYear(now.getFullYear()+1);
        const untilBday=daysBetween(now.toISOString().split('T')[0],next.toISOString().split('T')[0]);
        const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        r.querySelector('#o').innerHTML=`${big('🎂',years,'Years Old')}<div class="stats-r"><div class="s-mini"><strong>${months}</strong><span>months</span></div><div class="s-mini"><strong>${days}</strong><span>days</span></div><div class="s-mini"><strong>${total.toLocaleString()}</strong><span>days lived</span></div><div class="s-mini"><strong>${(total*24).toLocaleString()}</strong><span>hours lived</span></div></div>${card('Born On',`A <strong>${DAYS[d.getDay()]}</strong> — Zodiac: <strong>${sign}</strong> ${ZE[Z.indexOf(sign)]}`,'#2563EB')}${card('🎁 Next Birthday','In <strong>'+untilBday+'</strong> days — you\'ll turn <strong>'+(years+1)+'</strong>!','#DB2777')}${card('Generation',years>=77?'Silent Generation':years>=59?'Baby Boomer':years>=44?'Generation X':years>=28?'Millennial':years>=12?'Generation Z':'Generation Alpha','#7C3AED')}`;
      };
    }
  });

  reg('tarot-card-reader',{
    render:()=>`<div class="tf">${inp('q','Your Question (optional)','text','What guidance do you seek?')}${btn('go','✨ Draw 3 Tarot Cards')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const cards=[...TAROT].sort(()=>Math.random()-0.5).slice(0,3);
        const pos=['Past','Present','Future'], cols=['#7C3AED','#2563EB','#059669'];
        r.querySelector('#o').innerHTML=`<div class="tarot-s">${cards.map((c,i)=>`<div class="t-card" style="border-top:4px solid ${cols[i]}"><div class="t-pos">${pos[i]}</div><div class="t-num">${c.s}</div><div class="t-name">${c.n}</div><div class="t-kw">${c.k}</div><div class="t-m">${c.m}</div></div>`).join('')}</div>${card('Reading','The cards flow: '+cards.map(c=>c.n).join(' → ')+'. '+cards[0].m.split('.')[0]+'.','#DB2777')}`;
      };
    }
  });

  reg('moon-phase-tracker',{
    render:()=>`<div class="tf">${inp('dt','Date','date','',)}</div>${btn('go','Check Moon Phase 🌙')}${out('o')}`,
    init(r){
      r.querySelector('#dt').value=new Date().toISOString().split('T')[0];
      const go=()=>{
        const dt=r.querySelector('#dt').value||new Date().toISOString().split('T')[0];
        const p=moonPhase(dt), i=MOON.findIndex(x=>x.n===p.n);
        r.querySelector('#o').innerHTML=`${big(p.e,p.n,'Moon Phase')}${card('Guidance',p.m,'#1E40AF')}${card('Ritual',i<4?'🌱 Waxing — ideal for starting, building, attracting.':'🍂 Waning — ideal for releasing, resting, clearing.',i<4?'#059669':'#7C3AED')}<div class="moon-cal">${MOON.map((x,j)=>`<div class="moon-dot${j===i?' active':''}">${x.e}<small>${x.n.split(' ')[0]}</small></div>`).join('')}</div>`;
      };
      r.querySelector('#go').onclick=go; go();
    }
  });

  reg('angel-number-meaning',{
    render:()=>`<div class="tf">${inp('n','Angel Number (e.g. 111, 444)','text','Enter repeating number')}${btn('go','Decode Angel Number 👼')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const n=r.querySelector('#n').value.trim();
        const msg=ANGEL[n]||ANGEL[n.slice(0,3)]||'The number '+n+' carries a personalized message. Seeing it repeatedly is a sign from your angels — trust that it is not a coincidence.';
        const root2=reduce(n.split('').reduce((a,x)=>a+Number(x),0));
        r.querySelector('#o').innerHTML=`${big('👼',n,'Angel Number')}${card('Divine Message',msg,'#7C3AED')}${card('Numerological Root','Reduces to <strong>'+root2+'</strong> — '+LP[root2]?.split('—')[0],'#2563EB')}${card('Action','Pause when you see this number. Breathe. Set a clear positive intention.','#059669')}<div class="tag-cloud">${Object.keys(ANGEL).map(k=>`<button class="tag-btn" data-v="${k}">${k}</button>`).join('')}</div>`;
        r.querySelectorAll('.tag-btn').forEach(b=>{b.onclick=()=>{r.querySelector('#n').value=b.dataset.v; r.querySelector('#go').click();};});
      };
    }
  });

  reg('chakra-calculator',{
    render:()=>`<div class="tf"><p style="color:#6B7280;font-size:.9rem">Rate each chakra 1 (blocked) to 5 (open):</p>${CHAKRAS.map((c,i)=>`<div class="cf"><label style="color:${c.c}">● ${c.n}</label><input type="range" id="ck${i}" min="1" max="5" value="3" style="accent-color:${c.c}"><span id="cv${i}">3</span></div>`).join('')}${btn('go','Read My Chakras 🕉️')}</div>${out('o')}`,
    init(r){
      CHAKRAS.forEach((_,i)=>{r.querySelector('#ck'+i).oninput=()=>{r.querySelector('#cv'+i).textContent=r.querySelector('#ck'+i).value;};});
      r.querySelector('#go').onclick=()=>{
        const vals=CHAKRAS.map((_,i)=>+r.querySelector('#ck'+i).value);
        const mb=vals.indexOf(Math.min(...vals)), mo=vals.indexOf(Math.max(...vals));
        r.querySelector('#o').innerHTML=`<div class="ck-chart">${CHAKRAS.map((c,i)=>`<div class="ck-row"><span style="color:${c.c}">${c.n}</span><div class="ck-bg"><div class="ck-f" style="width:${vals[i]*20}%;background:${c.c}"></div></div><span>${vals[i]}/5</span></div>`).join('')}</div>${card('Most Blocked',CHAKRAS[mb].n+' — Affirmation: <em>'+CHAKRAS[mb].a+'</em>','#DC2626')}${card('Most Open',CHAKRAS[mo].n+' — Your '+CHAKRAS[mo].k.split(',')[0]+' energy shines!','#059669')}`;
      };
    }
  });

  reg('dream-dictionary',{
    render:()=>`<div class="tf">${inp('s','Dream Symbol or Keyword','text','e.g. water, snake, flying')}${btn('go','Interpret Symbol 🌙')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const key=r.querySelector('#s').value.trim().toLowerCase();
        const match=Object.entries(DREAMS).find(([k])=>key.includes(k)||k.includes(key));
        if(match){
          r.querySelector('#o').innerHTML=`${big('🌙',match[0].charAt(0).toUpperCase()+match[0].slice(1),'Dream Symbol')}${card('Symbolic Meaning',match[1],'#1E40AF')}${card('Reflect','How did this symbol make you feel? What in your waking life connects to this?','#7C3AED')}`;
        } else {
          r.querySelector('#o').innerHTML=card('Common Dream Symbols','<div class="tag-cloud">'+Object.keys(DREAMS).map(k=>`<button class="tag-btn" data-k="${k}">${k}</button>`).join('')+'</div>','#D97706');
          r.querySelectorAll('.tag-btn').forEach(b=>{b.onclick=()=>{r.querySelector('#s').value=b.dataset.k;r.querySelector('#go').click();};});
        }
      };
    }
  });

  reg('fortune-cookie',{
    render:()=>`<div class="tf center"><div id="ck" class="ck-vis">🥠</div>${btn('go','Crack Open Fortune 🥠')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        r.querySelector('#ck').textContent='✨';
        r.querySelector('#o').innerHTML=`<div class="fortune-q">"${rand(FORTUNE)}"</div>${card('Lucky Numbers',luckyNums(Date.now()%9999).slice(0,4).join(' · '),'#D97706')}${card("Today's Energy",rand(LUCKY_MSG),'#7C3AED')}`;
      };
    }
  });

  reg('chinese-zodiac-finder',{
    render:()=>`<div class="tf">${inp('yr','Birth Year','number','e.g. 1990')}${btn('go','Find Chinese Zodiac 🐉')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const yr=parseInt(r.querySelector('#yr').value);
        if(!yr||yr<1900) return;
        const animal=CZ[(yr-1900)%12];
        const compat=CZ_COMPAT[animal]||[];
        r.querySelector('#o').innerHTML=`${big(CZ_EMOJI[animal]||'🐉',animal,yr+' Chinese Zodiac')}${card('Compatible With',compat.map(a=>(CZ_EMOJI[a]||'')+'  '+a).join('  '),'#059669')}${card('Cycle','Every 12 years the '+animal+' returns. Next: '+(yr+12)+' · Previous: '+(yr-12),'#DC2626')}`;
      };
    }
  });

  reg('name-love-calculator',{
    render:()=>`<div class="tf">${inp('n1','First Name','text','Your name')}${inp('n2','Second Name','text','Their name')}${btn('go','Calculate Love % ❤️')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const n1=r.querySelector('#n1').value.trim(), n2=r.querySelector('#n2').value.trim();
        if(!n1||!n2) return;
        const pct=loveScore(n1,n2);
        const c=pct>=75?'#DB2777':pct>=55?'#D97706':'#6B7280';
        const h=Math.round(pct/10);
        r.querySelector('#o').innerHTML=`${big('❤️',pct+'%',n1+' ♥ '+n2)}<div class="heart-m">${'❤️'.repeat(h)}${'🤍'.repeat(10-h)}</div>${bar(pct,c)}${card('Reading',pct>=80?'An extraordinary bond — deeply harmonious vibrations!':pct>=60?'Real potential here. Good vibrations between these names.':'Different vibrations create exciting tension and growth.',c)}`;
      };
    }
  });

  reg('birthday-countdown',{
    render:()=>`<div class="tf">${inp('dob','Your Birthday','date')}${btn('go','Start Countdown 🎂')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const val=r.querySelector('#dob').value; if(!val) return;
        const d=new Date(val), now=new Date();
        const next=new Date(now.getFullYear(),d.getMonth(),d.getDate());
        if(next<=now) next.setFullYear(now.getFullYear()+1);
        const diff=Math.ceil((next-now)/86400000);
        const sign=getZodiac(d.getMonth()+1,d.getDate());
        r.querySelector('#o').innerHTML=`${big('🎂',diff===0?'🎉':diff,'Days Until Birthday')}${diff===0?card('Happy Birthday!','🎉 Today is YOUR special day! The universe celebrates you!','#DB2777'):card('Your Birthday',next.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}),'#2563EB')}${card('Your Sign','<strong>'+sign+'</strong> '+ZE[Z.indexOf(sign)]+' — '+ZTRAIT[Z.indexOf(sign)].split(',').slice(0,3).join(', '),'#7C3AED')}`;
      };
    }
  });

  reg('word-counter',{
    render:()=>`${ta('t','Paste or type your text here','Start typing...',10)}<div class="stats-r"><div class="s-mini"><strong id="ww">0</strong><span>Words</span></div><div class="s-mini"><strong id="wc">0</strong><span>Characters</span></div><div class="s-mini"><strong id="ws">0</strong><span>Sentences</span></div><div class="s-mini"><strong id="wr">0 min</strong><span>Read Time</span></div></div>`,
    init(r){
      r.querySelector('#t').oninput=()=>{
        const t=r.querySelector('#t').value;
        r.querySelector('#ww').textContent=t.trim()?t.trim().split(/\s+/).length.toLocaleString():0;
        r.querySelector('#wc').textContent=t.length.toLocaleString();
        r.querySelector('#ws').textContent=(t.match(/[.!?]+/g)||[]).length;
        r.querySelector('#wr').textContent=Math.max(1,Math.round((t.trim().split(/\s+/).length||0)/200))+' min';
      };
    }
  });

  reg('character-counter',{
    render:()=>`${ta('t','Type or paste text','Start typing...',6)}<div class="stats-r"><div class="s-mini"><strong id="ct">0</strong><span>Total</span></div><div class="s-mini"><strong id="cn">0</strong><span>No Spaces</span></div><div class="s-mini"><strong id="cw">0</strong><span>Words</span></div><div class="s-mini"><strong id="cl">0</strong><span>Lines</span></div></div><div id="limits" class="plimits"></div>`,
    init(r){
      const L=[{n:'Twitter/X',l:280},{n:'Meta description',l:160},{n:'SMS',l:160},{n:'Instagram bio',l:150},{n:'Email subject',l:78}];
      r.querySelector('#t').oninput=()=>{
        const t=r.querySelector('#t').value, len=t.length;
        r.querySelector('#ct').textContent=len.toLocaleString();
        r.querySelector('#cn').textContent=t.replace(/\s/g,'').length.toLocaleString();
        r.querySelector('#cw').textContent=t.trim()?t.trim().split(/\s+/).length:0;
        r.querySelector('#cl').textContent=t.split('\n').length;
        r.querySelector('#limits').innerHTML=L.map(p=>{const pct=Math.min(100,Math.round(len/p.l*100)),over=len>p.l;return`<div class="lr"><span>${p.n}</span><span class="${over?'over':''}">${len}/${p.l}</span><div class="lb"><div class="lf${over?' over':''}" style="width:${pct}%"></div></div></div>`;}).join('');
      };
      r.querySelector('#t').oninput();
    }
  });

  reg('yes-no-oracle',{
    render:()=>`<div class="tf center">${inp('q','Your yes/no question','text','Ask the oracle...')}${btn('go','Consult the Oracle 🔮')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const x=Math.random();
        const A=x>0.5?{e:'✅',a:'YES',c:'#059669',m:'The universe says YES. Move forward with confidence.'}:x>0.3?{e:'❌',a:'NO',c:'#DC2626',m:'The universe says NO. Trust this — it protects you.'}:x>0.15?{e:'⚡',a:'NOT YET',c:'#D97706',m:'Patience. Divine timing asks you to wait.'}:{e:'🔮',a:'MAYBE',c:'#7C3AED',m:'Your choice shapes the answer. Free will is supreme.'};
        r.querySelector('#o').innerHTML=`${big(A.e,A.a,'Oracle Response')}${card('Message',A.m,A.c)}${card('Remember','The oracle guides — your free will is always the final word.','#6B7280')}`;
      };
    }
  });

  reg('meditation-timer',{
    render:()=>`<div class="tf center">${sel('dur','Duration',[['5','5 minutes'],['10','10 minutes'],['15','15 minutes'],['20','20 minutes'],['30','30 minutes']])}<div id="disp" class="timer-d">00:00</div><div class="btn-group">${btn('start','▶ Start')}${btn('stop','⏹ Stop','btn-outline')}</div><p id="stat" style="text-align:center;color:#6B7280">Set your intention before starting.</p></div>`,
    init(r){
      let iv=null, sec=0;
      const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
      r.querySelector('#start').onclick=()=>{
        if(iv) return;
        sec=parseInt(r.querySelector('#dur').value)*60;
        r.querySelector('#stat').textContent='🧘 Breathe deeply.';
        iv=setInterval(()=>{sec--;r.querySelector('#disp').textContent=fmt(sec);if(sec<=0){clearInterval(iv);iv=null;r.querySelector('#disp').textContent='✨ Done';r.querySelector('#stat').textContent='🌟 Well done. Rest in stillness.'}},1000);
        r.querySelector('#disp').textContent=fmt(sec);
      };
      r.querySelector('#stop').onclick=()=>{clearInterval(iv);iv=null;sec=0;r.querySelector('#disp').textContent='00:00';r.querySelector('#stat').textContent='Set your intention before starting.';};
    }
  });

  reg('coin-flip',{
    render:()=>`<div class="tf center"><div id="coin" class="coin-v">🪙</div>${btn('go','Flip the Coin 🪙')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        r.querySelector('#coin').classList.add('spin');
        setTimeout(()=>{
          r.querySelector('#coin').classList.remove('spin');
          const h=Math.random()>0.5;
          r.querySelector('#coin').textContent=h?'👑':'⭕';
          r.querySelector('#o').innerHTML=`${big(h?'👑':'⭕',h?'HEADS':'TAILS','Result')}${card('Fortune',h?'Heads — fortune favors the bold. Go for it!':'Tails — pause and reflect. Reconsider before deciding.',h?'#059669':'#7C3AED')}`;
        },800);
      };
    }
  });

  reg('bmi-calculator',{
    render:()=>`<div class="tf">${sel('unit','Units',[['metric','Metric (cm, kg)'],['imperial','Imperial (in, lbs)']])}<div id="m-metric">${inp('hcm','Height (cm)','number','175')}${inp('wkg','Weight (kg)','number','70')}</div><div id="m-imp" style="display:none">${inp('hft','Height (ft)','number','5')}${inp('hin','Inches','number','9')}${inp('wlb','Weight (lbs)','number','154')}</div>${btn('go','Calculate BMI ⚖️')}</div>${out('o')}`,
    init(r){
      r.querySelector('#unit').onchange=function(){r.querySelector('#m-metric').style.display=this.value==='metric'?'':'none';r.querySelector('#m-imp').style.display=this.value==='imperial'?'':'none';};
      r.querySelector('#go').onclick=()=>{
        let bmi;
        if(r.querySelector('#unit').value==='metric'){const h=parseFloat(r.querySelector('#hcm').value)/100,w=parseFloat(r.querySelector('#wkg').value);bmi=w/(h*h);}
        else{const i=parseFloat(r.querySelector('#hft').value)*12+parseFloat(r.querySelector('#hin').value),w=parseFloat(r.querySelector('#wlb').value);bmi=(w/(i*i))*703;}
        if(!bmi||isNaN(bmi)) return;
        const b=bmi.toFixed(1), cat=bmi<18.5?['Underweight','#3B82F6']:bmi<25?['Normal weight','#059669']:bmi<30?['Overweight','#D97706']:['Obese','#DC2626'];
        r.querySelector('#o').innerHTML=`${big('⚖️',b,'BMI Score')}${card('Category',badge(cat[0],cat[1])+' — BMI of '+b+' is '+cat[0],cat[1])}${card('Scale','<18.5 Underweight · 18.5–24.9 Normal · 25–29.9 Overweight · ≥30 Obese','#6B7280')}`;
      };
    }
  });

  reg('name-number-calculator',{
    render:()=>`<div class="tf">${inp('n','Full Name','text','Enter full name')}${btn('go','Calculate Name Number 📛')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const name=r.querySelector('#n').value.trim(); if(!name) return;
        const num=nameNum(name);
        const V2={A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7};
        const chald=reduce(name.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((s,c)=>s+(V2[c]||0),0));
        r.querySelector('#o').innerHTML=`${big('📛',num,'Name Number: "'+name+'"')}${card('Pythagorean (Western)','Destiny Number: <strong>'+num+'</strong> — '+LP[num]?.split('—')[1]?.trim(),'#2563EB')}${card('Chaldean (Ancient)','Ancient Babylonian number: <strong>'+chald+'</strong>','#7C3AED')}`;
      };
    }
  });

  reg('daily-horoscope',{
    render:()=>`<div class="tf">${sel('sign','Your Zodiac Sign',Z.map(s=>[s,ZE[Z.indexOf(s)]+' '+s]))}${btn('go','Read Today\'s Horoscope ⭐')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const sign=r.querySelector('#sign').value, i=Z.indexOf(sign);
        const seed=i*7+new Date().getDate();
        const LOVE=['Venus blesses your bonds today.','Open your heart to new connections.','Existing relationships deepen beautifully.','A meaningful message may arrive.'];
        const WORK=['Your productivity peaks — focus on priorities.','A creative breakthrough unlocks possibilities.','Collaboration brings success today.','Trust your instincts in professional matters.'];
        const HEALTH=['Ground yourself with movement and fresh air.','Rest and hydration are your best allies.','Your energy is high — channel it wisely.','Mindfulness brings you back to center.'];
        r.querySelector('#o').innerHTML=`${big(ZE[i],sign,"Today's Horoscope")}${card('💕 Love',LOVE[seed%4],'#DB2777')}${card('💼 Career',WORK[seed%4],'#2563EB')}${card('🌿 Health',HEALTH[seed%4],'#059669')}${card('⭐ Lucky Today','Number: <strong>'+(seed%9+1)+'</strong> · Color: '+['Red','Blue','Green','Purple','Gold','Silver','Orange','White','Indigo'][seed%9],'#D97706')}`;
      };
    }
  });

  reg('spirit-animal-finder',{
    render:()=>`<div class="tf"><p style="color:#6B7280;font-size:.9rem">Answer instinctively:</p>${sel('q1','Facing challenges, you:',[[0,'Charge forward boldly'],[1,'Observe before acting'],[2,'Trust your feelings'],[3,'Adapt and find another way']])}${sel('q2','Your natural home:',[[0,'Open sky or mountains'],[1,'Deep forest'],[2,'The ocean'],[3,'Open plains or desert']])}${sel('q3','Your greatest strength:',[[0,'Courage'],[1,'Wisdom'],[2,'Love and empathy'],[3,'Wit and intelligence']])}${btn('go','Reveal Spirit Animal 🔮')}</div>${out('o')}`,
    init(r){
      const ANIMALS=[
        {e:'🦁',n:'Lion',m:'Courageous and proud, you lead by example. Claim your power with a generous heart.'},
        {e:'🦉',n:'Owl',m:'Ancient wisdom and intuition guide you. You see through illusions and seek deeper truth.'},
        {e:'🐬',n:'Dolphin',m:'Joyful, playful and deeply intelligent. You thrive in connection and intuitive knowing.'},
        {e:'🐺',n:'Wolf',m:'A natural leader who values deep loyalty. Trust your instincts — they guide you wisely.'},
        {e:'🦅',n:'Eagle',m:'You see the bigger picture others miss. Soar high and pursue your highest vision.'},
        {e:'🐻',n:'Bear',m:'Strength, wisdom and healing power. Stand your ground and trust your inner knowing.'},
        {e:'🦊',n:'Fox',m:'Quick-witted and adaptable. You navigate any situation cleverly.'},
        {e:'🦋',n:'Butterfly',m:'Transformation is your gift. You embrace change and emerge more beautiful each time.'},
        {e:'🐉',n:'Dragon',m:'Magical power and fierce independence. You are a natural creator of worlds.'},
        {e:'🐦‍⬛',n:'Raven',m:'Mystical messenger between worlds. Magic and mystery follow you.'},
      ];
      r.querySelector('#go').onclick=()=>{
        const q=+r.querySelector('#q1').value+(+r.querySelector('#q2').value)*4+(+r.querySelector('#q3').value)*16;
        const a=ANIMALS[q%ANIMALS.length];
        r.querySelector('#o').innerHTML=`${big(a.e,a.n,'Your Spirit Animal')}${card('Message',a.m,'#7C3AED')}${card('Working With Your Animal','Call upon the '+a.n+' when you need strength. Meditate on its qualities. Let its energy inspire your life.','#2563EB')}`;
      };
    }
  });

  reg('rune-reading',{
    render:()=>`<div class="tf center">${inp('q','Your Question','text','What do you seek guidance on?')}${btn('go','Cast the Runes ᚠ')}</div>${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const runes=[...RUNES].sort(()=>Math.random()-0.5).slice(0,3);
        const pos=['Situation','Challenge','Outcome'];
        r.querySelector('#o').innerHTML=`<div class="rune-s">${runes.map((rn,i)=>`<div class="rune-c"><div class="rune-sym">${rn.s}</div><div class="rune-pos">${pos[i]}</div><div class="rune-n">${rn.n}</div><div class="rune-m">${rn.m}</div></div>`).join('')}</div>${card('Synthesis','The runes speak of '+runes.map(rn=>rn.m.split('.')[0].toLowerCase()).join('; then ')+'.','#7C3AED')}`;
      };
    }
  });

  reg('numerology-compatibility',{
    render:()=>`<div class="tf two-col"><div><h4>Person 1</h4>${inp('d1','Date of Birth','date')}</div><div><h4>Person 2</h4>${inp('d2','Date of Birth','date')}</div></div>${btn('go','Check Numerology Match 🔢')}${out('o')}`,
    init(r){
      r.querySelector('#go').onclick=()=>{
        const d1=r.querySelector('#d1').value, d2=r.querySelector('#d2').value;
        if(!d1||!d2) return;
        const lp1=lifePath(d1), lp2=lifePath(d2), diff=Math.abs(lp1-lp2);
        const pct=diff===0?95:diff<=2?82:diff<=4?68:52;
        const c=pct>=80?'#059669':pct>=65?'#D97706':'#6B7280';
        r.querySelector('#o').innerHTML=`${big('🔢',pct+'%','Numerological Match')}${bar(pct,c)}${card('Person 1 — Life Path '+lp1,LP[lp1]?.split('—')[0],'#2563EB')}${card('Person 2 — Life Path '+lp2,LP[lp2]?.split('—')[0],'#7C3AED')}${card('Verdict',diff===0?'Same Life Path — a mirror soul connection!':diff<=2?'Harmonious numbers. Natural understanding flows.':'Different rhythms that teach each other beautifully.',c)}`;
      };
    }
  });

  /* ── GENERIC SMART FALLBACK for all other 450+ tool IDs ── */
  const CAT_CFG = {
    astrology:{c:'#6D28D9',e:'⭐',f:[{id:'dob',l:'Date of Birth',t:'date'}]},
    numerology:{c:'#2563EB',e:'🔢',f:[{id:'name',l:'Full Name',t:'text'},{id:'dob',l:'Date of Birth',t:'date'}]},
    love:{c:'#DB2777',e:'💕',f:[{id:'n1',l:'Name 1',t:'text'},{id:'n2',l:'Name 2',t:'text'}]},
    lucky:{c:'#059669',e:'🍀',f:[{id:'dob',l:'Date of Birth',t:'date'}]},
    birthday:{c:'#D97706',e:'🎂',f:[{id:'dob',l:'Date of Birth',t:'date'}]},
    tarot:{c:'#7C3AED',e:'🃏',f:[]},
    dream:{c:'#1E40AF',e:'🌙',f:[{id:'q',l:'Your Question or Topic',t:'text'}]},
    chinese:{c:'#DC2626',e:'🐉',f:[{id:'yr',l:'Birth Year',t:'number'}]},
    wellness:{c:'#0D9488',e:'🧘',f:[{id:'dob',l:'Date of Birth',t:'date'}]},
    text:{c:'#374151',e:'✍️',f:[{id:'text',l:'Enter Text',t:'textarea'}]},
  };

  function makeGeneric(category) {
    const cfg=CAT_CFG[category]||CAT_CFG.lucky;
    return {
      render() {
        const fields=cfg.f.map(f=>f.t==='textarea'?ta(`gt-${f.id}`,f.l,'',5):inp(`gt-${f.id}`,f.l,f.t,'')).join('');
        return `<div class="tf">${fields}${btn('gt-go','Calculate '+cfg.e)}</div>${out('gt-o')}`;
      },
      init(root) {
        root.querySelector('#gt-go')?.addEventListener('click',()=>{
          const dob=root.querySelector('#gt-dob')?.value;
          const name=root.querySelector('#gt-name')?.value||root.querySelector('#gt-n1')?.value||'seeker';
          const name2=root.querySelector('#gt-n2')?.value||'';
          const yr=root.querySelector('#gt-yr')?.value;
          const query=root.querySelector('#gt-q')?.value||root.querySelector('#gt-text')?.value||'';
          let html='';

          if(category==='love'&&name2){
            const pct=loveScore(name,name2);
            const c=pct>=75?'#DB2777':pct>=55?'#D97706':'#6B7280';
            html=`${big('❤️',pct+'%',name+' & '+name2)}${bar(pct,c)}${card('Love Reading',rand(['"The best thing to hold onto in life is each other." — Audrey Hepburn','"Where there is love, there is life." — Gandhi']),'#DB2777')}`;
          } else if(dob){
            const d=new Date(dob), sign=getZodiac(d.getMonth()+1,d.getDate()), lp=lifePath(dob)||7;
            if(category==='birthday'){
              const {years}=ageCalc(dob);
              html=`${big(cfg.e,years,'Years Old')}${card('Zodiac Sign',sign+' '+ZE[Z.indexOf(sign)],'#7C3AED')}${card("Today's Fortune",rand(LUCKY_MSG),cfg.c)}`;
            } else if(category==='chinese'){
              const animal=CZ[(parseInt(yr||new Date(dob).getFullYear())-1900)%12];
              html=`${big(CZ_EMOJI[animal]||'🐉',animal,'Chinese Zodiac')}${card('Compatible With',(CZ_COMPAT[animal]||[]).map(a=>CZ_EMOJI[a]+'  '+a).join('  '),cfg.c)}`;
            } else {
              html=`${big(cfg.e,sign,'Your Reading')}${card('Your Zodiac',ZTRAIT[Z.indexOf(sign)],cfg.c)}${card('Life Path Number','Life Path: <strong>'+lp+'</strong> — '+LP[lp]?.split('—')[0],'#2563EB')}${card('Lucky Numbers',luckyNums(lp*7+d.getDate()).slice(0,4).join(' · '),'#059669')}${card("Today's Message",rand(LUCKY_MSG),'#7C3AED')}`;
            }
          } else if(yr){
            const animal=CZ[(parseInt(yr)-1900)%12];
            html=`${big(CZ_EMOJI[animal]||'🐉',animal,yr+' Chinese Zodiac')}${card('Compatible',( CZ_COMPAT[animal]||[]).join(', '),cfg.c)}`;
          } else if(query){
            const match=Object.entries(DREAMS).find(([k])=>query.toLowerCase().includes(k));
            if(match) html=`${big(cfg.e,match[0],'Symbol')}${card('Meaning',match[1],cfg.c)}`;
            else html=`${big(cfg.e,rand(TAROT).n,'Your Reading')}${card('Guidance',rand(TAROT).m,cfg.c)}${card('Message',rand(LUCKY_MSG),'#7C3AED')}`;
          } else {
            const card1=rand(TAROT);
            html=`${big(cfg.e,card1.n,'Your Reading')}${card('Message',card1.m,cfg.c)}${card('Fortune',rand(FORTUNE),'#D97706')}`;
          }
          root.querySelector('#gt-o').innerHTML=html||card('Enter your details above','Fill in the fields and click Calculate.','#6B7280');
        });
      }
    };
  }

  /* ── ENGINE INIT ─────────────────────────────── */
  const Engine = {
    init() {
      const body = document.body;
      const toolId = body.dataset.toolId;
      const category = body.dataset.category || 'lucky';
      if (!toolId) return;
      const tool = TOOLS[toolId] || makeGeneric(category);
      const target = document.getElementById('tool-render-target');
      if (!target) return;
      target.innerHTML = tool.render ? tool.render() : '';
      if (tool.init) tool.init(target);
    }
  };

  /* ── MOBILE MENU ─────────────────────────────── */
  function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle||!nav) return;
    toggle.onclick = () => {
      const open = toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open');
    };
  }

  /* ── FAQ ACCORDION ───────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.onclick = () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.faq-answer').hidden = true;
          i.querySelector('.faq-question').setAttribute('aria-expanded','false');
        });
        if (!isOpen) {
          item.classList.add('open');
          item.querySelector('.faq-answer').hidden = false;
          btn.setAttribute('aria-expanded','true');
        }
      };
    });
  }

  /* ── FOOTER YEAR ─────────────────────────────── */
  function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', () => {
    Engine.init();
    initMenu();
    initFAQ();
    initFooterYear();
  });

  window.__MysticEngine = { Engine, TOOLS, reg };
})();
