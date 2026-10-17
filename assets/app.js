(function(){
  const $ = id => document.getElementById(id);
  const KEY = "worth-the-shift-v2";
  const store = {
    get(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } },
    set(v){ try{ localStorage.setItem(KEY, JSON.stringify(v)); }catch(e){} }
  };
  let state = Object.assign({ share:false, pay:null, demo:false, period:"month", currency:"INR", hpd:9, dpw:5, history:[] }, store.get());
  const save = () => store.set(state);
  const DEMO_PAY = { INR:100000, USD:6000, EUR:5000, GBP:4500, AED:20000 };

  const PICKS = {
    INR:[["iPhone 18",99900],["AirPods Pro",24900],["A fancy bottle",3500],["A car",850000],["Weekend in Goa",25000],["Swiggy, again",450],["PS5",54990]],
    USD:[["iPhone 18",899],["AirPods Pro",249],["A fancy bottle",60],["A car",32000],["Weekend away",900],["Takeout, again",28],["PS5",499]],
    EUR:[["iPhone 18",999],["AirPods Pro",279],["A fancy bottle",55],["A car",30000],["Weekend away",800],["Takeout, again",25],["PS5",549]],
    GBP:[["iPhone 18",899],["AirPods Pro",229],["A fancy bottle",45],["A car",26000],["Weekend away",700],["Takeout, again",22],["PS5",479]],
    AED:[["iPhone 18",3699],["AirPods Pro",949],["A fancy bottle",200],["A car",110000],["Weekend away",3000],["Takeout, again",90],["PS5",1999]]
  };
  const SYM = { INR:"₹", USD:"$", EUR:"€", GBP:"£", AED:"AED " };

  // Accepts 1,80,000 · 180000 · 1.8L · 1.8 lakh · 21.6 LPA · 80k · 1.2Cr · ₹ 1,80,000
  function parseAmount(raw){
    if(raw==null) return NaN;
    let t=String(raw).toLowerCase().replace(/[₹$€£,\s]|rs\.?|inr|aed|usd|eur|gbp|\/-/g,"");
    let mult=1;
    const m=t.match(/(lpa|lakhs?|lacs?|l|crores?|cr|k)$/);
    if(m){ const u=m[1]; t=t.slice(0,-u.length); mult = u.startsWith("cr") ? 1e7 : u==="k" ? 1e3 : 1e5; }
    if(!/^\d*\.?\d+$/.test(t)) return NaN;
    return parseFloat(t)*mult;
  }
  const cfg = () => state.pay ? state : { ...state, pay: DEMO_PAY[state.currency]||60000, period:"month" };
  const hourly = c => (c.period==="year" ? c.pay/12 : c.pay) / (c.hpd * c.dpw * 52/12);
  const money = (v,cur) => { try{ return new Intl.NumberFormat(cur==="INR"?"en-IN":"en-US",{style:"currency",currency:cur,maximumFractionDigits:0}).format(v); }catch(e){ return Math.round(v)+" "+cur; } };
  function fmtHours(h){
    if (h < 1/60) return { big: Math.max(1, Math.round(h*3600)) + "s", unit:"seconds of pretending to type" };
    if (h < 1) return { big: Math.round(h*60) + " min", unit:"of your actual life" };
    if (h < 100){ const H=Math.floor(h), M=Math.round((h-H)*60); return { big: M? `${H}h ${M}m` : `${H}h`, unit:"of your actual life" }; }
    return { big: Math.round(h).toLocaleString("en-IN") + "h", unit:"of your actual life" };
  }

  function verdict(h, c, seed){
    const pick = a => a[Math.abs(seed) % a.length];
    const day = c.hpd, week = c.hpd*c.dpw, month = week*52/12, year = week*52;
    const days = h/day, weeks = h/week, months = h/month, years = h/year;
    const r = n => n<10 ? n.toFixed(1).replace(/\.0$/,"") : Math.round(n).toLocaleString("en-IN");
    if (h < 0.25) return pick(["Under fifteen minutes. A bathroom break pays for this. Just buy it.","That's one coffee run's worth of fake productivity. Why are you even asking?","Less time than you spend reading Slack messages you'll ignore. Go."]);
    if (h < 1) return pick(["Less than one meeting that could have been an email. Fine, you've earned it.","You burn more than this on the morning standup. Treat yourself.","Shorter than lunch. Honestly, it's yours."]);
    if (h < day*0.6) return pick(["Half a day of looking busy when the boss walks past. Your call, champ.","A few hours of nodding in meetings. Doable. Barely tragic.","That's a morning of reply-all chaos. Worth it? You tell me."]);
    if (h < day*1.5) return pick(["A full day of your life. Commute both ways included. Still want it?","One entire shift. Every 'per my last email'. All of it. For this.","That's a whole day you could've called in sick for. Think about it."]);
    if (h < week) return `${r(days)} workdays. That's ${r(days)} alarms, ${r(days)} commutes and ${r(days)} lunches at your desk. Really?`;
    if (h < month*1.5) return pick([`${r(weeks)} work weeks of "hope this finds you well". Sure about this?`,`${r(weeks)} weeks of Monday dread, condensed into one purchase. Bold.`]);
    if (h < year) return `${r(months)} months of clocking in. Seasons will change. Your manager won't. Sleep on it.`;
    return pick([`${r(years)} years at that desk. You'd be paying for this with your youth. Absolutely not… unless?`,`${r(years)} years. Your office plant will die twice before this is paid off.`]);
  }

  const ago = t => { const s=(Date.now()-t)/1000; if(s<60) return "just now"; if(s<3600) return Math.floor(s/60)+" min ago"; if(s<86400) return Math.floor(s/3600)+"h ago"; return Math.floor(s/86400)+"d ago"; };

  /* ---------- render ---------- */
  function render(animate){
    const c = cfg();
    $("demoPill").hidden = !!state.pay;
    $("price").placeholder = (SYM[state.currency]||"") + ((PICKS[state.currency]||PICKS.INR)[0][1]).toLocaleString(state.currency==="INR"?"en-IN":"en-US");
    renderChips();
    const hist = state.history.filter(e=>e.cur===state.currency);
    $("emptyHero").hidden = hist.length>0;
    $("verdict").hidden = hist.length===0;
    $("ledgerCard").hidden = hist.length<2;
    if(!hist.length) return;

    const e = hist[0], rate = hourly(c), h = e.price/rate, f = fmtHours(h);
    $("vItem").textContent = e.name;
    $("vPrice").textContent = money(e.price, e.cur);
    $("vAt").hidden = state.share; $("basis").hidden = state.share; $("shareNote").hidden = !state.share;
    $("shareBtn").setAttribute("aria-pressed", state.share); $("shareBtn").textContent = state.share ? "Show price" : "Screenshot mode";
    $("vWhen").textContent = e.ex ? "example" : ago(e.t);
    $("vBig").textContent = f.big; $("vUnit").textContent = f.unit;
    $("vLine").textContent = verdict(h, c, e.seed||0);
    const st=$("stamp"); if(animate){ st.classList.remove("hit"); void st.offsetWidth; st.classList.add("hit"); }

    const days = h / c.hpd, wrap=$("days"); wrap.innerHTML="";
    let unitDays = 1, label = "workday";
    if (days > 60){ unitDays = c.dpw; label = "work week"; }
    if (days/unitDays > 60){ unitDays = c.dpw*52/12; label = "work month"; }
    if (days/unitDays > 60){ unitDays = c.dpw*52; label = "work year"; }
    const units = days/unitDays, n = Math.min(60, Math.ceil(units));
    for(let i=0;i<n;i++){ const d=document.createElement("span"); d.className="day"; const fill=document.createElement("i"); fill.style.width=Math.min(1,Math.max(0,units-i))*100+"%"; d.appendChild(fill); wrap.appendChild(d); }
    $("daysCap").textContent = `Each box is one ${label}. Red is the part you'd sign away.`;

    $("facts").innerHTML = `
      <div class="fact"><span class="n">${days.toFixed(days<10?1:0)}</span><span class="l">workdays</span></div>
      <div class="fact"><span class="n">${Number(h.toFixed(h<10?1:0)).toLocaleString("en-IN")}</span><span class="l">hour-long meetings</span></div>
      <div class="fact"><span class="n">${Math.round(h*5).toLocaleString("en-IN")}</span><span class="l">coffee breaks to "think"</span></div>`;
    $("basis").textContent = `${money(e.price,e.cur)} ÷ your hourly rate. Your month counts as ${Math.round(c.hpd*c.dpw*52/12)} work hours (${c.hpd}h × ${c.dpw} days × 4.33 weeks).${state.pay?"":" Using demo pay until you set yours."}`;

    const ul=$("ledger"); ul.innerHTML=""; let total=0;
    hist.slice(1).forEach(x=>{
      const hh=x.price/rate; total+=hh;
      const li=document.createElement("li");
      const what=document.createElement("span"); what.className="what"; what.textContent=x.name;
      const sm=document.createElement("small"); sm.textContent=(state.share ? "" : money(x.price,x.cur)+" · ")+ago(x.t); what.appendChild(sm);
      const hrs=document.createElement("span"); hrs.className="hrs"; hrs.textContent=fmtHours(hh).big;
      li.append(what,hrs); ul.appendChild(li);
    });
    total += h;
    $("ledgerTotal").textContent = `${fmtHours(total).big} total`;
  }
  function renderChips(){
    $("chips").innerHTML = "";
    (PICKS[state.currency]||PICKS.INR).forEach(([n,p])=>{
      const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=n;
      b.onclick=()=>{ $("item").value=n; $("price").value=p.toLocaleString(state.currency==="INR"?"en-IN":"en-US"); submit("quick_pick"); };
      $("chips").appendChild(b);
    });
  }

  /* ---------- composer ---------- */
  let sessionChecks = 0;
  function submit(source){
    const name = $("item").value.trim() || "that thing";
    const price = parseAmount($("price").value);
    if (!(price > 0)){ $("composerErr").textContent="Need a price, boss. Try 99,900 or 1L."; $("price").focus(); return; }
    $("composerErr").textContent="";
    state.history = state.history.filter(x=>!x.ex);
    state.history.unshift({ name, price, cur: state.currency, t: Date.now(), seed: Math.floor(Math.random()*1000) });
    state.history = state.history.slice(0, 30);
    save(); render(true);
    sessionChecks++;
    wsTrack("Price Checked", { source: source || "typed", demo_pay: !state.pay, checks_this_visit: sessionChecks, total_checks: state.history.filter(x=>!x.ex).length });
    $("item").value=""; $("price").value="";
    window.scrollTo({top:0,behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto":"smooth"});
  }
  $("shareBtn").onclick=()=>{ state.share=!state.share; save(); render(false); wsTrack("Screenshot Mode Toggled", { on: state.share }); };
  $("composer").addEventListener("submit", e=>{ e.preventDefault(); submit("typed"); });

  /* ---------- sheet ---------- */
  let draftPeriod = state.period, editingPay = false;
  function openSheet(){
    const first = !state.pay && !state.demo;
    draftPeriod = state.period; editingPay = !state.pay;
    $("sheetTitle").innerHTML = first ? "Clock in. <em>Once.</em>" : "Settings";
    $("sheetSub").textContent = first ? "Tell us what you make. We'll hide it and never bring it up again. Unlike your manager." : "Tweak your hours or pay. Your salary stays hidden.";
    $("closeSheet").hidden = first;
    $("demoBtn").hidden = !first;
    $("dangerZone").hidden = first;
    $("saveBtn").textContent = first ? "Punch in" : "Save";
    $("hpd").value = state.hpd; $("dpw").value = state.dpw; $("currency").value = state.currency;
    $("setupErr").textContent=""; $("confirmMsg").textContent=""; $("salary").value="";
    delete $("saveBtn").dataset.confirm;
    syncPay(); syncSeg();
    $("scrim").hidden = false;
    if(!first) wsTrack("Settings Opened");
    setTimeout(()=> (editingPay ? $("salary") : $("hpd")).focus(), 50);
  }
  function closeSheet(){ if(!state.pay && !state.demo) return; $("scrim").hidden = true; $("gear").focus(); }
  function syncPay(){
    $("maskedRow").hidden = editingPay;
    $("salaryLabel").hidden = !editingPay;
    if(!editingPay) $("maskedMeta").textContent = `Paid ${state.period==="year"?"yearly":"monthly"}. Saved and hidden.`;
  }
  function syncSeg(){ $("perMonth").setAttribute("aria-pressed", draftPeriod==="month"); $("perYear").setAttribute("aria-pressed", draftPeriod==="year"); }
  $("perMonth").onclick=()=>{ draftPeriod="month"; syncSeg(); delete $("saveBtn").dataset.confirm; };
  $("perYear").onclick=()=>{ draftPeriod="year"; syncSeg(); delete $("saveBtn").dataset.confirm; };
  $("changePay").onclick=()=>{ editingPay=true; syncPay(); $("salary").focus(); };
  $("gear").onclick=openSheet;
  $("demoPill").onclick=openSheet;
  $("closeSheet").onclick=closeSheet;
  $("scrim").addEventListener("click", e=>{ if(e.target===$("scrim")) closeSheet(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !$("scrim").hidden) closeSheet(); });
  $("salary").addEventListener("keydown", e=>{ if(e.key==="Enter") $("saveBtn").click(); });

  $("saveBtn").onclick=()=>{
    const hpd=parseFloat($("hpd").value), dpw=parseFloat($("dpw").value);
    if(!(hpd>0&&hpd<=24)||!(dpw>0&&dpw<=7)){ $("setupErr").textContent="Hours a day must be 1–24 and days a week 1–7. Even you can't work more."; return; }
    let pay = state.pay;
    if(editingPay){
      pay = parseAmount($("salary").value);
      if(!(pay>0)){ $("setupErr").textContent="Couldn't read that. Try something like 1,80,000 or 1.8L."; return; }
    }
    const cur = $("currency").value;
    const testRate = hourly({pay,period:draftPeriod,hpd,dpw});
    if(cur==="INR" && (testRate<20 || testRate>50000) && !$("saveBtn").dataset.confirm){
      $("saveBtn").dataset.confirm="1"; $("saveBtn").textContent="Yes, that's right";
      $("setupErr").textContent = testRate<20 ? "That's under ₹20 an hour. Did you mean per year, or drop a few zeros?" : "That's over ₹50,000 an hour. Yearly pay entered as monthly? Check the toggle, or confirm.";
      return;
    }
    const wasOnboarding = !state.pay;
    Object.assign(state,{ pay, period:draftPeriod, hpd, dpw, currency:cur, demo:false });
    if(wasOnboarding) wsTrack("Onboarding Completed", { pay_period: draftPeriod, currency: cur });
    else wsTrack("Settings Saved", { changed_salary: editingPay });
    $("salary").value=""; save();
    $("scrim").hidden = true; render(true);
  };
  $("demoBtn").onclick=()=>{ wsTrack("Demo Mode Started"); state.demo=true; state.currency=$("currency").value; save(); $("scrim").hidden=true; render(false); };
  $("clearHist").onclick=()=>{ wsTrack("History Cleared"); state.history=[]; save(); render(false); $("confirmMsg").textContent="History cleared. Clean slate, same job."; };
  $("forget").onclick=()=>{
    if(!$("forget").dataset.armed){ $("forget").dataset.armed="1"; $("forget").textContent="Tap again to forget"; return; }
    delete $("forget").dataset.armed; $("forget").textContent="Forget my salary";
    wsTrack("Salary Forgotten");
    state.pay=null; state.demo=false; save(); render(false); openSheet();
  };

  /* ---------- boot ---------- */
  // Fresh visitors see one example card behind the onboarding sheet.
  if(!state.history.length && !state.pay && !state.demo){
    state.history=[{ name:"iPhone 18", price:99900, cur:"INR", t:Date.now(), seed:1, ex:true }];
  }
  render(false);
  (function(){
    let source = "direct";
    try{
      const u = new URLSearchParams(location.search).get("utm_source");
      if(u) source = u.slice(0,40);
      else if(document.referrer){ const h = new URL(document.referrer).hostname.replace(/^www\./,""); if(h !== location.hostname) source = h; }
    }catch(e){}
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    wsTrack("App Opened", { source, installed_app: standalone, visitor: state.pay ? "set_up" : state.demo ? "demo" : "new" });
  })();
  window.addEventListener("appinstalled", ()=> wsTrack("App Installed"));
  if(!state.pay && !state.demo) openSheet();
  setInterval(()=>render(false), 60000);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); });
}
