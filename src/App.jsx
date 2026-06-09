import { useState, useRef, useEffect } from "react";

const G="#c9a84c", BDR="1px solid #2a2a35";

// Time limits per level (seconds)
const LEVEL_TIME = {
  "Novice": 90,
  "Debater": 75,
  "Rhetorician": 60,
  "Sophist": 45,
  "Orator": 35,
  "Philosopher King": 25,
};

async function callClaude(messages, system) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 400, system, messages }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.content?.[0]?.text || '';
    } catch (e) {
      if (i === 2) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

const LEVELS=[
  {name:"Novice",          min:0,    max:400,      icon:"⚔️",  color:"#888",    unlock:"Basic topics"},
  {name:"Debater",         min:400,  max:900,       icon:"🗡️",  color:"#6abf69", unlock:"Political topics"},
  {name:"Rhetorician",     min:900,  max:1600,      icon:"🔥",  color:"#4fc3f7", unlock:"Hard topics"},
  {name:"Sophist",         min:1600, max:2500,      icon:"⚡",  color:"#ce93d8", unlock:"Custom traits"},
  {name:"Orator",          min:2500, max:3600,      icon:"🏛️",  color:"#ffb74d", unlock:"Expert topics"},
  {name:"Philosopher King",min:3600, max:Infinity,  icon:"👑",  color:"#c9a84c", unlock:"All topics"},
];

const ALL_TOPICS=[
  {label:"Pineapple belongs on pizza",                              d:1,cat:"🍕 Food"},
  {label:"Cats are better pets than dogs",                          d:1,cat:"🐾 Pets"},
  {label:"Morning people have a better life than night owls",       d:1,cat:"🌅 Lifestyle"},
  {label:"Video games are a waste of time",                         d:1,cat:"🎮 Gaming"},
  {label:"Paper books are better than e-books",                     d:1,cat:"📖 Culture"},
  {label:"Going to the gym is overrated",                           d:1,cat:"💪 Health"},
  {label:"Fast food should be taxed like cigarettes",               d:1,cat:"🍔 Health"},
  {label:"Cold weather is better than hot weather",                 d:1,cat:"🌦️ Lifestyle"},
  {label:"Social media makes people lonelier",                      d:1,cat:"📱 Social Media"},
  {label:"Streaming services have ruined cinema",                   d:1,cat:"🎬 Entertainment"},
  {label:"Smartphones have made us less smart",                     d:1,cat:"📱 Technology"},
  {label:"Coffee is better than tea",                               d:1,cat:"☕ Food"},
  {label:"Online friendships are just as real as offline ones",     d:1,cat:"👥 Relationships"},
  {label:"Breakfast is the most important meal of the day",         d:1,cat:"🍳 Health"},
  {label:"Tattoos in the workplace should be fully accepted",       d:1,cat:"💼 Work"},
  {label:"Napping during the workday should be encouraged",         d:1,cat:"💼 Work"},
  {label:"Tourism does more harm than good",                        d:1,cat:"✈️ Travel"},
  {label:"People are too dependent on technology",                  d:1,cat:"📱 Technology"},
  {label:"Art degrees are a waste of money",                        d:2,cat:"🎓 Education"},
  {label:"Zoos should be shut down",                                d:2,cat:"🦁 Ethics"},
  {label:"Competitive sports do more harm than good for kids",      d:2,cat:"⚽ Sports"},
  {label:"Celebrity culture is toxic",                              d:2,cat:"🌟 Celebrity"},
  {label:"School uniforms should be mandatory everywhere",          d:2,cat:"🎓 Education"},
  {label:"Homework should be abolished",                            d:2,cat:"🎓 Education"},
  {label:"Violent video games make people more violent",            d:2,cat:"🎮 Gaming"},
  {label:"Zuckerberg has made the world worse",                     d:2,cat:"💻 Technology"},
  {label:"Public transport should be free for everyone",            d:2,cat:"🚌 Transport"},
  {label:"Influencers deserve to earn more than teachers",          d:2,cat:"💰 Economy"},
  {label:"Alcohol is more dangerous than marijuana",                d:2,cat:"🍺 Health"},
  {label:"Owning a car in a city is irresponsible",                 d:2,cat:"🚗 Environment"},
  {label:"Parents should not post photos of their kids online",     d:2,cat:"👶 Parenting"},
  {label:"The minimum wage should be doubled",                      d:2,cat:"💸 Economy"},
  {label:"College is no longer worth the cost",                     d:2,cat:"🎓 Education"},
  {label:"Cancel culture has gone too far",                         d:2,cat:"📢 Society"},
  {label:"The news makes people more anxious and less informed",    d:2,cat:"📰 Media"},
  {label:"Bottled water should be banned",                          d:2,cat:"🌍 Environment"},
  {label:"Working more than 40 hours a week is self-destructive",   d:2,cat:"💼 Work"},
  {label:"AI will eliminate more jobs than it creates",             d:3,cat:"🤖 AI"},
  {label:"Crypto is a scam",                                        d:3,cat:"💸 Finance"},
  {label:"Universal basic income should be implemented globally",   d:3,cat:"💸 Economy"},
  {label:"Meat-eating is ethically wrong",                          d:3,cat:"🥩 Ethics"},
  {label:"Space exploration is a waste of money",                   d:3,cat:"🚀 Science"},
  {label:"TikTok should be permanently banned",                     d:3,cat:"📱 Technology"},
  {label:"The death penalty should be abolished everywhere",        d:3,cat:"⚖️ Law"},
  {label:"Prisons should focus on fixing people, not punishment",   d:3,cat:"⚖️ Law"},
  {label:"Billionaires should not be allowed to exist",             d:3,cat:"💸 Economy"},
  {label:"Religion does more harm than good",                       d:3,cat:"⛪ Religion"},
  {label:"The four-day work week should be the global standard",    d:3,cat:"💼 Work"},
  {label:"Recreational drugs should be decriminalized",             d:3,cat:"⚖️ Law"},
  {label:"Online privacy is more important than national security", d:3,cat:"🔐 Technology"},
  {label:"Assisted dying should be legal everywhere",               d:3,cat:"⚖️ Ethics"},
  {label:"The gig economy exploits workers",                        d:3,cat:"💼 Economy"},
  {label:"Electric cars are not actually better for the environment",d:3,cat:"🌍 Environment"},
  {label:"Animal testing should be completely banned",              d:3,cat:"🐭 Ethics"},
  {label:"The war on drugs has been a total failure",               d:3,cat:"⚖️ Law"},
  {label:"Elon Musk has done more harm than good",                  d:4,cat:"🌍 Politics"},
  {label:"The EU is becoming irrelevant",                           d:4,cat:"🌍 Politics"},
  {label:"Democracy is overrated as a system of government",        d:4,cat:"🌍 Politics"},
  {label:"The US two-party system is broken beyond repair",         d:4,cat:"🌍 Politics"},
  {label:"Capitalism is the root cause of climate change",          d:4,cat:"🌍 Economy"},
  {label:"Open borders would make the world better",                d:4,cat:"🌍 Politics"},
  {label:"Mainstream media can no longer be trusted",               d:4,cat:"📰 Media"},
  {label:"Globalization has hurt more people than it has helped",   d:4,cat:"🌍 Economy"},
  {label:"Governments should tax the wealthy far more",             d:4,cat:"💸 Economy"},
  {label:"The tech industry has too much power over society",       d:4,cat:"💻 Technology"},
  {label:"Immigration is a net positive for any country",           d:4,cat:"🌍 Politics"},
  {label:"Nationalism is dangerous in the modern world",            d:4,cat:"🌍 Politics"},
  {label:"The US should take military action against Iran",         d:5,cat:"⚔️ Geopolitics"},
  {label:"China will surpass the US as the world's superpower",     d:5,cat:"⚔️ Geopolitics"},
  {label:"Nuclear energy is the only real path to net zero",        d:5,cat:"⚔️ Science"},
  {label:"Western sanctions on Russia have failed",                 d:5,cat:"⚔️ Geopolitics"},
  {label:"AI poses an existential threat to humanity",              d:5,cat:"🤖 AI"},
  {label:"The West should stop sending weapons to Ukraine",         d:5,cat:"⚔️ Geopolitics"},
  {label:"Free will does not exist",                                d:5,cat:"🧠 Philosophy"},
  {label:"Morality is relative — nothing is truly right or wrong",  d:5,cat:"🧠 Philosophy"},
  {label:"A world government is the only way to solve global problems",d:5,cat:"⚔️ Geopolitics"},
  {label:"Democracy will not survive the age of AI",                d:5,cat:"🤖 AI"},
];

const DC={1:"#4ade80",2:"#a3e635",3:"#c9a84c",4:"#fb923c",5:"#f87171"};
const DL={1:"Easy",2:"Medium",3:"Hard",4:"Expert",5:"Master"};
const FALLACIES=[
  {name:"Ad Hominem",        pat:/you (don't|cant|wouldn't|never)|your kind|people like you/i},
  {name:"Straw Man",         pat:/so you('re| are) saying|you think everyone|that means you believe/i},
  {name:"False Dichotomy",   pat:/either.+or|only two|no other (option|choice|way)/i},
  {name:"Slippery Slope",    pat:/next (thing|you know)|leads to|end up with|inevitably/i},
  {name:"Appeal to Emotion", pat:/think of the (children|future|people)|imagine if your/i},
];
const TRAITS=[
  {id:"sarcastic",   label:"Sarcastic",      desc:"Uses dry, cutting humor"},
  {id:"questioning", label:"Questions back",  desc:"Responds with questions"},
  {id:"data-driven", label:"Uses data",       desc:"Cites stats & studies"},
  {id:"empathetic",  label:"Empathetic",      desc:"Acknowledges your feelings first"},
  {id:"contrarian",  label:"Contrarian",      desc:"Disagrees with everything"},
  {id:"detailed",    label:"Very detailed",   desc:"Gives long, thorough responses"},
];
const INTENSITY={
  civil:    {label:"🤝 Respectful", desc:"Measured and fair",     prompt:"Be respectful and measured. Acknowledge good points while firmly defending your position."},
  sharp:    {label:"⚡ Sharp",      desc:"Confident, no mercy",   prompt:"Be confident and incisive. Push back hard on weak arguments. Do not concede easily."},
  ruthless: {label:"🔥 Ruthless",  desc:"Brutal and relentless", prompt:"Be relentless. Find every flaw. Be blunt and unyielding. Do not soften your rebuttals."},
};

const getLevel=r=>LEVELS.find(l=>r>=l.min&&r<l.max)||LEVELS[LEVELS.length-1];
const getMaxDiff=r=>r<400?2:r<900?3:r<2500?4:5;
const loadSt=()=>{try{const s=localStorage.getItem("da_v4");return s?JSON.parse(s):null;}catch{return null;}};
const saveSt=s=>{try{localStorage.setItem("da_v4",JSON.stringify(s));}catch{}};

function pickTopics(rating, exclude=[]) {
  const max = getMaxDiff(rating);
  const sh = a => [...a].sort(() => Math.random() - 0.5);
  const full = ALL_TOPICS.filter(t => t.d <= max);
  const pool = full.filter(t => !exclude.includes(t.label));
  const src = pool.length >= 8 ? pool : full;
  const shuffled = sh(src);
  const pick = [], usedCats = new Set();
  for (const t of shuffled) {
    if (pick.length >= 4) break;
    const base = t.cat.split(" ").slice(1).join(" ");
    if (!usedCats.has(base)) { pick.push(t); usedCats.add(base); }
  }
  const used = new Set(pick.map(t=>t.label));
  const rem = sh(src.filter(t=>!used.has(t.label)));
  while (pick.length < 4 && rem.length) pick.push(rem.shift());
  return sh(pick).slice(0,4);
}

function PulsingOrb(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"16px 20px",background:"rgba(26,26,36,0.95)",border:BDR,borderRadius:"18px 18px 18px 4px",width:"fit-content",backdropFilter:"blur(8px)"}}>
      <div style={{position:"relative",width:22,height:22}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:G,animation:"pR 1.4s ease-out infinite"}}/>
        <div style={{position:"absolute",inset:5,borderRadius:"50%",background:G,animation:"pC 1.4s ease-in-out infinite"}}/>
      </div>
      <span style={{fontSize:16,color:"#9a9690",fontFamily:"sans-serif"}}>Thinking…</span>
    </div>
  );
}

function LevelUpModal({level,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#13131a",border:`2px solid ${level.color}`,borderRadius:24,padding:"3rem 2.5rem",textAlign:"center",maxWidth:400,boxShadow:`0 0 60px ${level.color}44`}}>
        <div style={{fontSize:72,marginBottom:16}}>{level.icon}</div>
        <div style={{fontSize:13,letterSpacing:".2em",textTransform:"uppercase",color:level.color,fontFamily:"sans-serif",marginBottom:10}}>Level Up!</div>
        <div style={{fontSize:32,fontWeight:900,color:"#e8e4dc",marginBottom:10}}>{level.name}</div>
        <div style={{fontSize:17,color:"#9a9690",fontFamily:"sans-serif"}}>Unlocked: <span style={{color:level.color}}>{level.unlock}</span></div>
        <button onClick={onClose} style={{marginTop:24,padding:"14px 36px",background:level.color,color:"#0a0a0f",border:"none",borderRadius:10,fontSize:17,fontWeight:700,fontFamily:"sans-serif",cursor:"pointer"}}>Keep Going</button>
      </div>
    </div>
  );
}

function Timer({seconds, onExpire}){
  const [left, setLeft] = useState(seconds);
  const ref = useRef(null);
  useEffect(()=>{
    setLeft(seconds);
    ref.current = setInterval(()=>{
      setLeft(s=>{
        if(s<=1){ clearInterval(ref.current); onExpire(); return 0; }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(ref.current);
  },[seconds]);
  const pct = (left/seconds)*100;
  const col = left>seconds*0.5?"#4ade80":left>seconds*0.25?"#c9a84c":"#f87171";
  const mins = Math.floor(left/60);
  const secs = left%60;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{fontSize:28,fontWeight:900,color:col,fontFamily:"sans-serif",fontVariantNumeric:"tabular-nums",minWidth:60,textAlign:"center"}}>
        {mins>0?`${mins}:${String(secs).padStart(2,"0")}`:secs}
      </div>
      <div style={{width:60,height:5,background:"#2a2a35",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:3,transition:"width 1s linear",boxShadow:`0 0 6px ${col}88`}}/>
      </div>
    </div>
  );
}

export default function App(){
  const saved=loadSt();
  const [rating,setRating]         = useState(saved?.rating??0);
  const [prevRating,setPrev]       = useState(null);
  const [trophies,setTrophies]     = useState(saved?.trophies??[]);
  const [topics,setTopics]         = useState(()=>pickTopics(saved?.rating??0));
  const [stage,setStage]           = useState("setup");
  const [topic,setTopic]           = useState("");
  const [custom,setCustom]         = useState("");
  const [side,setSide]             = useState("");
  const [intensity,setIntensity]   = useState("sharp");
  const [traits,setTraits]         = useState([]);
  const [showTraits,setShowTraits] = useState(false);
  const [showStats,setShowStats]   = useState(false);
  const [msgs,setMsgs]             = useState([]);
  const [hist,setHist]             = useState([]);
  const [input,setInput]           = useState("");
  const [loading,setLoading]       = useState(false);
  const [round,setRound]           = useState(1);
  const [scores,setScores]         = useState([]);
  const [fallacies,setFallacies]   = useState({});
  const [summary,setSummary]       = useState("");
  const [sumLoading,setSumLoading] = useState(false);
  const [lvlModal,setLvlModal]     = useState(null);
  const [timerKey,setTimerKey]     = useState(0);
  const [timerActive,setTimerActive] = useState(false);
  const chatRef = useRef(null);

  const act   = custom.trim()||topic;
  const level = getLevel(rating);
  const nxt   = LEVELS[LEVELS.indexOf(level)+1];
  const pct   = nxt?((rating-level.min)/(nxt.min-level.min))*100:100;
  const avg   = scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
  const delta = prevRating!==null?rating-prevRating:null;
  const sc    = s=>s>=8?"#4ade80":s>=6?G:s>=4?"#fb923c":"#f87171";
  const sl    = s=>s>=8?"Strong":s>=6?"Solid":s>=4?"Weak":"Poor";
  const timeLimit = LEVEL_TIME[level.name] || 60;

  useEffect(()=>{saveSt({rating,trophies});},[rating,trophies]);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs,loading,summary]);

  const refresh=()=>{setTopics(pickTopics(rating,topics.map(t=>t.label)));setTopic("");setCustom("");};
  const toggleTrait=id=>setTraits(t=>t.includes(id)?t.filter(x=>x!==id):[...t,id]);

  const buildSys=()=>{
    const cs  = side==="for"?"against":"for";
    const td  = traits.map(id=>TRAITS.find(t=>t.id===id)?.desc).filter(Boolean).join(". ");
    const diffNote = level.name==="Novice"
      ? "IMPORTANT: The user is a beginner. Use simple everyday language only. Occasionally make a logical mistake or leave a weak point they could challenge — this helps them learn. No academic jargon."
      : level.name==="Debater"
      ? "The user has some experience. Use clear arguments. Occasionally leave a small logical gap."
      : "The user is experienced. Argue sharply and rigorously.";
    return `You are a debate opponent. Topic: "${act}". You argue ${cs==="for"?"in favor of":"against"} this. The user argues ${side==="for"?"in favor of":"against"} it.\n${INTENSITY[intensity].prompt}${td?" Style: "+td+".":""}\n${diffNote}\nRules: Never break character. Never fully concede. 2-4 sentences only. No bullet points.`;
  };

  const detectF=(text,idx)=>{
    const found=FALLACIES.filter(f=>f.pat.test(text)).map(f=>f.name);
    if(found.length)setFallacies(p=>({...p,[idx]:found}));
  };

  const grade=async text=>{
    try{
      const r=await callClaude([{role:"user",content:`Grade this debate argument 1-10 for logic, evidence, originality. ONE number only.\n"${text}"\nTopic:"${act}"`}],"Impartial judge. Reply single integer 1-10 only.");
      const n=parseInt(r.trim());return isNaN(n)?5:Math.min(10,Math.max(1,n));
    }catch{return 5;}
  };

  const startDebate=async()=>{
    setStage("debate");setMsgs([]);setHist([]);setRound(1);setScores([]);setFallacies({});setSummary("");setPrev(null);setLoading(true);setTimerActive(false);
    try{
      const o=await callClaude([{role:"user",content:"Open with your strongest single argument."}],buildSys());
      setHist([{role:"assistant",content:o}]);setMsgs([{role:"claude",text:o}]);
      setTimerKey(k=>k+1); setTimerActive(true);
    }catch(e){setMsgs([{role:"claude",text:"Error: "+e.message}]);}
    setLoading(false);
  };

  const send=async(autoSubmit=false)=>{
    if(loading) return;
    const txt = autoSubmit ? (input.trim()||"[Time ran out — no argument submitted]") : input.trim();
    if(!txt && !autoSubmit) return;
    setTimerActive(false);
    setInput("");
    const idx=msgs.length;
    setMsgs(m=>[...m,{role:"user",text:txt,timedOut:autoSubmit&&!input.trim()}]);
    detectF(txt,idx);
    const newH=[...hist,{role:"user",content:txt}];
    setHist(newH);setRound(r=>r+1);setLoading(true);
    const[s,reply]=await Promise.all([grade(txt),callClaude(newH,buildSys()).catch(e=>"Error: "+e.message)]);
    setScores(x=>[...x,s]);
    setHist([...newH,{role:"assistant",content:reply}]);
    setMsgs(m=>[...m,{role:"claude",text:reply,score:s}]);
    setLoading(false);
    setTimerKey(k=>k+1); setTimerActive(true);
  };

  const endDebate=async()=>{
    if(sumLoading||summary)return;
    setTimerActive(false);
    setSumLoading(true);
    const a=scores.length?scores.reduce((x,y)=>x+y,0)/scores.length:5;
    const d=Math.round((a-5)*20),old=rating,nw=Math.max(0,old+d);
    const ol=getLevel(old),nl=getLevel(nw);
    setPrev(old);setRating(nw);
    if(nl.name!==ol.name&&nw>old)setLvlModal(nl);
    setTrophies(t=>[{topic:act,side,avg:Math.round(a*10)/10,delta:d,date:new Date().toLocaleDateString(),rounds:round},...t].slice(0,20));
    try{
      const s=await callClaude([...hist,{role:"user",content:"Summarize in under 100 words: (1) user's best argument, (2) weakest point, (3) logical mistakes, (4) one improvement tip. Be honest."}],"Expert debate coach. Direct, constructive feedback.");
      setSummary(s);
    }catch(e){setSummary("Could not generate summary: "+e.message);}
    setSumLoading(false);
  };

  const CSS=`
    *{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%;overflow:hidden}
    body{background:#0a0a0f;color:#e8e4dc;font-family:Georgia,serif}
    @keyframes pR{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.8);opacity:0}}
    @keyframes pC{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
    @keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .mi{animation:msgIn .4s cubic-bezier(.2,.8,.2,1) forwards}
    .hov:hover{opacity:.82;transition:opacity .12s;cursor:pointer}
    .bhov:hover{filter:brightness(1.1)}
    input:focus,textarea:focus{outline:none;border-color:#c9a84c!important}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-thumb{background:#2a2a35;border-radius:3px}
    .timer-pulse{animation:pulse .6s ease-in-out infinite}
  `;

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if(stage==="setup") return(
    <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{CSS}</style>
      {lvlModal&&<LevelUpModal level={lvlModal} onClose={()=>setLvlModal(null)}/>}

      {/* TOP BAR */}
      <div style={{height:"64px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",borderBottom:BDR,flexShrink:0}}>
        <span style={{fontSize:"1.8rem",fontWeight:900,letterSpacing:"-1px"}}>DEBATE <span style={{color:G}}>ARENA</span></span>
        <div style={{display:"flex",alignItems:"center",gap:28}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{level.icon}</span>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:level.color,fontFamily:"sans-serif"}}>{level.name}</div>
              <div style={{fontSize:13,color:"#9a9690",fontFamily:"sans-serif"}}>{rating} pts{delta!==null&&<span style={{color:delta>=0?"#4ade80":"#f87171",marginLeft:6}}>{delta>=0?"+":""}{delta}</span>}</div>
            </div>
          </div>
          <div style={{width:130}}>
            <div style={{height:7,background:"#2a2a35",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:level.color,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 8px ${level.color}88`}}/>
            </div>
            {nxt&&<div style={{fontSize:12,color:"#6b6860",fontFamily:"sans-serif",marginTop:4,textAlign:"center"}}>{nxt.min-rating} pts to {nxt.name}</div>}
          </div>
          <button onClick={()=>setShowStats(s=>!s)} style={{background:"none",border:BDR,borderRadius:8,padding:"8px 18px",fontSize:14,color:"#9a9690",fontFamily:"sans-serif",cursor:"pointer"}}>{showStats?"▾ Hide Stats":"▸ My Stats"}</button>
        </div>
      </div>

      {/* STATS DRAWER */}
      {showStats&&(
        <div style={{background:"#0d0d14",borderBottom:BDR,padding:"18px 40px",display:"flex",gap:48,flexShrink:0}}>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:12}}>Recent Debates</div>
            {trophies.length===0&&<p style={{fontSize:14,color:"#6b6860",fontFamily:"sans-serif"}}>No debates yet.</p>}
            {trophies.slice(0,3).map((t,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<2?"1px solid #1a1a24":"none"}}>
                <div><div style={{fontSize:14,color:"#c8c4b8",fontFamily:"sans-serif"}}>{t.topic}</div><div style={{fontSize:12,color:"#6b6860",fontFamily:"sans-serif"}}>{t.date} · {t.rounds} rounds · avg {t.avg}/10</div></div>
                <span style={{fontSize:15,fontWeight:700,color:t.delta>=0?"#4ade80":"#f87171",fontFamily:"sans-serif"}}>{t.delta>=0?"+":""}{t.delta} pts</span>
              </div>
            ))}
          </div>
          <div style={{width:200}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:12}}>Levels</div>
            {LEVELS.map(l=>(
              <div key={l.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7,opacity:rating>=l.min?1:.3}}>
                <span>{l.icon}</span>
                <div style={{fontSize:13,fontWeight:700,color:l.color,fontFamily:"sans-serif"}}>{l.name} <span style={{color:"#6b6860",fontWeight:400}}>· {l.min} pts</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 COLUMNS */}
      <div style={{flex:1,display:"flex",minHeight:0}}>

        {/* LEFT */}
        <div style={{flex:1,borderRight:BDR,display:"flex",flexDirection:"column",padding:"24px 32px",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif"}}>Choose a Topic</span>
            <button onClick={refresh} style={{background:"none",border:BDR,borderRadius:6,padding:"5px 14px",fontSize:16,color:"#9a9690",cursor:"pointer",fontFamily:"sans-serif"}}>↻ Shuffle</button>
          </div>
          {topics.map(t=>(
            <button key={t.label} className="hov" onClick={()=>{setTopic(t.label);setCustom("");}}
              style={{flex:1,background:topic===t.label&&!custom?"#1e1c2e":"#0f0f16",border:topic===t.label&&!custom?"1.5px solid #534AB7":BDR,borderRadius:10,padding:"16px",fontFamily:"sans-serif",color:topic===t.label&&!custom?"#b8b0f0":"#c0bdb8",cursor:"pointer",display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:15,color:"#e8e4dc",fontFamily:"sans-serif",fontWeight:600}}>{t.cat}</span>
                <span style={{fontSize:13,color:DC[t.d],fontWeight:700,fontFamily:"sans-serif",background:DC[t.d]+"22",padding:"2px 10px",borderRadius:20}}>{DL[t.d]}</span>
              </div>
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"4px 4px 0"}}>
                <span style={{fontSize:19,lineHeight:1.45}}>{t.label}</span>
              </div>
            </button>
          ))}
          <div>
            <div style={{fontSize:14,color:"#6b6860",fontFamily:"sans-serif",marginBottom:8}}>Or type your own:</div>
            <input value={custom} onChange={e=>{setCustom(e.target.value);setTopic("");}}
              style={{width:"100%",background:"#0f0f16",border:BDR,borderRadius:10,padding:"16px 18px",fontSize:18,fontFamily:"sans-serif",color:"#e8e4dc"}}/>
          </div>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",justifyContent:"center"}}>
            {Object.entries(DL).map(([d,l])=>(
              <div key={d} style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:9,height:9,borderRadius:"50%",background:DC[d],display:"inline-block"}}/>
                <span style={{fontSize:14,color:"#9a9690",fontFamily:"sans-serif"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE */}
        <div style={{flex:1,borderRight:BDR,display:"flex",flexDirection:"column",padding:"24px 32px",gap:10}}>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif"}}>Your Side</div>
          {[["for","👍","I'm FOR it","You argue in favor — Claude argues against"],
            ["against","👎","I'm AGAINST it","You argue against — Claude argues in favor"]].map(([v,ic,ti,de])=>(
            <div key={v} className="hov" onClick={()=>setSide(v)}
              style={{flex:1,background:side===v?"#1e1c2e":"#0f0f16",border:side===v?"1.5px solid #534AB7":BDR,borderRadius:12,padding:"20px",cursor:"pointer",display:"flex",alignItems:"center",gap:18}}>
              <span style={{fontSize:42}}>{ic}</span>
              <div>
                <div style={{fontSize:22,fontWeight:700,color:"#e8e4dc",fontFamily:"sans-serif"}}>{ti}</div>
                <div style={{fontSize:16,color:"#9a9690",fontFamily:"sans-serif",marginTop:5}}>{de}</div>
              </div>
            </div>
          ))}
          <div style={{fontSize:13,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif"}}>Debate Style</div>
          {Object.entries(INTENSITY).map(([k,{label,desc}])=>(
            <button key={k} className="hov" onClick={()=>setIntensity(k)}
              style={{flex:1,background:intensity===k?"#1a1208":"#0f0f16",border:intensity===k?`1.5px solid ${G}`:BDR,borderRadius:9,padding:"20px",fontFamily:"sans-serif",color:intensity===k?G:"#c0bdb8",textAlign:"left",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"center",gap:6}}>
              <div style={{fontSize:20,fontWeight:700}}>{label}</div>
              <div style={{fontSize:16,color:intensity===k?"#c9a84c99":"#6b6860"}}>{desc}</div>
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 32px",gap:10}}>
          <button onClick={()=>setShowTraits(s=>!s)}
            style={{background:"none",border:"none",cursor:"pointer",color:G,fontSize:14,fontFamily:"sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",padding:0,display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            {showTraits?"▾":"▸"} Customize Claude's Style
          </button>
          {showTraits&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,flexShrink:0}}>
              {TRAITS.map(t=>(
                <button key={t.id} className="hov" onClick={()=>toggleTrait(t.id)}
                  style={{background:traits.includes(t.id)?"#1a1208":"#0f0f16",border:traits.includes(t.id)?`1.5px solid ${G}`:BDR,borderRadius:9,padding:"14px",cursor:"pointer",textAlign:"left"}}>
                  <div style={{fontSize:15,fontWeight:700,color:traits.includes(t.id)?G:"#c8c4b8",fontFamily:"sans-serif",marginBottom:4}}>{t.label}</div>
                  <div style={{fontSize:14,color:"#9a9690",fontFamily:"sans-serif"}}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}
          <div style={{flex:1,background:"#0f0f16",border:BDR,borderRadius:12,padding:"28px",display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:13,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",textAlign:"center",marginBottom:8}}>How Scoring Works</div>
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-evenly"}}>
              {[["🟢","Strong (8-10)","#4ade80","You gain the most points"],
                ["🟡","Solid (6-7)","#c9a84c","You gain some points"],
                ["🟠","Weak (4-5)","#fb923c","You break even"],
                ["🔴","Poor (1-3)","#f87171","You lose points"]].map(([dot,label,col,explain])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 0",borderBottom:"1px solid #1a1a24"}}>
                  <span style={{fontSize:30,flexShrink:0}}>{dot}</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:19,color:col,fontFamily:"sans-serif",fontWeight:700}}>{label}</div>
                    <div style={{fontSize:16,color:"#c0bdb8",fontFamily:"sans-serif",marginTop:4}}>{explain}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Time limit note */}
          <div style={{background:"#13131a",border:BDR,borderRadius:10,padding:"12px 16px",textAlign:"center",flexShrink:0}}>
            <div style={{fontSize:13,color:"#6b6860",fontFamily:"sans-serif"}}>⏱ Time per argument at your level:</div>
            <div style={{fontSize:20,fontWeight:700,color:G,fontFamily:"sans-serif",marginTop:4}}>{timeLimit} seconds</div>
          </div>
          <button disabled={!act||!side} className={act&&side?"bhov":""} onClick={startDebate}
            style={{flexShrink:0,width:"100%",padding:"22px",background:act&&side?G:"#1a1a24",color:act&&side?"#0a0a0f":"#444",border:"none",borderRadius:12,fontSize:20,fontWeight:700,fontFamily:"sans-serif",letterSpacing:".05em",cursor:act&&side?"pointer":"not-allowed",transition:"all .2s"}}>
            {act&&side?"⚔️  ENTER THE ARENA":"Select a topic & side first"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── DEBATE ─────────────────────────────────────────────────────────────────
  return(
    <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{CSS}</style>
      {lvlModal&&<LevelUpModal level={lvlModal} onClose={()=>setLvlModal(null)}/>}

      {/* TOP BAR */}
      <div style={{height:"64px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",borderBottom:BDR,flexShrink:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(10px)"}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:14,fontWeight:700,padding:"4px 14px",borderRadius:20,fontFamily:"sans-serif",background:"#0d1f17",color:"#4ade80",border:"1px solid #1a3d2b"}}>YOU: {side==="for"?"FOR":"AGAINST"}</span>
          <span style={{fontSize:14,fontWeight:700,padding:"4px 14px",borderRadius:20,fontFamily:"sans-serif",background:"#1e1c2e",color:"#a89eed",border:"1px solid #3d3680"}}>CLAUDE: {side==="for"?"AGAINST":"FOR"}</span>
          {traits.map(id=><span key={id} style={{fontSize:13,padding:"3px 10px",borderRadius:20,fontFamily:"sans-serif",background:"#1a1208",color:G,border:"1px solid #3d2e10"}}>{TRAITS.find(t=>t.id===id)?.label}</span>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20,flexShrink:0}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>Round</div>
            <div style={{fontSize:22,fontWeight:700}}>{round}</div>
          </div>
          {avg!==null&&<div style={{textAlign:"center"}}>
            <div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".08em"}}>Avg</div>
            <div style={{fontSize:22,fontWeight:700,color:sc(avg)}}>{avg}<span style={{fontSize:13,color:"#3a3a45"}}>/10</span></div>
          </div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={endDebate} disabled={sumLoading||!!summary}
              style={{fontSize:14,color:sumLoading||summary?"#3a3a45":"#f87171",background:"none",border:"1px solid",borderColor:sumLoading||summary?"#2a2a35":"#3a1a1a",borderRadius:8,padding:"8px 16px",cursor:sumLoading||summary?"not-allowed":"pointer",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>
              {sumLoading?"Generating…":"⏹ End & Summarize"}
            </button>
            <button onClick={()=>setStage("setup")}
              style={{fontSize:14,color:G,background:"none",border:`1px solid #3d2e10`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontFamily:"sans-serif"}}>↩ New</button>
          </div>
        </div>
      </div>

      <div style={{flex:1,display:"flex",minHeight:0}}>
        {/* CHAT AREA */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,position:"relative",
          background:"linear-gradient(135deg, #0a0a0f 0%, #0d0d18 40%, #0a1012 70%, #0d0a0f 100%)"}}>
          {/* Decorative background elements */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
            <div style={{position:"absolute",top:"10%",left:"5%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle, #534AB711 0%, transparent 70%)"}}/>
            <div style={{position:"absolute",bottom:"20%",right:"8%",width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle, #c9a84c08 0%, transparent 70%)"}}/>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, #1a1a2e18 0%, transparent 60%)"}}/>
            {/* Subtle grid lines */}
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.03}} xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c9a84c" strokeWidth="0.5"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>

          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"28px 36px",display:"flex",flexDirection:"column",gap:18,position:"relative",zIndex:1}}>
            {msgs.map((m,i)=>(
              <div key={i} className="mi" style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"72%"}}>
                <div style={{fontSize:12,color:"#6b6860",marginBottom:6,fontFamily:"sans-serif",letterSpacing:".06em",textTransform:"uppercase",textAlign:m.role==="user"?"right":"left"}}>{m.role==="user"?"You":"Claude"}</div>
                <div style={{padding:"16px 20px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",fontSize:17,lineHeight:1.75,background:m.role==="user"?"linear-gradient(135deg, #c9a84c, #b8962e)":"rgba(26,26,36,0.95)",color:m.role==="user"?"#0a0a0f":"#d4d0c8",border:m.role==="user"?"none":"1px solid #2a2a3a",backdropFilter:m.role==="user"?"none":"blur(8px)",boxShadow:m.role==="user"?"0 4px 20px #c9a84c33":"0 4px 20px rgba(0,0,0,0.3)"}}>
                  {m.timedOut?<span style={{color:"#f87171",fontStyle:"italic"}}>⏱ Time ran out — no argument submitted</span>:m.text}
                </div>
                {m.role==="user"&&!m.timedOut&&m.score!=null&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:7}}>
                    <div style={{width:`${(m.score/10)*80}px`,height:4,background:sc(m.score),borderRadius:2,transition:"width .6s ease",boxShadow:`0 0 6px ${sc(m.score)}88`}}/>
                    <span style={{fontSize:14,color:sc(m.score),fontFamily:"sans-serif",fontWeight:600}}>{sl(m.score)} ({m.score}/10)</span>
                  </div>
                )}
                {m.role==="user"&&fallacies[i]&&(
                  <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {fallacies[i].map(f=><span key={f} style={{fontSize:13,padding:"3px 10px",background:"#2d1515",border:"1px solid #7f1d1d",borderRadius:20,color:"#f87171",fontFamily:"sans-serif"}}>⚠️ {f}</span>)}
                  </div>
                )}
              </div>
            ))}
            {loading&&(
              <div className="mi" style={{display:"flex",flexDirection:"column",alignItems:"flex-start",alignSelf:"flex-start"}}>
                <div style={{fontSize:12,color:"#6b6860",marginBottom:6,fontFamily:"sans-serif",letterSpacing:".06em",textTransform:"uppercase"}}>Claude</div>
                <PulsingOrb/>
              </div>
            )}
            {summary&&(
              <div className="mi" style={{background:"rgba(14,14,26,0.97)",border:"1px solid #2a2a55",borderRadius:16,padding:"22px 28px",marginTop:6,backdropFilter:"blur(8px)"}}>
                <div style={{fontSize:14,fontWeight:700,color:"#a89eed",marginBottom:12,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"sans-serif"}}>📋 Debate Summary & Coaching</div>
                <p style={{fontSize:17,color:"#c8c4b8",lineHeight:1.8,margin:"0 0 16px"}}>{summary}</p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:15,color:"#9a9690",fontFamily:"sans-serif"}}>Avg: <span style={{color:sc(avg),fontWeight:700}}>{avg}/10</span>{delta!==null&&<span style={{marginLeft:8,color:delta>=0?"#4ade80":"#f87171",fontWeight:700}}>{delta>=0?"+":""}{delta} pts</span>}</span>
                  <button onClick={()=>setStage("setup")} style={{padding:"10px 22px",background:G,color:"#0a0a0f",border:"none",borderRadius:9,fontSize:16,fontWeight:700,fontFamily:"sans-serif",cursor:"pointer"}}>New Debate</button>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          {!summary&&(
            <div style={{padding:"16px 36px",borderTop:"1px solid #1a1a2e",display:"flex",gap:12,alignItems:"flex-end",flexShrink:0,background:"rgba(10,10,15,0.95)",backdropFilter:"blur(10px)",position:"relative",zIndex:1}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(false);}}}
                style={{flex:1,resize:"none",height:"56px",padding:"16px 18px",fontSize:16,fontFamily:"sans-serif",background:"rgba(15,15,22,0.8)",border:"1px solid #2a2a3a",borderRadius:12,color:"#e8e4dc",lineHeight:1.4,backdropFilter:"blur(8px)"}}/>
              <button disabled={loading||!input.trim()} onClick={()=>send(false)}
                style={{height:"56px",padding:"0 32px",background:loading||!input.trim()?"#1a1a24":G,color:loading||!input.trim()?"#444":"#0a0a0f",border:"none",borderRadius:12,fontSize:16,fontWeight:700,fontFamily:"sans-serif",cursor:loading||!input.trim()?"not-allowed":"pointer",flexShrink:0,boxShadow:loading||!input.trim()?"none":"0 4px 16px #c9a84c44"}}>
                Send
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR — doubled width */}
        <div style={{width:"360px",borderLeft:"1px solid #1a1a2e",display:"flex",flexDirection:"column",flexShrink:0,background:"linear-gradient(180deg, #0d0d16 0%, #0a0a12 100%)"}}>
          {/* Topic */}
          <div style={{padding:"20px 24px",borderBottom:"1px solid #1a1a2e"}}>
            <div style={{fontSize:12,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Topic</div>
            <div style={{fontSize:17,color:"#e8e4dc",lineHeight:1.5,fontWeight:600}}>"{act}"</div>
          </div>

          {/* Timer */}
          {!summary&&(
            <div style={{padding:"16px 24px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Your Time</div>
                <div style={{fontSize:14,color:"#6b6860",fontFamily:"sans-serif"}}>Make your move before time runs out</div>
              </div>
              {timerActive&&!loading&&<Timer key={timerKey} seconds={timeLimit} onExpire={()=>send(true)}/>}
              {(!timerActive||loading)&&(
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:22,color:"#3a3a45",fontFamily:"sans-serif",fontWeight:700}}>–:––</div>
                  <div style={{fontSize:12,color:"#3a3a45",fontFamily:"sans-serif"}}>waiting</div>
                </div>
              )}
            </div>
          )}

          <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:20}}>
            {/* Score guide */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:12}}>Argument Score</div>
              {[["🟢","Strong","8-10","#4ade80"],["🟡","Solid","6-7","#c9a84c"],["🟠","Weak","4-5","#fb923c"],["🔴","Poor","1-3","#f87171"]].map(([dot,l,r,col])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"8px 12px",background:"#13131a",borderRadius:8,border:"1px solid #1a1a24"}}>
                  <span style={{fontSize:17,fontFamily:"sans-serif",color:"#c8c4b8"}}>{dot} {l}</span>
                  <span style={{fontSize:17,color:col,fontFamily:"sans-serif",fontWeight:700}}>{r}</span>
                </div>
              ))}
            </div>

            {/* Fallacy flags */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Fallacy Flags</div>
              <div style={{fontSize:16,color:"#c0bdb8",fontFamily:"sans-serif",lineHeight:1.7,background:"#13131a",border:"1px solid #1a1a24",borderRadius:8,padding:"12px 14px"}}>
                If you make a logical mistake, a <span style={{color:"#f87171",fontWeight:700}}>⚠️ red tag</span> appears under your message.
              </div>
            </div>

            {/* Tips */}
            <div>
              <div style={{fontSize:12,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:10}}>Debate Tips</div>
              {["Use real-world examples","Stay focused on the topic","Directly respond to Claude's point","Avoid emotional language","Ask 'why?' to expose weak logic"].map((tip,i)=>(
                <div key={tip} style={{fontSize:16,color:"#c0bdb8",fontFamily:"sans-serif",marginBottom:10,padding:"10px 14px",paddingLeft:14,borderLeft:"3px solid #534AB7",background:"#13131a",borderRadius:"0 8px 8px 0",lineHeight:1.4}}>{tip}</div>
              ))}
            </div>
          </div>

          {/* Level bar at bottom */}
          <div style={{padding:"16px 24px",borderTop:"1px solid #1a1a2e",background:"#0d0d16"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:22}}>{level.icon}</span>
                <span style={{fontSize:18,fontWeight:700,color:level.color,fontFamily:"sans-serif"}}>{level.name}</span>
              </div>
              <span style={{fontSize:14,color:"#6b6860",fontFamily:"sans-serif"}}>{rating} pts</span>
            </div>
            <div style={{height:8,background:"#2a2a35",borderRadius:4,overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",width:`${pct}%`,background:level.color,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 10px ${level.color}88`}}/>
            </div>
            {nxt&&<div style={{fontSize:14,color:"#9a9690",fontFamily:"sans-serif",textAlign:"center"}}>{nxt.min-rating} pts to {nxt.name}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
