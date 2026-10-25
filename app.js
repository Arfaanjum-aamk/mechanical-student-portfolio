import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const $ = (s) => document.querySelector(s);
const stageData = [
  ["Need definition","What must the artefact accomplish for its user or operating context?",["User or operating context and evidence of the need","Chosen application and quantified design inputs","Need statement and scope boundaries","Initial assumptions and constraints","Candidate requirement IDs with units","Contributors, evidence links and next action"]],
  ["Concept generation and selection","Which configuration best meets the functional need, and why?",["At least three concept sketches or evidence IDs","Meaningful differences between alternatives","Comparison criteria linked to the need","Pugh matrix or weighted comparison evidence","Selected concept and documented rationale","Open questions and next action"]],
  ["Functional requirements","What measurable conditions must the system satisfy?",["Requirement register and source of each target","Operating range, load, motion and duty conditions","Acceptance limits with units and verification methods","Requirements needing clarification","Adopted baseline, date and subsequent changes","Evidence and next action"]],
  ["Functional architecture","What functions must the subsystems perform, and how do they interact?",["Functional block diagram or evidence ID","Inputs and outputs of each block","Governing requirement IDs for each block","Energy, force and motion transfer between blocks","How one block affects the complete system","Foundation connections and next action"]],
  ["Subsystem design","Which configuration will perform each function before components are sized?",["Functional block and subsystem responsibilities","Subsystem alternatives considered","Selected mechanism, actuation, support and joint approaches","Why the choice determines the governing equations","Interfaces and unresolved design dependencies","Evidence and next action"]],
  ["Component design and calculation","Which calculations justify each significant dimension and rating?",["Requirement IDs and operating cases checked","Free body diagrams at relevant operating positions","Assumptions, governing equations and unit consistency","Sizing calculations and applicable failure checks","Selected dimensions, margins and reasons","Predictions to verify in testing","Calculation evidence IDs and next action"]],
  ["CAD and manufacturing drawings","Do the models and drawings express a justified, manufacturable design?",["CAD assembly and drawing evidence IDs with revisions","Dimensions traced to calculations or stated assumptions","Joints, motion range and interference checks","Fits, tolerances and critical inspection dimensions","Manufacturing details and drawing review comments","Changes and next action"]],
  ["Material and standard component selection","Why are these materials and standard parts appropriate?",["Material properties and sources used in design","Material choices linked to requirements and calculations","Standard parts, ratings and selection rationale","Bill of materials and procurement status","Availability trade-offs and documented design changes","Evidence and next action"]],
  ["Fabrication and assembly","How closely does the fabricated artefact follow the reviewed design?",["Drawing revisions used for fabrication","Manufacturing and assembly sequence","Inspection and assembly compliance results","Deviations, concession or rework records","Build photographs and contributor records","Effect of fabrication changes on calculations","Open issues and next action"]],
  ["Testing and predicted versus measured","How do measurements compare with predictions and requirements?",["Test plan, loading conditions and equipment setup","Instrument range, resolution and calibration checks","Prediction evidence recorded before measurement","Repeated measurements and raw data evidence","Comparison records, discrepancy and explanation","Requirement outcomes and limitations","Next verification action"]],
  ["Documented improvement","What change followed investigation, and did remeasurement support it?",["Observed discrepancy and investigation IDs","Hypotheses, isolation tests and supported cause","Design or build correction with rationale","Updated drawings, calculations or material choices","Before and after measurement evidence","Changed understanding and unresolved limitations","Contributors and next action"]]
];
const blankPortfolio = () => ({
  metadata: { title:"", team:"", guide:"", year:"", theme:"", repo:"", application:"", context:"", scope:"", members:"" },
  stages: stageData.map(([title,question,prompts])=>({title,question,status:"Not started",answers:prompts.map(()=> "")}))
});

let supabase = null, user = null, portfolio = blankPortfolio(), activeStage = 0, authMode = "login", dirty = false;
const readyConfig = () => SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("YOUR_") && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes("YOUR_");
if (readyConfig()) supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function setMessage(message, type="") { const el=$("#auth-message"); el.textContent=message; el.className=`message ${type}`; }
function setSaveStatus(text) { $("#save-status").textContent=text; }
function showAuth() { $("#auth-view").classList.remove("hidden"); $("#app-view").classList.add("hidden"); $("#logout-btn").classList.add("hidden"); $("#user-label").textContent=""; }
function showApp() { $("#auth-view").classList.add("hidden"); $("#app-view").classList.remove("hidden"); $("#logout-btn").classList.remove("hidden"); $("#user-label").textContent=user?.email||""; }
function setAuthMode(mode) {
  authMode=mode; $("#show-login").classList.toggle("active",mode==="login"); $("#show-signup").classList.toggle("active",mode==="signup");
  $("#auth-title").textContent=mode==="login"?"Welcome back":"Create your account";
  $("#auth-subtitle").textContent=mode==="login"?"Sign in to continue your portfolio.":"Create a personal account to start your portfolio.";
  $("#auth-submit").textContent=mode==="login"?"Sign in":"Create account";
  $("#name-field").classList.toggle("hidden",mode!=="signup");
  $("#password").autocomplete(mode==="login"?"current-password":"new-password"); setMessage("");
}
function markDirty(){dirty=true;setSaveStatus("Unsaved changes");}
function renderMetadata(){
  document.querySelectorAll("[data-meta]").forEach(el=>{
    const key=el.dataset.meta; const value=portfolio.metadata[key];
    el.value=Array.isArray(value)?value.join("\n"):(value||"");
  });
}
function renderNav(){
  const nav=$("#stage-nav"); nav.replaceChildren();
  stageData.forEach(([title],i)=>{
    const stage=portfolio.stages[i]||{status:"Not started"};
    const b=document.createElement("button"); b.className="stage-nav-item"+(i===activeStage?" active":"");
    const idx=document.createElement("span"); idx.className="stage-index"; idx.textContent=String(i+1).padStart(2,"0");
    const copy=document.createElement("span"); copy.className="nav-label"; copy.textContent=title;
    const status=document.createElement("span"); status.className="nav-status"; status.textContent=stage.status||"Not started"; copy.append(status);
    b.append(idx,copy); b.addEventListener("click",()=>{activeStage=i;renderStage();}); nav.append(b);
  });
  const completed=portfolio.stages.filter(s=>s.status==="Completed").length;
  $("#progress-count").textContent=`${completed} / 11 completed`;
  $("#progress-fill").style.width=`${completed/11*100}%`;
}
function renderStage(){
  const data=portfolio.stages[activeStage]||blankPortfolio().stages[activeStage];
  const [title,question,prompts]=stageData[activeStage];
  $("#stage-number").textContent=`STAGE ${String(activeStage+1).padStart(2,"0")}`;
  $("#stage-title").textContent=title; $("#stage-question").textContent=question;
  $("#stage-status").value=data.status||"Not started";
  $("#stage-position").textContent=`${activeStage+1} of ${stageData.length}`;
  $("#prev-stage").disabled=activeStage===0; $("#next-stage").textContent=activeStage===10?"Back to start ↑":"Next →";
  const fields=$("#prompt-fields");fields.replaceChildren();
  prompts.forEach((prompt,j)=>{
    const wrap=document.createElement("div");wrap.className="prompt-field";
    const label=document.createElement("label");const num=document.createElement("span");num.textContent=`${String(j+1).padStart(2,"0")} /`;
    const text=document.createElement("span");text.textContent=prompt;label.append(num,text);
    const ta=document.createElement("textarea");ta.className="prompt-input";ta.placeholder="Write your project-specific response. Add evidence IDs or links when relevant.";ta.value=(data.answers||[])[j]||"";
    ta.addEventListener("input",()=>{portfolio.stages[activeStage].answers[j]=ta.value;markDirty();});
    wrap.append(label,ta);fields.append(wrap);
  });
  renderNav();
}
async function loadPortfolio(){
  const {data,error}=await supabase.from("portfolios").select("portfolio_data").eq("user_id",user.id).maybeSingle();
  if(error){alert("Could not load portfolio. Check that the Supabase SQL setup and row-level security policies have been applied.");console.error(error);portfolio=blankPortfolio();}
  else if(data?.portfolio_data){
    const saved=data.portfolio_data; portfolio=blankPortfolio();
    portfolio.metadata={...portfolio.metadata,...(saved.metadata||{})};
    portfolio.stages=stageData.map(([title,question,prompts],i)=>({
      title,question,status:saved.stages?.[i]?.status||"Not started",
      answers:prompts.map((_,j)=>saved.stages?.[i]?.answers?.[j]||"")
    }));
  } else portfolio=blankPortfolio();
  dirty=false;renderMetadata();renderStage();setSaveStatus("All changes saved");
}
async function savePortfolio(){
  if(!supabase||!user)return;
  setSaveStatus("Saving…");$("#save-btn").disabled=true;
  const {error}=await supabase.from("portfolios").upsert({user_id:user.id,portfolio_data:portfolio,updated_at:new Date().toISOString()},{onConflict:"user_id"});
  $("#save-btn").disabled=false;
  if(error){setSaveStatus("Save failed");alert("Save failed. Check your Supabase table and security policies.");console.error(error);return;}
  dirty=false;setSaveStatus("Saved just now");
}
$("#show-login").addEventListener("click",()=>setAuthMode("login"));
$("#show-signup").addEventListener("click",()=>setAuthMode("signup"));
$("#auth-form").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!supabase){setMessage("Setup required: add your Supabase URL and publishable/anon key in config.js, then reload.","error");return;}
  const email=$("#email").value.trim(),password=$("#password").value;
  $("#auth-submit").disabled=true;setMessage(authMode==="login"?"Signing in…":"Creating account…");
  try{
    if(authMode==="login"){
      const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
      user=data.user;
    }else{
      const name=$("#student-name").value.trim();
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;
      if(!data.session){setMessage("Account created. Check your email to confirm it, then sign in.","success");return;}
      user=data.user;
    }
    if(user){showApp();await loadPortfolio();}
  }catch(err){setMessage(err.message||"Authentication failed.","error");}
  finally{$("#auth-submit").disabled=false;}
});
$("#logout-btn").addEventListener("click",async()=>{if(dirty&&!confirm("You have unsaved changes. Sign out anyway?"))return;await supabase.auth.signOut();user=null;portfolio=blankPortfolio();showAuth();});
document.querySelectorAll("[data-meta]").forEach(el=>el.addEventListener("input",()=>{portfolio.metadata[el.dataset.meta]=el.value;markDirty();}));
$("#stage-status").addEventListener("change",e=>{portfolio.stages[activeStage].status=e.target.value;markDirty();renderNav();});
$("#save-btn").addEventListener("click",savePortfolio);
$("#prev-stage").addEventListener("click",()=>{if(activeStage>0){activeStage--;renderStage();}});
$("#next-stage").addEventListener("click",()=>{activeStage=activeStage===10?0:activeStage+1;renderStage();});
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue="";}});
setAuthMode("login");
if(!supabase){setMessage("This website needs Supabase setup before accounts can work.","error");}
else{
  supabase.auth.getSession().then(async({data})=>{if(data.session){user=data.session.user;showApp();await loadPortfolio();}else showAuth();});
  supabase.auth.onAuthStateChange(async(_event,session)=>{if(session&&!user){user=session.user;showApp();await loadPortfolio();}});
}
