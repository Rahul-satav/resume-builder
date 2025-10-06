// ---------- Helpers ----------
function tok(s=''){ return (s.toLowerCase().match(/[a-z0-9+#.]{3,}/g)||[]) }
const ACTION_VERBS = ['built','developed','designed','led','owned','delivered','launched','created','optimized','improved','migrated','reduced','increased','automated','implemented'];
const MUST_CORE = ['java','spring','spring boot','microservices','rest','api','aws','angular','react','dotnet','c#','sql','docker','kubernetes','git','ci','cd'];

// ---------- Scoring ----------
function scoreATS(resumeText, jdText){
  const t=(resumeText||'').toLowerCase();
  const jd=(jdText||'').toLowerCase();

  // Contact & links (20)
  let contact=0;
  if(/\b@gmail|@yahoo|@outlook|@hotmail/.test(t)) contact+=6;
  if(/\b\+?\d[\d\s\-()]{8,}\b/.test(t)) contact+=6;
  if(/linkedin\.com\//.test(t)) contact+=4;
  if(/github\.com\//.test(t)) contact+=4;
  const contactScore=Math.min(20,contact);

  // Section coverage (20)
  const sections=['summary','experience','education','skills','projects'];
  const sectionHits=sections.reduce((a,s)=>a+(t.includes(s)?1:0),0);
  const sectionScore=Math.round((sectionHits/sections.length)*20);

  // Keywords (15 = must + 15 = JD overlap → cap 30, we’ll scale to 30 then clamp to 30)
  const tokens=new Set(tok(t));
  const mustHits=MUST_CORE.filter(m=>tokens.has(m.replace(' ',''))||t.includes(m)).length;
  const mustScore=(MUST_CORE.length?(mustHits/MUST_CORE.length)*15:10);
  let overlap=0; tok(jd).forEach(w=>{ if(tokens.has(w)) overlap++; });
  const overlapScore=Math.min(15,(overlap/50)*15);
  const keywordScore = Math.round(mustScore + overlapScore); // 0..30

  // Readability (15)
  const words=(t.match(/\w+/g)||[]).length;
  let len=0;
  if(words>=300 && words<=900) len=12;
  else if(words>900 && words<=1400) len=9;
  else if(words>=200 && words<300) len=8;
  else len=5;
  const bullets=(t.match(/\n\s*[-•]/g)||[]).length;
  const bulletBonus=Math.min(3, bullets>=6?3: bullets>=3?2:1);
  const readabilityScore=len+bulletBonus; // 0..15

  // Impact (15)
  const verbs=ACTION_VERBS.filter(v=>t.includes(v)).length;
  const nums=(t.match(/\b\d+(%|k|m)?\b/g)||[]).length;
  const impactScore=Math.min(15, verbs*2 + Math.min(7, Math.floor(nums/2)));

  // Total (cap 100)
  const total=Math.min(100, Math.round(contactScore+sectionScore+keywordScore+readabilityScore+impactScore));

  // Suggestions
  const suggestions=[];
  if(contactScore<16) suggestions.push('Add email, phone, LinkedIn, GitHub to header.');
  if(sectionScore<16) suggestions.push('Ensure sections: Summary, Experience, Education, Skills, Projects.');
  if(keywordScore<22) suggestions.push('Mirror important keywords from the JD and your core stack.');
  if(readabilityScore<12) suggestions.push('Keep it 1–2 pages with 6–10 concise bullet points.');
  if(impactScore<12) suggestions.push('Use action verbs and quantify (%, time, cost).');

  // Missing keywords from JD
  const jdTokens=new Set(tok(jd));
  const missing=[...jdTokens].filter(w => !tokens.has(w) && w.length>2)
    .filter(w => !/^(and|the|for|with|you|our|are|job|role|will|responsibilities|requirements)$/i.test(w))
    .slice(0,40);

  return { total, breakdown:{contactScore,sectionScore,keywordScore,readabilityScore,impactScore}, suggestions, missing };
}

// ---------- DOM ----------
const resumeFile=document.getElementById('resumeFile');
const resumeText=document.getElementById('resumeText');
const jdText=document.getElementById('jdText');
const scoreBtn=document.getElementById('scoreBtn');
const useBtn=document.getElementById('useTemplateBtn');
const panel=document.getElementById('scorePanel');
const totalEl=document.getElementById('totalScore');
const breakdownEl=document.getElementById('breakdown');
const suggestionsEl=document.getElementById('suggestions');
const kwBox=document.getElementById('kwBox');
const kwWrap=document.getElementById('missingKw');
const addAllBtn=document.getElementById('addAllKw');

// DOCX/TXT loader
if(resumeFile){
  resumeFile.addEventListener('change', async (e)=>{
    const file=e.target.files[0]; if(!file) return;
    if(file.name.endsWith('.txt')){
      resumeText.value=await file.text();
    } else if(file.name.endsWith('.docx')){
      const buf=await file.arrayBuffer();
      const out=await window.mammoth.extractRawText({arrayBuffer:buf});
      resumeText.value=out.value||'';
    } else {
      alert('Upload DOCX/TXT, or paste resume text.');
    }
  });
}

// Score button
if(scoreBtn){
  scoreBtn.onclick=()=>{
    const res=scoreATS(resumeText.value, jdText.value);

    totalEl.textContent=res.total;
    breakdownEl.innerHTML='';
    const labels={contactScore:'Contact & Links',sectionScore:'Sections',keywordScore:'Keywords',readabilityScore:'Readability',impactScore:'Impact'};
    for(const [k,v] of Object.entries(res.breakdown)){
      const li=document.createElement('li'); li.textContent=`${labels[k]}: ${v}`; breakdownEl.appendChild(li);
    }
    suggestionsEl.innerHTML='';
    res.suggestions.forEach(s=>{ const li=document.createElement('li'); li.textContent=s; suggestionsEl.appendChild(li); });

    // Missing KW pills
    kwWrap.innerHTML='';
    if(res.missing.length){
      res.missing.forEach(w=>{
        const pill=document.createElement('button');
        pill.className='btn subtle';
        pill.textContent=w;
        pill.onclick=()=>navigator.clipboard.writeText(w);
        kwWrap.appendChild(pill);
      });
      kwBox.style.display='block';
    }else{
      kwBox.style.display='none';
    }

    panel.style.display='block';
    useBtn.disabled=false;
    localStorage.setItem('rb_last_resume_text', resumeText.value);
  };
}

// Add all keywords → copy
if(addAllBtn){
  addAllBtn.onclick=()=>{
    const words=[...kwWrap.querySelectorAll('button')].map(b=>b.textContent).join(', ');
    if(words){ navigator.clipboard.writeText(words); addAllBtn.textContent='Copied!'; setTimeout(()=>addAllBtn.textContent='Add all to Skills (copy)',1200); }
  };
}

// Use template → go to builder with auto-fill flag
if(useBtn){ useBtn.onclick=()=>{ location.href='builder.html#autofill'; } }
