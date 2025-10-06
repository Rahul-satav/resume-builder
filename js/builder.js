
function $(id){ return document.getElementById(id); }
const fields = ['name','title','email','phone','location','linkedin','github','summary','experience','projects','skills','education','certs'];
const inputs = {}; fields.forEach(f => inputs[f] = $(f));
const preview = $('preview');
const select = $('templateSelect');
const saveBtn = $('saveBtn');
const dlBtn = $('downloadBtn');

function state(){
  const s = {}; fields.forEach(f => s[f] = inputs[f].value || '');
  s.template = select.value; return s;
}

function renderClassic(s){
  return `
  <div class="h">${s.name} — ${s.title}</div>
  <div class="sec"><strong>Contact:</strong> ${s.email} • ${s.phone} • ${s.location} • ${s.linkedin} • ${s.github}</div>
  <div class="sec"><strong>Summary</strong><div>${s.summary}</div></div>
  <div class="sec"><strong>Experience</strong><ul>${(s.experience||'').split(/\n+/).map(x=>`<li>${x.replace(/^[-•]\s*/,'')}</li>`).join('')}</ul></div>
  <div class="sec"><strong>Projects</strong><ul>${(s.projects||'').split(/\n+/).map(x=>`<li>${x.replace(/^[-•]\s*/,'')}</li>`).join('')}</ul></div>
  <div class="sec"><strong>Skills</strong><div>${s.skills}</div></div>
  <div class="sec"><strong>Education</strong><div>${s.education}</div></div>
  <div class="sec"><strong>Certifications</strong><div>${s.certs}</div></div>`;
}

function renderModern(s){
  return `
  <div style="display:grid;grid-template-columns:220px 1fr;gap:16px;">
    <aside style="background:#f3f4f6;padding:12px;border-radius:8px">
      <div class="h">${s.name}</div>
      <div>${s.title}</div>
      <hr>
      <div><strong>Contact</strong><div>${s.email}<br>${s.phone}<br>${s.location}<br>${s.linkedin}<br>${s.github}</div></div>
      <hr>
      <div><strong>Skills</strong><div>${s.skills}</div></div>
      <hr>
      <div><strong>Education</strong><div>${s.education}</div></div>
      <div><strong>Certs</strong><div>${s.certs}</div></div>
    </aside>
    <section>
      <div class="sec"><strong>Summary</strong><div>${s.summary}</div></div>
      <div class="sec"><strong>Experience</strong><ul>${(s.experience||'').split(/\n+/).map(x=>`<li>${x.replace(/^[-•]\s*/,'')}</li>`).join('')}</ul></div>
      <div class="sec"><strong>Projects</strong><ul>${(s.projects||'').split(/\n+/).map(x=>`<li>${x.replace(/^[-•]\s*/,'')}</li>`).join('')}</ul></div>
    </section>
  </div>`;
}

function render(){
  const s = state();
  preview.innerHTML = s.template==='classic' ? renderClassic(s) : renderModern(s);
}
fields.forEach(f => inputs[f].addEventListener('input', render));
select.addEventListener('change', render);

// Autofill from ATS text (very simple parse)
(function autoFill(){
  if(location.hash.includes('autofill')){
    const txt = localStorage.getItem('rb_last_resume_text')||'';
    if(txt){
      if(!inputs.summary.value) inputs.summary.value = (txt.split(/summary[:\n]/i)[1]||'').split(/\n\n/)[0]||'';
      if(!inputs.skills.value) inputs.skills.value = (txt.match(/skills?:?\s*([\s\S]{0,200})/i)||[])[1]||'';
      render();
    }
  }
})();

// Save to localStorage (works without login)
saveBtn.onclick = () => { localStorage.setItem('rb_resume_state', JSON.stringify(state())); alert('Saved locally!'); };

// Load if exists
const saved = localStorage.getItem('rb_resume_state'); if(saved){
  const s = JSON.parse(saved); fields.forEach(f => inputs[f].value = s[f]||''); if(s.template) select.value = s.template; render();
}else{ render(); }

// Download PDF
dlBtn.onclick = async () => {
  const el = preview;
  const canvas = await html2canvas(el, {scale:2, backgroundColor:'#fff'});
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:'pt', format:'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(img);
  const ratio = imgProps.width/imgProps.height;
  const pdfWidth = pageWidth, pdfHeight = pdfWidth/ratio;
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save('Resume.pdf');
};
