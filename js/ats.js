
function tokenize(str=''){ return (str.toLowerCase().match(/[a-z0-9+#.]{3,}/g)||[]) }
const verbs = ['built','developed','designed','led','owned','delivered','launched','created','optimized','improved','migrated','reduced','increased','automated','implemented']

function scoreATS(resumeText, jdText){
  const t = (resumeText||'').toLowerCase();
  const jd = (jdText||'').toLowerCase();

  // 1) Contact + Parse (20)
  let contact = 0;
  if(/\b@gmail|\b@yahoo|\boutlook|\bhotmail/.test(t)) contact += 6;
  if(/\b\+?\d[\d\s\-()]{8,}\b/.test(t)) contact += 6;
  if(/linkedin\.com\//.test(t)) contact += 4;
  if(/github\.com\//.test(t)) contact += 4;
  const contactScore = Math.min(20, contact);

  // 2) Sections (20)
  const sections = ['summary','experience','education','skills','projects'];
  const sectionHits = sections.reduce((a,s)=>a+(t.includes(s)?1:0),0);
  const sectionScore = Math.round((sectionHits/sections.length)*20);

  // 3) Keywords vs JD (30)
  const must = ['java','spring','spring boot','microservices','rest','aws','angular','react','dotnet','c#','sql','docker','kubernetes','git','ci','cd'];
  const tokens = new Set(tokenize(t));
  const mustHits = must.filter(m => tokens.has(m.replace(' ','') ) || t.includes(m)).length;
  const mustScore = must.length ? (mustHits/must.length)*15 : 10;

  let overlap=0; tokenize(jd).forEach(w => { if(tokens.has(w)) overlap++; });
  const overlapScore = Math.min(15, (overlap/50)*15);
  const keywordScore = Math.round(mustScore + overlapScore);

  // 4) Readability (15)
  const words = (t.match(/\w+/g)||[]).length;
  let lengthScore = 0;
  if(words>=300 && words<=900) lengthScore = 12;
  else if(words>900 && words<=1400) lengthScore = 9;
  else if(words>=200 && words<300) lengthScore = 8;
  else lengthScore = 5;
  const bullets = (t.match(/\n\s*[-•]/g)||[]).length;
  const bulletBonus = Math.min(3, bullets>=6?3:bullets>=3?2:1);
  const readabilityScore = lengthScore + bulletBonus;

  // 5) Impact (15)
  const v = verbs.filter(x=>t.includes(x)).length;
  const nums = (t.match(/\b\d+(%|k|m)?\b/g)||[]).length;
  const impactScore = Math.min(15, v*2 + Math.min(7, Math.floor(nums/2)));

  const total = Math.min(100, Math.round(contactScore + sectionScore + keywordScore + readabilityScore + impactScore));
  const suggestions = [];
  if(contactScore<16) suggestions.push('Add email, phone, LinkedIn, GitHub to header.');
  if(sectionScore<16) suggestions.push('Ensure sections: Summary, Experience, Education, Skills, Projects.');
  if(keywordScore<22) suggestions.push('Mirror important keywords from the Job Description and tech stack.');
  if(readabilityScore<12) suggestions.push('Keep it 1–2 pages with 6–10 clear bullet points.');
  if(impactScore<12) suggestions.push('Start bullets with action verbs and quantify results (%, time, cost).');

  return { total, breakdown:{contactScore, sectionScore, keywordScore, readabilityScore, impactScore}, suggestions, must };
}

// File handling
const resumeFile = document.getElementById('resumeFile');
const resumeText = document.getElementById('resumeText');
const jdText = document.getElementById('jdText');
const scoreBtn = document.getElementById('scoreBtn');
const useBtn = document.getElementById('useTemplateBtn');
const panel = document.getElementById('scorePanel');
const totalEl = document.getElementById('totalScore');
const breakdownEl = document.getElementById('breakdown');
const suggestionsEl = document.getElementById('suggestions');

if (resumeFile){
  resumeFile.addEventListener('change', async (e)=>{
    const file = e.target.files[0]; if(!file) return;
    if(file.name.endsWith('.txt')){
      const txt = await file.text(); resumeText.value = txt;
    } else if(file.name.endsWith('.docx')){
      const arrayBuffer = await file.arrayBuffer();
      const res = await window.mammoth.extractRawText({arrayBuffer});
      resumeText.value = res.value || '';
    } else if(file.name.endsWith('.pdf')){
      // Simple PDF text read using PDF.js via text layer (lightweight via Mammoth not available). For now, ask user to paste text.
      alert('Quick tip: For best results, paste resume text directly or upload DOCX. PDF text extraction varies.');
    }
  });
}

if (scoreBtn){
  scoreBtn.onclick = () => {
    const res = scoreATS(resumeText.value, jdText.value);
    totalEl.textContent = res.total;
    breakdownEl.innerHTML = '';
    for (const [k,v] of Object.entries(res.breakdown)){
      const li = document.createElement('li'); li.textContent = `${k}: ${v}/20 or /30/15`;
      breakdownEl.appendChild(li);
    }
    suggestionsEl.innerHTML = '';
    res.suggestions.forEach(s => { const li = document.createElement('li'); li.textContent = s; suggestionsEl.appendChild(li); });
    panel.style.display = 'block';
    useBtn.disabled = false;
    // Save parsed text to localStorage for Builder auto-fill
    localStorage.setItem('rb_last_resume_text', resumeText.value);
  };
}

if (useBtn){
  useBtn.onclick = () => { window.location.href = 'builder.html#autofill' }
}
