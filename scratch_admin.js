const fs = require('fs');
const content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Velocity Studio — Admin</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
:root{--bg:#0D0C09;--bg2:#121109;--sand:#DEC8B5;--brass:#C49C7B;--dim:#565250;--muted:#252320;--border:rgba(222,200,181,.07);--bord2:rgba(222,200,181,.13);--ease:cubic-bezier(0.16,1,0.3,1)}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--sand);-webkit-font-smoothing:antialiased;height:100vh;overflow:hidden}
a{color:inherit;text-decoration:none}button,input,select,textarea{font-family:inherit}button{background:none;border:none;cursor:pointer}
:focus-visible{outline:1px solid var(--brass);outline-offset:3px}

/* Grain */
.grain{position:fixed;inset:-50%;width:200%;height:200%;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.87' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:.04;pointer-events:none;z-index:9000;animation:gr .5s steps(2) infinite}
@keyframes gr{0%{transform:translate(0,0)}25%{transform:translate(-2%,-2%)}50%{transform:translate(2%,1%)}75%{transform:translate(-1%,3%)}}

/* Nav */
.nav{height:60px;padding:0 1.75rem;display:flex;align-items:center;justify-content:space-between;background:rgba(13,12,9,.95);border-bottom:1px solid var(--border);z-index:100;position:relative}
.nav-brand{font-family:'Instrument Serif',Georgia,serif;font-size:1.1rem}
.nav-brand em{font-style:normal;color:var(--brass)}
.nav-tag{font-family:Inter,sans-serif;font-size:.55rem;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-left:.75rem}
.nav-right{display:flex;align-items:center;gap:1.25rem}

/* Layout */
.app-layout { display:flex; height:calc(100vh - 60px); }
.sidebar { width:340px; flex-shrink:0; border-right:1px solid var(--border); overflow-y:auto; background:rgba(13,12,9,.4); display:flex; flex-direction:column; }
.sidebar-header { padding:1.25rem; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:.75rem; }
.sidebar-list { flex:1; overflow-y:auto; }
.main-view { flex:1; overflow-y:auto; background:var(--bg); }
.main-content { max-width:900px; padding:3rem; margin:0 auto; display:none; }
.main-content.active { display:block; }
.empty-state { display:flex; align-items:center; justify-content:center; height:100%; color:var(--dim); font-size:.8rem; letter-spacing:.04em; }

/* Buttons */
.btn{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;padding:.4rem 1rem;transition:all .3s;border:1px solid;cursor:pointer}
.btn-primary{background:var(--sand);color:var(--bg);border-color:var(--sand)}
.btn-primary:hover{background:var(--brass);border-color:var(--brass)}
.btn-secondary{background:transparent;color:var(--brass);border-color:var(--bord2)}
.btn-secondary:hover{border-color:var(--brass);color:var(--sand)}
.btn-ghost{background:transparent;color:var(--dim);border-color:transparent}
.btn-ghost:hover{color:var(--sand)}
.btn-red{background:rgba(192,128,128,.1);color:#c08080;border-color:rgba(192,128,128,.2)}
.btn-red:hover{background:rgba(192,128,128,.2);color:var(--sand)}

/* Sidebar Items */
.lead-item { padding:1.25rem; border-bottom:1px solid var(--border); cursor:pointer; transition:background .2s; border-left:2px solid transparent; }
.lead-item:hover { background:rgba(255,255,255,.02); }
.lead-item.active { background:var(--bg2); border-left-color:var(--brass); }
.lead-name { font-family:'Instrument Serif',Georgia,serif; font-size:1.2rem; letter-spacing:-.02em; color:var(--sand); margin-bottom:.2rem; }
.lead-meta { display:flex; justify-content:space-between; align-items:center; font-size:.65rem; color:var(--dim); }
.badge{display:inline-flex;align-items:center;font-size:.52rem;letter-spacing:.14em;text-transform:uppercase;padding:.2rem .5rem;border:1px solid;white-space:nowrap}
.bp{color:var(--dim);border-color:var(--bord2)}
.ba{color:#8fc98f;border-color:rgba(143,201,143,.3)}
.bi{color:var(--brass);border-color:var(--bord2)}
.bd{color:#c08080;border-color:rgba(192,128,128,.3)}

/* Detail View */
.detail-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2.5rem; padding-bottom:2rem; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:1.5rem; }
.dh-title { font-family:'Instrument Serif',Georgia,serif; font-size:2.5rem; letter-spacing:-.03em; margin-bottom:.5rem; }
.dh-meta { font-size:.75rem; color:var(--dim); display:flex; gap:1rem; align-items:center; }
.dh-actions { display:flex; gap:.75rem; }

.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:3rem; margin-bottom:3rem; }
@media(max-width:900px){.grid-2{grid-template-columns:1fr;gap:2rem}}
.sec-title { font-size:.55rem; letter-spacing:.16em; text-transform:uppercase; color:var(--brass); margin-bottom:1.25rem; border-bottom:1px solid var(--bord2); padding-bottom:.5rem; }
.d-row { margin-bottom:.85rem; font-size:.75rem; display:flex; flex-direction:column; gap:.25rem; }
.d-key { color:var(--dim); font-size:.65rem; text-transform:uppercase; letter-spacing:.08em; }
.d-val { color:var(--sand); line-height:1.6; }
.d-box { background:var(--bg2); border:1px solid var(--bord2); padding:1rem; font-size:.75rem; line-height:1.7; color:var(--sand); white-space:pre-wrap; margin-bottom:1rem; }

/* Control Panel */
.control-panel { background:var(--bg2); border:1px solid var(--border); padding:2rem; display:flex; flex-direction:column; gap:2rem; margin-bottom:3rem; }
.cp-row { display:flex; gap:1.5rem; align-items:flex-end; flex-wrap:wrap; }
.cp-group { display:flex; flex-direction:column; gap:.5rem; flex:1; min-width:200px; }
.cp-label { font-size:.55rem; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
.cp-input { background:transparent; border:none; border-bottom:1px solid var(--bord2); color:var(--sand); font-size:.85rem; padding:.5rem 0; outline:none; transition:border-color .3s; width:100%; }
.cp-input:focus { border-color:var(--brass); }
.cp-select { background:var(--bg); border:1px solid var(--bord2); color:var(--sand); font-size:.75rem; padding:.5rem; outline:none; cursor:pointer; width:100%; }
.cp-textarea { background:var(--bg); border:1px solid var(--bord2); color:var(--sand); font-size:.75rem; padding:.75rem; outline:none; min-height:120px; resize:vertical; line-height:1.6; width:100%; font-family:monospace; }

/* Auth */
.auth-gate{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
.auth-box{width:100%;max-width:380px}
.auth-title{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:2.4rem;letter-spacing:-.04em;color:var(--sand);margin-bottom:.4rem}

/* Utils */
.toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(--bg2);border:1px solid var(--bord2);padding:.8rem 1.25rem;font-size:.75rem;letter-spacing:.04em;z-index:9999;opacity:0;transform:translateY(8px);transition:opacity .3s,transform .3s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}
</style>
</head>
<body>
<div class="grain"></div>

<div class="auth-gate" id="authGate">
  <div class="auth-box">
    <h1 class="auth-title">Velocity.</h1>
    <p style="font-size:.72rem;color:var(--dim);margin-bottom:2.5rem;letter-spacing:.04em">Admin command center.</p>
    <label style="display:block;font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem">Access Key</label>
    <input type="password" id="secretInput" placeholder="Enter admin key" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--bord2);color:var(--sand);font-size:.9rem;padding:.55rem 0;outline:none;">
    <button class="btn btn-primary" id="authBtn" style="margin-top:1.5rem;width:100%">Enter Command Center</button>
  </div>
</div>

<div id="app" style="display:none;height:100vh;flex-direction:column;">
  <nav class="nav">
    <span class="nav-brand">Velocity<em>.</em><span class="nav-tag">Admin</span></span>
    <div class="nav-right">
      <button class="btn btn-primary" id="btnNew">+ New Client</button>
      <button class="btn btn-ghost" id="btnLogout">Sign Out</button>
    </div>
  </nav>
  
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <select id="filterSelect" class="cp-select" style="background:var(--bg2);border:none;padding:.25rem">
          <option value="">All Active Clients</option>
          <option value="onboarding_sent">Awaiting Brief</option>
          <option value="pending">Onboard Completed</option>
          <option value="scope_sent">Scope Sent</option>
          <option value="accepted">Project Accepted</option>
          <option value="paid">Payment Confirmed</option>
          <option value="in_progress">Design & Build</option>
          <option value="completed">Delivered</option>
        </select>
      </div>
      <div class="sidebar-list" id="leadList">
        <div class="empty-state">Loading...</div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="main-view" id="mainView">
      <div class="empty-state" id="emptyState">Select a client from the sidebar to view details.</div>
      <div class="main-content" id="detailContent">
        <!-- Injected via JS -->
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<!-- Create Modal (Simplified) -->
<div id="createModal" style="position:fixed;inset:0;background:rgba(13,12,9,.9);display:none;align-items:center;justify-content:center;z-index:500;">
  <div style="background:var(--bg2);border:1px solid var(--bord2);padding:2.5rem;width:100%;max-width:400px;position:relative">
    <h2 style="font-family:\'Instrument Serif\',serif;font-size:2rem;margin-bottom:1.5rem;font-weight:400">New Client</h2>
    <div style="margin-bottom:1.5rem">
      <label style="display:block;font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem">Client Email</label>
      <input type="email" id="mEmail" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--bord2);color:var(--sand);padding:.5rem 0;outline:none" placeholder="client@company.com">
    </div>
    <div style="display:flex;gap:1rem">
      <button class="btn btn-primary" id="mSubmit">Generate Onboard Link</button>
      <button class="btn btn-ghost" onclick="document.getElementById(\'createModal\').style.display=\'none\'">Cancel</button>
    </div>
    <div id="mResult" style="margin-top:1.5rem;display:none;padding:1rem;background:rgba(196,156,123,.05);border:1px solid var(--bord2)">
      <div style="font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:.5rem">Link Generated</div>
      <div id="mUrl" style="color:var(--brass);font-size:.75rem;word-break:break-all;margin-bottom:1rem"></div>
      <button class="btn btn-secondary" id="mCopy">Copy to Clipboard</button>
    </div>
  </div>
</div>

<script>
const SL = {
  onboarding_sent: 'Onboard Sent',
  pending: 'Onboard Completed',
  scope_sent: 'Scope Sent',
  accepted: 'Project Accepted',
  paid: 'Payment Confirmed',
  in_progress: 'Design & Build',
  completed: 'Delivered',
  declined: 'Declined'
};

const SB = {
  onboarding_sent: 'bp',
  pending: 'bp',
  scope_sent: 'bp',
  accepted: 'ba',
  paid: 'ba',
  in_progress: 'bi',
  completed: 'ba',
  declined: 'bd'
};

let SEC='', LEADS=[], ACTIVE_ID=null;

document.getElementById('secretInput').addEventListener('keydown', e => { if(e.key==='Enter') document.getElementById('authBtn').click(); });

document.getElementById('authBtn').onclick=async()=>{
  const s=document.getElementById('secretInput').value.trim();if(!s)return;
  const r=await fetch('/api/leads/list',{headers:{'X-Admin-Secret':s}});
  if(!r.ok){alert('Invalid Key');return;}
  SEC=s; sessionStorage.setItem('v_admin',s);
  document.getElementById('authGate').style.display='none';
  document.getElementById('app').style.display='flex';
  LEADS=await r.json();
  renderSidebar();
};

if(sessionStorage.getItem('v_admin')){
  document.getElementById('secretInput').value=sessionStorage.getItem('v_admin');
  document.getElementById('authBtn').click();
}

document.getElementById('btnLogout').onclick=()=>{sessionStorage.removeItem('v_admin');location.reload();};
document.getElementById('btnNew').onclick=()=>{
  document.getElementById('mEmail').value='';
  document.getElementById('mResult').style.display='none';
  document.getElementById('createModal').style.display='flex';
};

document.getElementById('mSubmit').onclick=async()=>{
  const email=document.getElementById('mEmail').value.trim();
  const btn=document.getElementById('mSubmit');btn.disabled=true;btn.textContent='Generating...';
  const r=await fetch('/api/leads/create',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Secret':SEC},body:JSON.stringify({client_email:email})});
  const d=await r.json();btn.disabled=false;btn.textContent='Generate Onboard Link';
  if(d.onboard_url){
    document.getElementById('mUrl').textContent=d.onboard_url;
    document.getElementById('mResult').style.display='block';
    document.getElementById('mCopy').onclick=()=>{navigator.clipboard.writeText(d.onboard_url);toast('Copied!');};
    reload();
  }
};

document.getElementById('filterSelect').onchange = renderSidebar;

async function reload(){
  const r=await fetch('/api/leads/list',{headers:{'X-Admin-Secret':SEC}});
  if(r.ok) { LEADS=await r.json(); renderSidebar(); if(ACTIVE_ID) renderDetail(LEADS.find(l=>l.id===ACTIVE_ID)); }
}

function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500);}
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function dr(k,v){return v?\`<div class="d-row"><span class="d-key">\${k}</span><span class="d-val">\${esc(String(v))}</span></div>\`:'';}

async function aupd(token, patch){
  const r=await fetch('/api/leads/admin-update',{method:'PATCH',headers:{'Content-Type':'application/json','X-Admin-Secret':SEC},body:JSON.stringify({token,...patch})});
  return r.ok;
}

function renderSidebar() {
  const filter = document.getElementById('filterSelect').value;
  let fl = LEADS.filter(l => l.status !== 'archived' && l.status !== 'outreach' && l.status !== 'responded');
  if(filter) fl = fl.filter(l => l.status === filter);
  
  // Sort: newest first
  fl.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  
  const list = document.getElementById('leadList');
  if(!fl.length){ list.innerHTML='<div class="empty-state">No clients found.</div>'; return; }
  
  list.innerHTML = fl.map(l => {
    const name = l.client_name || (l.full_data&&l.full_data.phase1&&l.full_data.phase1.full_name) || l.client_email || 'Unnamed';
    const st = SL[l.status] || l.status;
    return \`<div class="lead-item \${l.id===ACTIVE_ID?'active':''}" onclick="selectLead('\${l.id}')">
      <div class="lead-name">\${esc(name)}</div>
      <div class="lead-meta">
        <span style="color:var(--brass)">\${st}</span>
        <span>\${new Date(l.created_at).toLocaleDateString()}</span>
      </div>
    </div>\`;
  }).join('');
}

window.selectLead = function(id) {
  ACTIVE_ID = id;
  renderSidebar(); // update active state
  const lead = LEADS.find(l => l.id === id);
  if(lead) renderDetail(lead);
}

function renderDetail(l) {
  document.getElementById('emptyState').style.display = 'none';
  const mc = document.getElementById('detailContent');
  mc.style.display = 'block';
  
  const p1=(l.full_data&&l.full_data.phase1)||{};
  const p2=(l.full_data&&l.full_data.phase2)||{};
  const p3=(l.full_data&&l.full_data.phase3)||{};
  const p4=(l.full_data&&l.full_data.phase4)||{};
  const p5=(l.full_data&&l.full_data.phase5)||{};
  
  const name = l.client_name || p1.full_name || l.client_email || 'Unnamed Client';
  const base = location.origin;
  
  let html = \`<div class="detail-header">
    <div>
      <h2 class="dh-title">\${esc(name)}</h2>
      <div class="dh-meta">
        <span>\${esc(l.client_email)}</span>
        <span class="badge \${SB[l.status]}">\${SL[l.status]||l.status}</span>
        \${l.is_paid?'<span class="badge ba">Paid</span>':''}
      </div>
    </div>
    <div class="dh-actions">
      <button class="btn btn-secondary" id="btnDash">Copy Dashboard Link</button>
      <button class="btn btn-ghost" id="btnPreview" style="border:1px solid var(--border)">View Full Brief</button>
    </div>
  </div>

  <!-- Operational Control Panel -->
  <div class="control-panel">
    <div class="sec-title" style="border:none;margin:0">Pipeline Controls</div>
    
    <div class="cp-row">
      <div class="cp-group">
        <span class="cp-label">Project Status</span>
        <select id="ctrlStatus" class="cp-select">
          <option value="onboarding_sent" \${l.status==='onboarding_sent'?'selected':''}>Onboard Sent</option>
          <option value="pending" \${l.status==='pending'?'selected':''}>Onboard Completed</option>
          <option value="scope_sent" \${l.status==='scope_sent'?'selected':''}>Scope Sent</option>
          <option value="accepted" \${l.status==='accepted'?'selected':''}>Project Accepted</option>
          <option value="paid" \${l.status==='paid'?'selected':''}>Payment Confirmed</option>
          <option value="in_progress" \${l.status==='in_progress'?'selected':''}>Design & Build</option>
          <option value="completed" \${l.status==='completed'?'selected':''}>Delivered</option>
          <option value="declined" \${l.status==='declined'?'selected':''}>Declined</option>
        </select>
      </div>
      <div class="cp-group">
        <span class="cp-label">Quote Amount (USD)</span>
        <input type="number" id="ctrlQuote" class="cp-input" value="\${l.quote_amount?(l.quote_amount/100).toFixed(2):''}" placeholder="e.g. 5000">
      </div>
      <div class="cp-group">
        <span class="cp-label">Kickoff Date</span>
        <input type="date" id="ctrlKick" class="cp-input" value="\${l.kickoff_date?l.kickoff_date.split('T')[0]:''}">
      </div>
      <div class="cp-group">
        <span class="cp-label">Delivery Target</span>
        <input type="date" id="ctrlDeliv" class="cp-input" value="\${l.delivery_target_date?l.delivery_target_date.split('T')[0]:''}">
      </div>
      <button class="btn btn-primary" id="btnSaveState" style="align-self:flex-end">Save State</button>
    </div>

    <div style="border-top:1px solid var(--border);padding-top:2rem;margin-top:1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span class="cp-label" style="margin:0">Scope of Work Document</span>
        <button class="btn btn-secondary" id="btnAutoScope" style="padding:.3rem .8rem;font-size:.55rem">Auto-Generate from Brief</button>
      </div>
      <textarea id="ctrlScope" class="cp-textarea" placeholder="Detailed scope required before payment...">\${esc(l.scope_text||'')}</textarea>
      <div style="display:flex;justify-content:flex-end;margin-top:1rem">
        <button class="btn btn-primary" id="btnSendScope">\${l.scope_sent_at?'Resend Scope':'Send Scope'}</button>
      </div>
    </div>
  </div>

  <!-- Brief Data -->
  \${l.submitted_at ? \`
  <div class="grid-2">
    <div>
      <div class="sec-title">Business & Logistics</div>
      \${dr('Company Stage', l.company_stage ? l.company_stage.replace('_',' ') : '—')}
      \${dr('Business Context', p1.context)}
      \${dr('Target Audience', p2.target_customer)}
      \${dr('Competitors', l.competitor_benchmarks)}
      \${dr('Copy Readiness', l.copy_readiness ? l.copy_readiness.replace('_',' ') : '—')}
      \${dr('Mottos/Taglines', p4.mottos)}
      \${dr('Addl Notes', p5.additional_notes)}
    </div>
    <div>
      <div class="sec-title">Visual DNA & Aesthetic</div>
      \${dr('Typography Scale', l.visual_typography_scale ? l.visual_typography_scale + '/5' : '—')}
      \${dr('Layout Density', l.visual_layout_density ? l.visual_layout_density + '/5' : '—')}
      \${dr('Chroma Balance', l.visual_chromatographic ? l.visual_chromatographic + '/5' : '—')}
      \${dr('Background Color', p3.color_background)}
      \${dr('Primary Accent', p3.color_accent)}
      \${dr('Typography Prefs', p3.fonts)}
      \${dr('Upgrade Perm.', l.upgrade_permission?'Granted':'Denied')}
    </div>
  </div>\` : '<div class="empty-state" style="justify-content:flex-start">Brief has not been submitted yet.</div>'}
  
  <div style="margin-top:4rem;border-top:1px solid rgba(192,128,128,.2);padding-top:2rem;text-align:right">
    <button class="btn btn-red" id="btnDelete">Delete Client Record</button>
  </div>
  \`;

  mc.innerHTML = html;
  
  // Attach Handlers
  document.getElementById('btnDash').onclick=()=>{navigator.clipboard.writeText(base+'/dashboard/'+l.token);toast('Dashboard link copied!');};
  document.getElementById('btnPreview').onclick=async()=>{
    const r=await fetch('/api/coffee/admin/temp-token',{method:'POST',headers:{'Content-Type':'application/json','X-Admin-Secret':SEC}});
    const d=await r.json();
    if(d.token) window.open('/coffee/admin/client/'+l.token+'?t='+encodeURIComponent(d.token),'_blank');
  };
  
  document.getElementById('btnSaveState').onclick=async()=>{
    const btn=document.getElementById('btnSaveState');btn.textContent='Saving...';btn.disabled=true;
    const stat=document.getElementById('ctrlStatus').value;
    const q=document.getElementById('ctrlQuote').value;
    const k=document.getElementById('ctrlKick').value;
    const d=document.getElementById('ctrlDeliv').value;
    
    let patch = { status: stat };
    if(q) patch.quote_amount = Math.round(parseFloat(q)*100);
    patch.kickoff_date = k ? k+'T00:00:00Z' : null;
    patch.delivery_target_date = d ? d+'T00:00:00Z' : null;
    
    if(await aupd(l.token, patch)){ toast('State saved successfully.'); reload(); }
    else { toast('Error saving state.'); btn.textContent='Save State'; btn.disabled=false; }
  };
  
  document.getElementById('btnAutoScope').onclick=()=>{
    const pages = p2.site_pages || 'Homepage, About, Services, Contact (Standard configuration)';
    const amount = document.getElementById('ctrlQuote').value ? '$' + parseFloat(document.getElementById('ctrlQuote').value).toFixed(2) : '[AMOUNT PENDING]';
    const kd = document.getElementById('ctrlKick').value || 'TBD';
    const dd = document.getElementById('ctrlDeliv').value || 'TBD';
    const draft = \`**VELOCITY DELIVERABLES & SCOPE OF WORK**

**CLIENT:** \${l.client_name || p1.full_name || 'TBD'}
**PROJECT INVESTMENT:** \${amount}

**1. ARCHITECTURE & PAGES**
The following pages will be designed and built:
\${pages}

**2. CREATIVE DIRECTION**
Velocity will execute a world-class, custom "Quiet Luxury" digital aesthetic. 
- Company Stage: \${l.company_stage ? l.company_stage.replace('_', ' ') : 'Not specified'}
- Competitor Alignment: \${l.competitor_benchmarks || 'Standard industry benchmarks'}
- All custom development, interactions, and kinetic typography.

**3. TIMELINE & TERMS**
- Kickoff target: \${kd}
- Delivery target: \${dd}
- Includes 1 round of holistic revisions post-delivery.
- Site delivered via Webflow, Framer, or raw code (agency discretion based on performance needs).

*By executing this agreement via the conversion portal, the client accepts these deliverables as the exhaustive scope of work.*\`;
    document.getElementById('ctrlScope').value = draft;
    toast('Scope drafted. Review before sending.');
  };
  
  document.getElementById('btnSendScope').onclick=async()=>{
    const txt = document.getElementById('ctrlScope').value.trim();
    if(!txt){ toast('Scope cannot be empty.'); return; }
    const btn = document.getElementById('btnSendScope'); btn.disabled=true; btn.textContent='Sending...';
    if(await aupd(l.token, {scope_text: txt, scope_sent_at: new Date().toISOString()})){
      toast('Scope sent successfully.'); reload();
    } else { toast('Error sending scope.'); btn.textContent='Send Scope'; btn.disabled=false; }
  };
  
  document.getElementById('btnDelete').onclick=async()=>{
    if(confirm('Are you absolutely sure you want to permanently delete this client record?')){
      await fetch('/api/leads/delete',{method:'DELETE',headers:{'Content-Type':'application/json','X-Admin-Secret':SEC},body:JSON.stringify({token:l.token})});
      toast('Client deleted.'); ACTIVE_ID=null; reload();
      document.getElementById('emptyState').style.display='flex';
      mc.style.display='none';
    }
  };
}
</script>
</body>
</html>`;
fs.writeFileSync('/Users/bengur/CascadeProjects/velocity/website/coffee/admin/index.html', content);
console.log('Done');
