/* BiDex-100 homepage interactions & rendering (Bench2Dex-style).
   Data lives in data.js. Results/per-subtask numbers come from
   leaderboard_eval_report.json (106 tasks x 7 models x IN/OUT). */
(function(){
  "use strict";
  const B = window.BENCH;
  const $ = (s,p=document)=>p.querySelector(s);
  const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
  const el = (tag,cls,html)=>{const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e;};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AX = B.AXES.reduce((o,a)=>{o[a.key]=a; return o;},{});
  const axisColor = k => (AX[k]&&AX[k].color) || "var(--metal)";
  const axisShort = k => ({Generalization:"GEN",Instruction_Following:"IF",Limited_Demonstrations:"LD",Long_Horizon:"LH",Memory:"MEM"}[k]||k);
  const fmt1 = n => Number(n).toFixed(1);
  const MODELS = B.MODELS;            // ordered strongest -> weakest
  const MID = {}; MODELS.forEach(m=>MID[m.id]=m);

  /* ---------- Proof strip ---------- */
  (function(){
    const g=$("#proof-grid"); if(!g) return;
    const select = cell=>$$(".proof-cell",g).forEach(item=>{const a=item===cell; item.classList.toggle("selected",a); item.setAttribute("aria-pressed",a?"true":"false");});
    B.PROOF_STATS.forEach(s=>{
      const c=el("div","proof-cell"); c.tabIndex=0; c.setAttribute("role","button");
      c.setAttribute("aria-label",`${s.n} ${s.label}. ${s.tip}`);
      c.innerHTML=`<div class="n">${s.n}</div><div class="l">${s.label}</div><div class="q">${s.sub}</div><div class="proof-tip">${s.tip}</div>`;
      c.addEventListener("click",()=>select(c));
      c.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); select(c);} });
      g.appendChild(c);
    });
  })();

  /* ---------- Nav ---------- */
  (function(){
    const nav=$("#nav"), burger=$("#burger"), drawer=$("#drawer"), progress=$("#nav-progress"), drawerClose=$("#drawer-close");
    const onScroll=()=>{ nav.classList.toggle("solid", window.scrollY>20);
      const h=document.documentElement.scrollHeight-window.innerHeight;
      progress.style.width=(h>0?Math.min(100,window.scrollY/h*100):0)+"%"; spy(); };
    const setDrawer=open=>{ drawer.classList.toggle("open",open); burger.setAttribute("aria-expanded",open?"true":"false"); };
    burger.addEventListener("click",()=>setDrawer(!drawer.classList.contains("open")));
    if(drawerClose) drawerClose.addEventListener("click",()=>setDrawer(false));
    $$(".drawer a").forEach(a=>a.addEventListener("click",()=>setDrawer(false)));
    document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&drawer.classList.contains("open")) setDrawer(false); });
    const links=$$("#nav-links a"); const sections=links.map(a=>$(a.getAttribute("href"))).filter(Boolean);
    function spy(){ const y=window.scrollY+96; let cur=sections[0]?.id; for(const s of sections){ if(s&&s.offsetTop<=y) cur=s.id; }
      links.forEach(a=>{const on=a.getAttribute("href")==="#"+cur; a.classList.toggle("active",on); if(on)a.setAttribute("aria-current","true"); else a.removeAttribute("aria-current");}); }
    window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
  })();

  /* ---------- Comparison matrix: row select ---------- */
  (function(){
    const rows=$$(".bm-table tbody tr"); if(!rows.length) return;
    const select=row=>rows.forEach(item=>{const a=item===row; item.classList.toggle("selected",a); item.setAttribute("aria-selected",a?"true":"false");});
    rows.forEach(row=>{ row.tabIndex=0; row.setAttribute("aria-selected","false");
      row.addEventListener("click",()=>select(row));
      row.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); select(row);} }); });
  })();

  /* ---------- Capability axis cards ---------- */
  (function(){
    const g=$("#cap-grid"); if(!g) return;
    B.AXES.forEach(a=>{
      const c=el("div","cap-card"); c.style.setProperty("--c",a.color);
      c.innerHTML=`<div class="n">${axisShort(a.key)} · ${a.count} tasks</div><h3 style="color:${a.color}">${a.label}</h3><p class="desc">${a.desc}</p>`;
      g.appendChild(c);
    });
    // summary card
    const s=el("div","cap-card summary");
    s.innerHTML=`<div class="n">106 · 5 axes · graded · ID/OOD</div><h3>106 task specifications</h3>
      <p class="desc">Across the 106 specifications, tasks carry 1–10 subtasks (mean 3.6) and compose 472 predicate instances. Each ships with a baked <code>__ood</code> variant with identical seed and initial state, so every policy sees identical out-of-domain conditions. Graded predicate scoring rewards partial progress while preserving a strict success criterion (score = 100).</p>`;
    g.appendChild(s);
  })();

  /* ---------- Model spec table + baselines leaderboard (#lb-table) ---------- */
  (function(){
    const spec=$("#spec-table"); if(spec){
      let h=`<thead><tr><th>Model</th><th>VLM backbone</th><th>Action expert</th><th>Chunk</th><th>Train</th></tr></thead><tbody>`;
      MODELS.forEach(m=>{ h+=`<tr><td><span class="swatch" style="--c:${m.color}"><i style="background:${m.color}"></i>${m.name}</span></td><td>${m.backbone}</td><td>${m.expert}</td><td>${m.chunk}</td><td>${m.train}</td></tr>`; });
      spec.innerHTML=h+"</tbody>";
    }
    const lb=$("#lb-table"); if(lb){
      let h=`<thead><tr><th class="rk">#</th><th class="pn">Model</th><th>Gen</th><th>IF</th><th>LD</th><th>LH</th><th>Mem</th><th class="avg">Overall</th></tr></thead><tbody>`;
      MODELS.forEach((m,i)=>{
        const cells=["Generalization","Instruction_Following","Limited_Demonstrations","Long_Horizon","Memory"].map(ax=>{
          const a=B.AXIS_AGG[ax][m.id]; return `<td>${fmt1(a.id_score)}</td>`;
        });
        h+=`<tr class="${i===0?'lead':''}"><td class="rk">${i+1}</td><td class="pn"><span class="swatch" style="--c:${m.color}"><i style="background:${m.color}"></i>${m.name}</span></td>${cells.join("")}<td class="avg">${fmt1(m.all_score)}</td></tr>`;
      });
      lb.innerHTML=h+"</tbody>";
    }
    // Aggregate leaderboard: per capability axis × {ID/OOD × prog / strict-success},
    // plus an Overall group (All·prog / All·sr), with the best value in each
    // column bolded.
    const agg=$("#agg-table"); if(agg){
      const axisSub=["ID·prog","ID·sr","OOD·prog","OOD·sr"];
      const ovSub=["All·prog","All·sr"];
      const MMAP={}; MODELS.forEach(m=>MMAP[m.id]=m);
      const groups=[];
      B.AXES.forEach(a=>{ groups.push({label:a.label,color:a.color,sub:axisSub,
        vals:(mid)=>{const d=B.AXIS_AGG[a.key][mid]||{}; return [d.id_score,d.id_succ,d.ood_score,d.ood_succ];},
        progIdx:[0,2]}); });
      groups.push({label:"Overall",color:"var(--accent)",sub:ovSub,
        vals:(mid)=>{const m=MMAP[mid]||{}; return [m.all_score,m.all_succ];},
        progIdx:[0]});
      // per-column maxima across models
      const nCols=groups.reduce((n,g)=>n+g.sub.length,0);
      const colMax=new Array(nCols).fill(-Infinity);
      MODELS.forEach(m=>{ let c=0; groups.forEach(g=>{ g.vals(m.id).forEach(v=>{ if(typeof v==="number"&&!isNaN(v)&&v>colMax[c]) colMax[c]=v; c++; }); }); });
      // header
      let head=`<thead><tr><th class="rk" rowspan="2">#</th><th class="pn" rowspan="2">Model</th>`;
      groups.forEach(g=>{ head+=`<th class="agg-ax" colspan="${g.sub.length}" style="background:${g.color};color:#fff">${g.label}</th>`; });
      head+=`</tr><tr>`;
      groups.forEach(g=>{ g.sub.forEach(s=>{ head+=`<th class="agg-sub" style="color:${g.color}">${s}</th>`; }); });
      head+=`</tr></thead>`;
      // body
      let body="<tbody>";
      MODELS.forEach((m,i)=>{
        body+=`<tr><td class="rk">${i+1}</td><td class="pn"><span class="swatch" style="--c:${m.color}"><i style="background:${m.color}"></i>${m.name}</span></td>`;
        let c=0;
        groups.forEach((g,gi)=>{
          g.vals(m.id).forEach((v,j)=>{
            const isProg=g.progIdx.includes(j);
            const isBest=(typeof v==="number"&&!isNaN(v)&&Math.abs(v-colMax[c])<1e-9);
            const cls=["agg-cell", isProg?"agg-prog":"", isBest?"agg-best":""].filter(Boolean).join(" ");
            const style=(j===0)?` style="border-left:3px solid ${g.color}"`:"";
            const txt=(v==null||isNaN(v))?"—":fmt1(v);
            body+=`<td class="${cls}"${style}>${txt}</td>`;
            c++;
          });
        });
        body+="</tr>";
      });
      body+="</tbody>";
      agg.innerHTML=head+body;
    }
  })();

  /* ---------- Embodiments + camera triad ---------- */
  (function(){
    const g=$("#emb-grid"); if(g){
      B.EMBODIMENTS.forEach(e=>{
        const c=el("div","emb-card");
        c.innerHTML=`<h3>${e.name}</h3>
          <div class="specs"><div><span class="k">Arm</span>${e.arm}</div>
            <div><span class="k">Hand</span>${e.hand}</div>
            <div><span class="k">Action</span>${e.dof}</div>
            <div><span class="k">Scope</span>${e.scope}</div></div>`;
        g.appendChild(c);
      });
    }
    const cam=$("#cam-triad"); if(cam){
      // three synchronized camera views captured during one demo episode
      [["head_color","Head camera · 480×360 @25 Hz"],["left_wrist_color","Left wrist · RGB-D"],["right_wrist_color","Right wrist · RGB-D"]].forEach(([st,lab])=>{
        const f=el("figure"); f.innerHTML=`<img src="${B.ASSET_IMG}/frames/mv_${st}_poster.png" alt="${lab}" loading="lazy"><figcaption>${lab}</figcaption>`; cam.appendChild(f);
      });
    }
  })();

  /* ---------- Multi-view modality player ---------- */
  (function(){
    const fmt=t=>{ if(!isFinite(t)||t<0) t=0; const m=Math.floor(t/60),s=Math.floor(t%60); return m+":"+String(s).padStart(2,"0"); };
    const sp=document.querySelector("[data-modalplayer]"); if(!sp) return;
    const grid=sp.querySelector(".modal-grid"), playBtn=sp.querySelector(".mp-play"), seek=sp.querySelector(".mp-seek"), timeEl=sp.querySelector(".mp-frame");
    let videos=[], leader=null, playing=false, raf=null, seeking=false;
    const maxDur=()=>Math.max(0,...videos.map(v=>v.duration||0));
    const updateTime=()=>{ const d=maxDur(); const t=leader?leader.currentTime:0;
      if(timeEl) timeEl.textContent=fmt(t)+" / "+fmt(d); if(seek&&!seeking&&d>0) seek.value=Math.round(t/d*1000); };
    const syncAll=()=>{ if(!leader) return; const t=leader.currentTime; videos.forEach(v=>{ if(v!==leader&&Math.abs((v.currentTime||0)-t)>0.1){ try{v.currentTime=t;}catch(e){} } }); };
    const playAll=async()=>{ try{ await Promise.all(videos.map(v=>{const p=v.play(); return p&&p.catch?p.catch(()=>{}):p;})); }catch(e){} };
    function setPlaying(p){ playing=p; if(playBtn){ playBtn.textContent=p?"⏸":"▶"; } if(p){ playAll(); raf=requestAnimationFrame(loop);} else { videos.forEach(v=>v.pause()); if(raf) cancelAnimationFrame(raf);} }
    function loop(){ if(!playing||!leader) return; syncAll(); updateTime(); if(leader.ended){ setPlaying(false); if(seek) seek.value=0; videos.forEach(v=>{try{v.currentTime=0;}catch(e){}}); updateTime();} else raf=requestAnimationFrame(loop); }
    const inline=document.getElementById("modal-manifest");
    const data = inline ? JSON.parse(inline.textContent.trim()) : {video_dir:"static/videos/modal", modalities:[]};
    const vdir=data.video_dir||"static/videos/modal";
    const labels={}; B.MODALITIES.forEach(m=>labels[m.key]=m.name);
    grid.innerHTML=B.MODALITIES.map(m=>`<figure class="mtile"><video src="${vdir}/${m.key}.mp4" poster="${B.ASSET_IMG}/frames/mv_${m.key}_poster.png" muted playsinline preload="metadata" aria-label="${m.name}"></video><figcaption>${m.name}</figcaption></figure>`).join("");
    videos=[...grid.querySelectorAll("video")]; if(videos.length){ leader=videos[0]; if(seek){seek.max=1000;seek.value=0;} videos.forEach(v=>{v.addEventListener("loadedmetadata",updateTime);v.addEventListener("timeupdate",updateTime);}); updateTime();
      if(!reduceMotion && 'IntersectionObserver' in window){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ if(!playing) setPlaying(true);} else if(playing) setPlaying(false); }),{threshold:0.3, rootMargin:"0px 0px -10% 0px"}); io.observe(sp);} }
    if(playBtn) playBtn.addEventListener("click",()=> playing?setPlaying(false):setPlaying(true));
    if(seek) seek.addEventListener("input",()=>{ seeking=true; const d=maxDur(); const t=(+seek.value)/1000*d; videos.forEach(v=>{try{v.currentTime=t;}catch(e){}}); updateTime(); setTimeout(()=>seeking=false,80); });
  })();

  /* ---------- Task modal, cards, filters ---------- */
  function taskById(id){ return B.TASKS.find(t=>t.id===id); }
  function taskCard(t){
    const a=AX[t.axis];
    const c=el("div","task-card"); c.style.setProperty("--c",a.color); c.dataset.id=t.id; c.dataset.axis=t.axis;
    const best=bestModel(t.id,"id","score");
    const mini=(t.stages||[]).map(s=>`<span class="s" style="background:${a.color};opacity:${0.25+0.75*(s.rate/100)}" title="${s.name}: ${s.rate}%"></span>`).join("");
    c.innerHTML=`
      <div class="thumb poster-ph">
        <img src="${B.ASSET_IMG}/tasks/${t.id}.jpg" alt="${t.name}" loading="lazy">
        <span class="ph-ribbon">${axisShort(t.axis)}</span>
      </div>
      <div class="body">
        <div class="ax-row"><span class="axis-tag ax-${axCls(t.axis)}">${a.label}</span>
          <span class="tid" style="margin-left:auto">${t.robot==="astribot"?"Astribot":"Franka"}</span></div>
        <h3>${t.name}</h3>
        <div class="stage-mini">${mini || '<span class="s"></span>'}</div>
        <div class="task-tags"><span class="t"><span class="mono">${t.stages?t.stages.length:1} stages</span></span>
          ${best?`<span class="t" style="color:${best.color};border-color:${best.color}55">best ${fmt1(best.v)} · ${best.name}</span>`:''}</div>
      </div>`;
    c.addEventListener("click",()=>openModal(t)); return c;
  }
  function axCls(k){ return {Generalization:"gen",Instruction_Following:"if",Limited_Demonstrations:"ld",Long_Horizon:"lh",Memory:"mem"}[k]; }
  function bestModel(tid, domain, metric){
    const r=B.RESULTS[tid]; if(!r) return null; let best=null;
    MODELS.forEach(m=>{ const d=r[m.id]; if(!d) return; const id=domain==="all"?(d["score_id"]+d["score_ood"])/2:d[metric+"_"+domain];
      if(best===null||id>best.v) best={v:id,name:m.name,color:m.color}; });
    return best;
  }

  /* ---------- Render tasks and filters + pagination ---------- */
  (function(){
    const rail=$("#task-filters"); const grid=$("#all-tasks"); if(!rail||!grid) return;
    const PER_PAGE = 24;
    let currentFilter = "All";
    let currentPage = 1;
    let orderedTasks = shuffleTasks(currentFilter==="All"?B.TASKS:B.TASKS.filter(t=>t.axis===currentFilter));
    // pagination container (inserted after the grid)
    const pager = el("div","task-pager");
    grid.parentNode.insertBefore(pager, grid.nextSibling);

    // Fisher–Yates shuffle (random ordering, fresh per filter selection).
    function shuffleTasks(arr){
      const a=Array.from(arr);
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        const tmp=a[i]; a[i]=a[j]; a[j]=tmp;
      }
      return a;
    }

    // build filters
    const axes=["All",...B.AXES.map(a=>a.key)];
    axes.forEach((ax,idx)=>{
      const btn=el("button","filter-chip"); btn.textContent=ax==="All"?"All":axisShort(ax); btn.dataset.axis=ax;
      btn.addEventListener("click",()=>{ rail.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b===btn)); currentFilter=ax; currentPage=1; orderedTasks=shuffleTasks(ax==="All"?B.TASKS:B.TASKS.filter(t=>t.axis===ax)); renderPage(); });
      rail.appendChild(btn);
    });
    rail.querySelector(".filter-chip").classList.add("active");

    function renderPage(){
      const tasks = orderedTasks;
      const totalPages = Math.max(1, Math.ceil(tasks.length / PER_PAGE));
      if(currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * PER_PAGE;
      const pageTasks = tasks.slice(start, start + PER_PAGE);

      grid.innerHTML="";
      pageTasks.forEach(t=>grid.appendChild(taskCard(t)));

      // build pager
      pager.innerHTML="";
      if(totalPages <= 1) return;

      const info = el("span","pager-info");
      info.textContent = `${start+1}–${Math.min(start+PER_PAGE, tasks.length)} of ${tasks.length}`;
      pager.appendChild(info);

      // prev
      const prev = el("button","pager-btn"); prev.textContent="‹"; prev.disabled = currentPage===1;
      prev.addEventListener("click",()=>{ if(currentPage>1){currentPage--;renderPage();grid.scrollIntoView({behavior:"smooth",block:"start"});} });
      pager.appendChild(prev);

      // page numbers (show max 7 with ellipsis)
      const pages = [];
      if(totalPages <= 7){
        for(let i=1;i<=totalPages;i++) pages.push(i);
      } else {
        pages.push(1);
        let lo=Math.max(2,currentPage-1), hi=Math.min(totalPages-1,currentPage+1);
        if(currentPage<=3){ lo=2; hi=4; }
        if(currentPage>=totalPages-2){ lo=totalPages-3; hi=totalPages-1; }
        if(lo>2) pages.push("…");
        for(let i=lo;i<=hi;i++) pages.push(i);
        if(hi<totalPages-1) pages.push("…");
        pages.push(totalPages);
      }
      pages.forEach(p=>{
        if(p==="…"){ const d=el("span","pager-ellip"); d.textContent="…"; pager.appendChild(d); return; }
        const b=el("button","pager-btn");
        b.textContent=String(p);
        if(p===currentPage) b.classList.add("active");
        b.addEventListener("click",()=>{ currentPage=p; renderPage(); grid.scrollIntoView({behavior:"smooth",block:"start"}); });
        pager.appendChild(b);
      });

      // next
      const next = el("button","pager-btn"); next.textContent="›"; next.disabled = currentPage===totalPages;
      next.addEventListener("click",()=>{ if(currentPage<totalPages){currentPage++;renderPage();grid.scrollIntoView({behavior:"smooth",block:"start"});} });
      pager.appendChild(next);
    }
    renderPage();
  })();

  function openModal(t){
    const a=AX[t.axis];
    const ov=el("div","modal-overlay"); const r=B.RESULTS[t.id];
    const rowsHtml = MODELS.map(m=>{ const d=r?r[m.id]:null; if(!d) return "";
      const sidr=`<td>${fmt1(d.score_id)}</td><td>${fmt1(d.succ_id)}</td><td>${fmt1(d.score_ood)}</td><td>${fmt1(d.succ_ood)}</td>`;
      return `<tr><td><span class="swatch" style="--c:${m.color}"><i style="background:${m.color}"></i>${m.name}</span></td>${sidr}</tr>`; }).join("");
    // per-subtask: ID (lingbot) and OOD (lingbot if available)
    const ling= r && r["lingbot_alljoint_fixed_60k"];
    const subId = (t.stages||[]).map((s,i)=>subRowHtml(i+1, s.name, s.rate)).join("");
    const subOod = ling && ling.sub_ood ? ling.sub_ood.map((s,i)=>subRowHtml(i+1, s.name, s.rate)).join("") : "";
    ov.innerHTML=`
      <div class="modal modal--duo">
        <div class="modal-clip modal-clip--media">
          <video class="task-front-video" src="${B.ASSET_VID}/tasks/${t.id}.mp4" autoplay muted loop playsinline preload="auto" controls aria-label="${t.name} replay"></video>
          <button class="modal-close" aria-label="Close">×</button>
          <span class="hero-badge" style="top:14px;left:14px;">Head-cam replay</span>
        </div>
        <div class="modal-link" aria-hidden="true"></div>
        <div class="modal-clip modal-clip--body">
          <div class="modal-title"><h2>${t.name}</h2><span class="axis-tag ax-${axCls(t.axis)}" style="font-size:12px">${a.label}</span></div>
          <div class="modal-emb">${t.robot==="astribot"?"Astribot S1":"Dual Franka"} · ${t.n_episodes} episodes · ${t.stages?t.stages.length:1} subtasks</div>
          <div class="modal-section"><h4>Language instruction</h4><p>${t.language}</p></div>
          <div class="modal-section"><h4>Subtask completion rate (lingbot, in-domain)</h4>
            <div class="sub-list">${subId || '<div class="sub-row"><span class="nm">No detailed subtask data</span></div>'}</div></div>
          ${subOod?`<div class="modal-section"><h4>Subtask completion rate (lingbot, out-of-domain)</h4><div class="sub-list">${subOod}</div></div>` : ""}
          <div class="modal-section"><h4>Per-model results (ID / OOD — progress / strict success %)</h4>
            <div style="overflow-x:auto"><table class="spec-table" style="min-width:460px">
            <thead><tr><th>Model</th><th>ID·prog</th><th>ID·succ</th><th>OOD·prog</th><th>OOD·succ</th></tr></thead>
            <tbody>${rowsHtml}</tbody></table></div></div>
        </div>
      </div>`;
    document.body.appendChild(ov); requestAnimationFrame(()=>ov.classList.add("open"));
    const close=()=>{ ov.classList.remove("open"); setTimeout(()=>ov.remove(),250); };
    $(".modal-close",ov).addEventListener("click",close); ov.addEventListener("click",e=>{ if(e.target===ov) close(); });
    document.addEventListener("keydown",function esc(e){ if(e.key==="Escape"){close(); document.removeEventListener("keydown",esc);} });
  }
  function subRowHtml(idx,name,rate){ return `<div class="sub-row"><span class="nm">${idx}. ${name}</span><span class="val">${fmt1(rate)}%</span><div class="sub-bar"><i style="width:${rate}%"></i></div></div>`; }

  /* ---------- Domain randomization grid: five head-camera clips (one per mode) ---------- */
  (function(){
    const grid=$("#dr-grid"); if(!grid) return;
    const modes=[
      {key:"dr_scene",       name:"Scene randomization", note:"Floor, wall and tabletop textures redrawn from a held-out pool with lighting position and intensity jitter."},
      {key:"dr_region",      name:"Region offset",       note:"Placement regions translated 4–9 cm in the world frame (precision-critical slots excluded)."},
      {key:"dr_distractor",  name:"Distractor injection", note:"2–6 sibling objects added; grasping a distractor terminates the episode at its latched score."},
      {key:"dr_scale",       name:"Object rescaling",    note:"Articulated objects scaled by {0.85, 0.9, 1.1, 1.15}."},
      {key:"dr_mirror",      name:"Left-right mirroring", note:"The whole layout is mirrored about the workspace midline; left/right is swapped in the instruction."}
    ];
    grid.innerHTML = modes.map((m,i)=>{
      return `<figure class="dr-card" style="--c:var(--accent)">
        <div class="dr-vid-wrap">
          <video class="dr-vid" src="static/videos/dr/${m.key}.mp4" autoplay muted loop playsinline preload="metadata" poster="static/images/frames/mv_head_color_poster.png"></video>
        </div>
        <figcaption>
          <h4>${m.name}</h4>
          <p>${m.note}</p>
        </figcaption>
      </figure>`;
    }).join("");
    // Lazy autoplay via IntersectionObserver
    if(!reduceMotion && 'IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(e=>{ const v=e.target.querySelector('video'); if(!v) return; if(e.isIntersecting){ if(v.paused) v.play().catch(()=>{}); } else if(!v.paused) v.pause(); }),{threshold:0.3});
      $$(".dr-card",grid).forEach(c=>io.observe(c));
    }
  })();

  /* ---------- Results heatmap (106 tasks x 7 models) ---------- */
  (function(){
    const tbl=$("#results-table"); if(!tbl) return;
    const state={ metric:"score", domain:"all" };
    function val(tid, mid){ const d=B.RESULTS[tid][mid]; if(!d) return null;
      if(state.domain==="all") return state.metric==="score"?(d.score_id+d.score_ood)/2:(d.succ_id+d.succ_ood)/2;
      return d[state.metric+"_"+state.domain]; }
    function cellColor(v){ const t=Math.max(0,Math.min(1,v/100));
      // warm-paper → teal ramp (234,240,246) → (26,122,109)
      const r=Math.round(234+(26-234)*t), g=Math.round(240+(122-240)*t), b=Math.round(246+(109-246)*t);
      return `rgb(${r},${g},${b})`; }
    function textColor(v){ return v>52?"#fffefb":"#15201e"; }
    function build(){
      let head=`<thead><tr class="rt-ax-head" style="--c:var(--bone)"><th colspan="${MODELS.length+1}">106 tasks × ${MODELS.length} VLA models · heatmap = ${state.metric==="score"?"progress score":"strict success"} (0–100) · domain = ${state.domain==="all"?"ID+OOD mean":state.domain==="id"?"In-Domain":"Out-of-Domain"}</th></tr>
      <tr><th class="th-task">Task</th>${MODELS.map(m=>`<th class="th-pol" style="border-bottom:2px solid ${m.color}">${m.name}</th>`).join("")}</tr></thead>`;
      let body="<tbody>"; let prevAx=null;
      B.AXES.forEach(a=>{
        body+=`<tr class="rt-ax-head" style="--c:${a.color}"><th colspan="${MODELS.length+1}" style="background:${a.color}">${a.label} · ${a.count} tasks</th></tr>`;
        B.TASKS.filter(t=>t.axis===a.key).forEach(t=>{
          const best=Math.max(...MODELS.map(m=>val(t.id,m.id)));
          const cells=MODELS.map(m=>{ const v=val(t.id,m.id); const isBest=Math.abs(v-best)<1e-9;
            return `<td class="num" style="background:${cellColor(v)};color:${textColor(v)}${isBest?";font-weight:700":""}">${v==null?"—":(v<10?v.toFixed(0):v.toFixed(0))}</td>`; }).join("");
          body+=`<tr data-tid="${t.id}" class="result-row"><td class="task rttask" style="--c:${a.color};border-left:3px solid ${a.color}">${t.name}<span class="robot">${t.robot==="astribot"?"AT":"  "}</span></td>${cells}</tr>`;
        });
      });
      body+=`<tr class="mean"><td class="mean-label">Overall mean</td>${MODELS.map(m=>{
        const v= state.domain==="all"?(state.metric==="score"?m.all_score:m.all_succ) : (state.metric==="score"?(state.domain==="id"?m.id_score:m.ood_score):(state.domain==="id"?m.id_succ:m.ood_succ));
        return `<td class="num mean-v">${fmt1(v)}</td>`; }).join("")}</tr>`;
      body+="</tbody>";
      tbl.innerHTML=head+body;
      const tip=el("div","htooltip"); document.body.appendChild(tip);
      function moveTip(e){ const r=e.target.getBoundingClientRect(); tip.style.left=Math.min(window.innerWidth-264, r.left+12)+"px"; tip.style.top=Math.max(8, r.top-8-tip.offsetHeight)+"px"; }
      $$("tr.result-row",tbl).forEach(row=>{ row.tabIndex=0;
        row.addEventListener("click",()=>{ $$("tr.result-row",tbl).forEach(r=>r.classList.toggle("selected",r===row)); });
        row.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); row.click(); } });
      });
      $$("td.num:not(.mean-v)",tbl).forEach(td=>{
        td.addEventListener("mouseenter",e=>{ const tr=td.closest("tr"); const tid=tr.dataset.tid; const t=taskById(tid);
          const cells=$$("td.num:not(.mean-v)",tr); const pi=cells.indexOf(td); const m=MODELS[pi]; const v=val(tid,m.id);
          if(t){ tip.innerHTML=`<div style="font-weight:600;color:#15201e">${t.name}</div><div>${m.name} · ${state.domain} · ${state.metric==="score"?"progress":"success"}</div><div style="margin-top:3px"><b>${v==null?"—":fmt1(v)}</b> / 100</div><div style="color:#5c5850;font-size:11px;margin-top:2px">${t.language||""}</div>`; }
          tip.style.opacity=1; moveTip(e);
        });
        td.addEventListener("mousemove",moveTip); td.addEventListener("mouseleave",()=>{tip.style.opacity=0;});
      });
    }
    build();
    $$(".rt-chip").forEach(chip=>{ chip.addEventListener("click",()=>{
      const grp=chip.dataset.group; $$(".rt-chip[data-group=\""+grp+"\"]").forEach(x=>x.classList.remove("active")); chip.classList.add("active");
      if(grp==="metric") state.metric=chip.dataset.k; if(grp==="domain") state.domain=chip.dataset.k; build();
    }); });
  })();

  /* ---------- BibTeX copy ---------- */
  (function(){
    const btn=$("#copy-bib"), toast=$("#copy-toast"), pre=$("#bibtex");
    if(!btn||!pre) return;
    btn.addEventListener("click",async()=>{ try{ await navigator.clipboard.writeText(pre.textContent); }catch(e){ const ta=el("textarea"); ta.value=pre.textContent; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      if(toast){ toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),1600); } });
  })();

  /* ---------- Fade-in on scroll ---------- */
  (function(){
    $$(".section").forEach(s=>s.classList.add("fade-in"));
    if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:.08});
      $$(".fade-in").forEach(s=>io.observe(s)); }
  })();

})();