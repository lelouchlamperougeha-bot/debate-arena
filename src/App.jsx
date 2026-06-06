import { useState, useRef, useEffect } from "react";

const G="#c9a84c", BDR="1px solid #2a2a35";

// All API calls go through our secure backend — no API key in the browser
async function callClaude(messages, system) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 400, system, messages }),
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
  {name:"Novice",min:0,max:400,icon:"⚔️",color:"#888",unlock:"Basic topics"},
  {name:"Debater",min:400,max:900,icon:"🗡️",color:"#6abf69",unlock:"Political topics"},
  {name:"Rhetorician",min:900,max:1600,icon:"🔥",color:"#4fc3f7",unlock:"Hard topics"},
  {name:"Sophist",min:1600,max:2500,icon:"⚡",color:"#ce93d8",unlock:"Custom traits"},
  {name:"Orator",min:2500,max:3600,icon:"🏛️",color:"#ffb74d",unlock:"Expert topics"},
  {name:"Philosopher King",min:3600,max:Infinity,icon:"👑",color:"#c9a84c",unlock:"All topics"},
];
const ALL_TOPICS=[
  {label:"Pineapple belongs on pizza",d:1,cat:"🍕 Food"},
  {label:"Cats are better pets than dogs",d:1,cat:"🐾 Life"},
  {label:"Morning people have a better life than night owls",d:1,cat:"🧠 Life"},
  {label:"Video games are a waste of time",d:1,cat:"🎮 Culture"},
  {label:"Paper books are better than e-books",d:1,cat:"📚 Culture"},
  {label:"Going to the gym is overrated",d:1,cat:"💪 Health"},
  {label:"Fast food should be taxed like cigarettes",d:1,cat:"🍔 Health"},
  {label:"Cold weather is better than hot weather",d:1,cat:"🌦️ Life"},
  {label:"Social media makes people lonelier",d:1,cat:"📱 Society"},
  {label:"Streaming services have ruined cinema",d:1,cat:"🎬 Culture"},
  {label:"Smartphones have made us less smart",d:1,cat:"📱 Tech"},
  {label:"Coffee is better than tea",d:1,cat:"☕ Food"},
  {label:"Online friendships are just as real as offline ones",d:1,cat:"🧠 Life"},
  {label:"Breakfast is the most important meal of the day",d:1,cat:"🍳 Health"},
  {label:"Tattoos in the workplace should be fully accepted",d:1,cat:"💼 Culture"},
  {label:"Napping during the workday should be encouraged",d:1,cat:"💼 Work"},
  {label:"Tourism does more harm than good",d:1,cat:"✈️ Life"},
  {label:"People are too dependent on technology",d:1,cat:"📱 Tech"},
  {label:"Art degrees are a waste of money",d:2,cat:"🎓 Education"},
  {label:"Zoos should be shut down",d:2,cat:"🐾 Ethics"},
  {label:"Competitive sports do more harm than good for kids",d:2,cat:"🏅 Sports"},
  {label:"Celebrity culture is toxic",d:2,cat:"🌟 Culture"},
  {label:"School uniforms should be mandatory everywhere",d:2,cat:"🎓 Education"},
  {label:"Homework should be abolished",d:2,cat:"🎓 Education"},
  {label:"Violent video games make people more violent",d:2,cat:"🎮 Culture"},
  {label:"Zuckerberg has made the world worse",d:2,cat:"📱 Tech"},
  {label:"Public transport should be free for everyone",d:2,cat:"🚇 Society"},
  {label:"Influencers deserve to earn more than teachers",d:2,cat:"💰 Society"},
  {label:"Alcohol is more dangerous than marijuana",d:2,cat:"🍺 Health"},
  {label:"Owning a car in a city is irresponsible",d:2,cat:"🚗 Society"},
  {label:"Parents should not post photos of their kids online",d:2,cat:"📱 Society"},
  {label:"The minimum wage should be doubled",d:2,cat:"💸 Economics"},
  {label:"College is no longer worth the cost",d:2,cat:"🎓 Education"},
  {label:"Cancel culture has gone too far",d:2,cat:"🌟 Society"},
  {label:"The news makes people more anxious and less informed",d:2,cat:"📰 Society"},
  {label:"Bottled water should be banned",d:2,cat:"🌍 Environment"},
  {label:"Working more than 40 hours a week is self-destructive",d:2,cat:"💼 Work"},
  {label:"AI will eliminate more jobs than it creates",d:3,cat:"🤖 AI"},
  {label:"Crypto is a scam",d:3,cat:"💸 Finance"},
  {label:"Universal basic income should be implemented globally",d:3,cat:"💸 Economics"},
  {label:"Meat-eating is ethically wrong",d:3,cat:"🐾 Ethics"},
  {label:"Space exploration is a waste of money",d:3,cat:"🚀 Science"},
  {label:"TikTok should be permanently banned",d:3,cat:"📱 Tech"},
  {label:"The death penalty should be abolished everywhere",d:3,cat:"⚖️ Law"},
  {label:"Prisons should focus on fixing people, not punishment",d:3,cat:"⚖️ Law"},
  {label:"Billionaires should not be allowed to exist",d:3,cat:"💸 Economics"},
  {label:"Religion does more harm than good",d:3,cat:"🕊️ Society"},
  {label:"The four-day work week should be the global standard",d:3,cat:"💼 Work"},
  {label:"Recreational drugs should be decriminalized",d:3,cat:"⚖️ Law"},
  {label:"Online privacy is more important than national security",d:3,cat:"🔐 Tech"},
  {label:"Assisted dying should be legal everywhere",d:3,cat:"⚖️ Ethics"},
  {label:"The gig economy exploits workers",d:3,cat:"💼 Economics"},
  {label:"Electric cars are not actually better for the environment",d:3,cat:"🚗 Environment"},
  {label:"Animal testing should be completely banned",d:3,cat:"🐾 Ethics"},
  {label:"The war on drugs has been a total failure",d:3,cat:"⚖️ Law"},
  {label:"Elon Musk has done more harm than good",d:4,cat:"🌍 Politics"},
  {label:"The EU is becoming irrelevant",d:4,cat:"🌍 Politics"},
  {label:"Democracy is overrated as a system of government",d:4,cat:"🌍 Politics"},
  {label:"The US two-party system is broken beyond repair",d:4,cat:"🌍 Politics"},
  {label:"Capitalism is the root cause of climate change",d:4,cat:"🌍 Economics"},
  {label:"Open borders would make the world better",d:4,cat:"🌍 Politics"},
  {label:"Mainstream media can no longer be trusted",d:4,cat:"📰 Society"},
  {label:"Globalization has hurt more people than it has helped",d:4,cat:"🌍 Economics"},
  {label:"Governments should tax the wealthy far more",d:4,cat:"💸 Economics"},
  {label:"The tech industry has too much power over society",d:4,cat:"📱 Politics"},
  {label:"Immigration is a net positive for any country",d:4,cat:"🌍 Politics"},
  {label:"Nationalism is dangerous in the modern world",d:4,cat:"🌍 Politics"},
  {label:"The US should take military action against Iran",d:5,cat:"⚔️ Geopolitics"},
  {label:"China will surpass the US as the world's superpower",d:5,cat:"⚔️ Geopolitics"},
  {label:"Nuclear energy is the only real path to net zero",d:5,cat:"⚔️ Science"},
  {label:"Western sanctions on Russia have failed",d:5,cat:"⚔️ Geopolitics"},
  {label:"AI poses an existential threat to humanity",d:5,cat:"🤖 AI"},
  {label:"The West should stop sending weapons to Ukraine",d:5,cat:"⚔️ Geopolitics"},
  {label:"Free will does not exist",d:5,cat:"🧠 Philosophy"},
  {label:"Morality is relative — nothing is truly right or wrong",d:5,cat:"🧠 Philosophy"},
  {label:"A world government is the only way to solve global problems",d:5,cat:"⚔️ Geopolitics"},
  {label:"Democracy will not survive the age of AI",d:5,cat:"🤖 Geopolitics"},
];
const DC={1:"#4ade80",2:"#a3e635",3:"#c9a84c",4:"#fb923c",5:"#f87171"};
const DL={1:"Easy",2:"Medium",3:"Hard",4:"Expert",5:"Master"};
const FALLACIES=[
  {name:"Ad Hominem",pat:/you (don't|cant|wouldn't|never)|your kind|people like you/i},
  {name:"Straw Man",pat:/so you('re| are) saying|you think everyone|that means you believe/i},
  {name:"False Dichotomy",pat:/either.+or|only two|no other (option|choice|way)/i},
  {name:"Slippery Slope",pat:/next (thing|you know)|leads to|end up with|inevitably/i},
  {name:"Appeal to Emotion",pat:/think of the (children|future|people)|imagine if your/i},
];
const TRAITS=[
  {id:"sarcastic",label:"Sarcastic",desc:"Uses dry, cutting humor"},
  {id:"questioning",label:"Questions back",desc:"Responds with questions"},
  {id:"data-driven",label:"Uses data",desc:"Cites stats & studies"},
  {id:"empathetic",label:"Empathetic",desc:"Acknowledges your feelings first"},
  {id:"contrarian",label:"Contrarian",desc:"Disagrees with everything"},
  {id:"detailed",label:"Very detailed",desc:"Gives long, thorough responses"},
];
const INTENSITY={
  civil:{label:"🤝 Respectful",prompt:"Be respectful and measured. Acknowledge good points while firmly defending your position."},
  sharp:{label:"⚡ Sharp",prompt:"Be confident and incisive. Push back hard on weak arguments. Do not concede easily."},
  ruthless:{label:"🔥 Ruthless",prompt:"Be relentless. Find every flaw. Be blunt and unyielding. Do not soften your rebuttals."},
};

const getLevel=r=>LEVELS.find(l=>r>=l.min&&r<l.max)||LEVELS[LEVELS.length-1];
const getMaxDiff=r=>r<400?2:r<900?3:r<2500?4:5;
const loadSt=()=>{try{const s=localStorage.getItem("da_v4");return s?JSON.parse(s):null;}catch{return null;}};
const saveSt=s=>{try{localStorage.setItem("da_v4",JSON.stringify(s));}catch{}};

function pickTopics(rating,exclude=[]){
  const max=getMaxDiff(rating),sh=a=>[...a].sort(()=>Math.random()-.5);
  const full=ALL_TOPICS.filter(t=>t.d<=max);
  const pool=full.filter(t=>!exclude.includes(t.label));
  const src=pool.length>=8?pool:full;
  const byCat={};
  src.forEach(t=>{byCat[t.cat]=byCat[t.cat]||[];byCat[t.cat].push(t);});
  const cats=sh(Object.keys(byCat));
  const pick=[];
  for(const c of cats){if(pick.length>=4)break;pick.push(sh(byCat[c])[0]);}
  const used=new Set(pick.map(t=>t.label));
  const rem=sh(src.filter(t=>!used.has(t.label)));
  while(pick.length<4&&rem.length)pick.push(rem.shift());
  return sh(pick).slice(0,4);
}

function PulsingOrb(){
  return <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#1a1a24",border:BDR,borderRadius:"14px 14px 14px 4px",width:"fit-content"}}>
    <div style={{position:"relative",width:18,height:18}}>
      <div style={{position:"absolute",inset:0,borderRadius:"50%",background:G,animation:"pR 1.4s ease-out infinite"}}/>
      <div style={{position:"absolute",inset:5,borderRadius:"50%",background:G,animation:"pC 1.4s ease-in-out infinite"}}/>
    </div>
    <span style={{fontSize:14,color:"#9a9690",fontFamily:"sans-serif"}}>Thinking…</span>
  </div>;
}

function LevelUpModal({level,onClose}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
    <div style={{background:"#13131a",border:`2px solid ${level.color}`,borderRadius:24,padding:"3rem 2.5rem",textAlign:"center",maxWidth:340}}>
      <div style={{fontSize:60,marginBottom:12}}>{level.icon}</div>
      <div style={{fontSize:11,letterSpacing:".2em",textTransform:"uppercase",color:level.color,fontFamily:"sans-serif",marginBottom:8}}>Level Up!</div>
      <div style={{fontSize:26,fontWeight:900,color:"#e8e4dc",marginBottom:8}}>{level.name}</div>
      <div style={{fontSize:14,color:"#9a9690",fontFamily:"sans-serif"}}>Unlocked: <span style={{color:level.color}}>{level.unlock}</span></div>
      <button onClick={onClose} style={{marginTop:20,padding:"11px 28px",background:level.color,color:"#0a0a0f",border:"none",borderRadius:10,fontSize:14,fontWeight:700,fontFamily:"sans-serif",cursor:"pointer"}}>Keep Going</button>
    </div>
  </div>;
}

export default function App(){
  const saved=loadSt();
  const [rating,setRating]=useState(saved?.rating??0);
  const [prevRating,setPrev]=useState(null);
  const [trophies,setTrophies]=useState(saved?.trophies??[]);
  const [topics,setTopics]=useState(()=>pickTopics(saved?.rating??0));
  const [stage,setStage]=useState("setup");
  const [topic,setTopic]=useState("");
  const [custom,setCustom]=useState("");
  const [side,setSide]=useState("");
  const [intensity,setIntensity]=useState("sharp");
  const [traits,setTraits]=useState([]);
  const [showTraits,setShowTraits]=useState(false);
  const [showStats,setShowStats]=useState(false);
  const [msgs,setMsgs]=useState([]);
  const [hist,setHist]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [round,setRound]=useState(1);
  const [scores,setScores]=useState([]);
  const [fallacies,setFallacies]=useState({});
  const [summary,setSummary]=useState("");
  const [sumLoading,setSumLoading]=useState(false);
  const [lvlModal,setLvlModal]=useState(null);
  const chatRef=useRef(null);

  const act=custom.trim()||topic;
  const level=getLevel(rating);
  const nxt=LEVELS[LEVELS.indexOf(level)+1];
  const pct=nxt?((rating-level.min)/(nxt.min-level.min))*100:100;
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
  const delta=prevRating!==null?rating-prevRating:null;
  const sc=s=>s>=8?"#4ade80":s>=6?G:s>=4?"#fb923c":"#f87171";
  const sl=s=>s>=8?"Strong":s>=6?"Solid":s>=4?"Weak":"Poor";

  useEffect(()=>{saveSt({rating,trophies});},[rating,trophies]);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs,loading,summary]);

  const refresh=()=>{setTopics(pickTopics(rating,topics.map(t=>t.label)));setTopic("");setCustom("");};
  const toggleTrait=id=>setTraits(t=>t.includes(id)?t.filter(x=>x!==id):[...t,id]);
  const buildSys=()=>{
    const cs=side==="for"?"against":"for";
    const td=traits.map(id=>TRAITS.find(t=>t.id===id)?.desc).filter(Boolean).join(". ");
    return `You are a fierce debate opponent. Topic: "${act}". You argue ${cs==="for"?"in favor of":"against"} this. The user argues ${side==="for"?"in favor of":"against"} it.\n${INTENSITY[intensity].prompt}${td?" Style: "+td+".":""}\nRules: Never break character. Never fully concede. 2-4 punchy sentences. No bullet points.`;
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
    setStage("debate");setMsgs([]);setHist([]);setRound(1);setScores([]);setFallacies({});setSummary("");setPrev(null);setLoading(true);
    try{
      const o=await callClaude([{role:"user",content:"Open with your strongest single argument. Be sharp."}],buildSys());
      setHist([{role:"assistant",content:o}]);setMsgs([{role:"claude",text:o}]);
    }catch(e){setMsgs([{role:"claude",text:"Error: "+e.message}]);}
    setLoading(false);
  };
  const send=async()=>{
    if(!input.trim()||loading)return;
    const txt=input.trim();setInput("");
    const idx=msgs.length;
    setMsgs(m=>[...m,{role:"user",text:txt}]);
    detectF(txt,idx);
    const newH=[...hist,{role:"user",content:txt}];
    setHist(newH);setRound(r=>r+1);setLoading(true);
    const[s,reply]=await Promise.all([grade(txt),callClaude(newH,buildSys()).catch(e=>"Error: "+e.message)]);
    setScores(x=>[...x,s]);
    setHist([...newH,{role:"assistant",content:reply}]);
    setMsgs(m=>[...m,{role:"claude",text:reply,score:s}]);
    setLoading(false);
  };
  const endDebate=async()=>{
    if(sumLoading||summary)return;
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
    body{background:#0a0a0f}
    @keyframes pR{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.8);opacity:0}}
    @keyframes pC{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
    @keyframes fIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .mi{animation:fIn .3s ease forwards}
    .hov:hover{opacity:.88;transform:scale(1.01);transition:all .15s;cursor:pointer}
    .bhov:hover{filter:brightness(1.12)}
    input:focus,textarea:focus{outline:none;border-color:#c9a84c!important}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:#2a2a35;border-radius:2px}
  `;

  if(stage==="setup")return(
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e8e4dc",fontFamily:"Georgia,serif",display:"flex",flexDirection:"column"}}>
      <style>{CSS}</style>
      {lvlModal&&<LevelUpModal level={lvlModal} onClose={()=>setLvlModal(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 32px",borderBottom:BDR,flexShrink:0}}>
        <span style={{fontSize:"1.6rem",fontWeight:900,letterSpacing:"-1px"}}>DEBATE <span style={{color:G}}>ARENA</span></span>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>{level.icon}</span>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:level.color,fontFamily:"sans-serif"}}>{level.name}</div>
              <div style={{fontSize:12,color:"#9a9690",fontFamily:"sans-serif"}}>{rating} pts{delta!==null&&<span style={{color:delta>=0?"#4ade80":"#f87171",marginLeft:5}}>{delta>=0?"+":""}{delta}</span>}</div>
            </div>
          </div>
          <div style={{width:90}}>
            <div style={{height:4,background:"#1a1a24",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:level.color,transition:"width 1s ease"}}/></div>
            {nxt&&<div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif",marginTop:2}}>{nxt.min-rating} to {nxt.name}</div>}
          </div>
          <button onClick={()=>setShowStats(s=>!s)} style={{background:"none",border:BDR,borderRadius:7,padding:"7px 13px",fontSize:13,color:"#9a9690",fontFamily:"sans-serif",cursor:"pointer"}}>{showStats?"▾ Hide Stats":"▸ My Stats"}</button>
        </div>
      </div>
      {showStats&&<div style={{background:"#0d0d14",borderBottom:BDR,padding:"16px 32px",display:"flex",gap:32}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:10}}>Recent Debates</div>
          {trophies.length===0&&<p style={{fontSize:13,color:"#6b6860",fontFamily:"sans-serif"}}>No debates yet.</p>}
          {trophies.slice(0,4).map((t,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<3?"1px solid #1a1a24":"none"}}>
              <div><div style={{fontSize:13,color:"#c8c4b8",fontFamily:"sans-serif"}}>{t.topic}</div><div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif"}}>{t.date} · {t.rounds} rounds · avg {t.avg}/10</div></div>
              <span style={{fontSize:14,fontWeight:700,color:t.delta>=0?"#4ade80":"#f87171",fontFamily:"sans-serif"}}>{t.delta>=0?"+":""}{t.delta} pts</span>
            </div>
          ))}
        </div>
        <div style={{width:170}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:10}}>Levels</div>
          {LEVELS.map(l=>(
            <div key={l.name} style={{display:"flex",alignItems:"center",gap:7,marginBottom:7,opacity:rating>=l.min?1:.3}}>
              <span style={{fontSize:14}}>{l.icon}</span>
              <div><div style={{fontSize:12,fontWeight:700,color:l.color,fontFamily:"sans-serif"}}>{l.name}</div><div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif"}}>{l.min} pts</div></div>
            </div>
          ))}
        </div>
      </div>}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,padding:"24px 28px",borderRight:BDR,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,fontFamily:"sans-serif"}}>Choose a Topic</span>
            <button onClick={refresh} style={{background:"none",border:BDR,borderRadius:6,padding:"3px 10px",fontSize:15,color:"#9a9690",cursor:"pointer",fontFamily:"sans-serif"}}>↻ Shuffle</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {topics.map(t=>(
              <button key={t.label} className="hov" onClick={()=>{setTopic(t.label);setCustom("");}}
                style={{background:topic===t.label&&!custom?"#1e1c2e":"#0f0f16",border:topic===t.label&&!custom?"1.5px solid #534AB7":BDR,borderRadius:9,padding:"12px 14px",fontSize:14,fontFamily:"sans-serif",color:topic===t.label&&!custom?"#b8b0f0":"#c0bdb8",textAlign:"left",lineHeight:1.45}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:"#5a5850"}}>{t.cat}</span>
                  <span style={{fontSize:11,color:DC[t.d],fontWeight:600}}>{DL[t.d]}</span>
                </div>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{fontSize:12,color:"#6b6860",fontFamily:"sans-serif",marginBottom:6}}>Or type your own:</div>
          <input value={custom} onChange={e=>{setCustom(e.target.value);setTopic("");}} placeholder="Enter any topic…" style={{width:"100%",background:"#0f0f16",border:BDR,borderRadius:8,padding:"11px 13px",fontSize:14,fontFamily:"sans-serif",color:"#e8e4dc",boxSizing:"border-box"}}/>
          <div style={{marginTop:"auto",paddingTop:12,display:"flex",gap:10,flexWrap:"wrap"}}>
            {Object.entries(DL).map(([d,l])=>(
              <div key={d} style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:DC[d],display:"inline-block"}}/>
                <span style={{fontSize:12,color:"#9a9690",fontFamily:"sans-serif"}}>{l}</span>
              </div>
            ))}
            <span style={{fontSize:12,color:"#6b6860",fontFamily:"sans-serif"}}>= difficulty</span>
          </div>
        </div>
        <div style={{flex:1,padding:"24px 28px",borderRight:BDR,display:"flex",flexDirection:"column",gap:22}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:12}}>Your Side</div>
            {[["for","👍","I'm FOR it","You argue in favor — Claude argues against"],["against","👎","I'm AGAINST it","You argue against — Claude argues in favor"]].map(([v,ic,ti,de])=>(
              <div key={v} className="hov" onClick={()=>setSide(v)} style={{background:side===v?"#1e1c2e":"#0f0f16",border:side===v?"1.5px solid #534AB7":BDR,borderRadius:11,padding:"13px 15px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{ic}</span>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:"#e8e4dc",fontFamily:"sans-serif"}}>{ti}</div>
                    <div style={{fontSize:12,color:"#9a9690",fontFamily:"sans-serif",marginTop:2}}>{de}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,fontFamily:"sans-serif",marginBottom:10}}>Debate Style</div>
            {Object.entries(INTENSITY).map(([k,{label}])=>(
              <button key={k} className="hov" onClick={()=>setIntensity(k)} style={{background:intensity===k?"#1a1208":"#0f0f16",border:intensity===k?`1.5px solid ${G}`:BDR,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"sans-serif",color:intensity===k?G:"#c0bdb8",textAlign:"left",width:"100%",marginBottom:6}}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{flex:1,padding:"24px 28px",display:"flex",flexDirection:"column"}}>
          <button onClick={()=>setShowTraits(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",color:G,fontSize:11,fontFamily:"sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",padding:0,display:"flex",alignItems:"center",gap:5,marginBottom:12}}>{showTraits?"▾":"▸"} Customize Claude's Style</button>
          {showTraits&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {TRAITS.map(t=>(
              <button key={t.id} className="hov" onClick={()=>toggleTrait(t.id)} style={{background:traits.includes(t.id)?"#1a1208":"#0f0f16",border:traits.includes(t.id)?`1.5px solid ${G}`:BDR,borderRadius:8,padding:"10px 11px",textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:traits.includes(t.id)?G:"#c8c4b8",fontFamily:"sans-serif",marginBottom:2}}>{t.label}</div>
                <div style={{fontSize:11,color:"#9a9690",fontFamily:"sans-serif"}}>{t.desc}</div>
              </button>
            ))}
          </div>}
          <div style={{background:"#0f0f16",border:BDR,borderRadius:11,padding:"14px 15px",marginTop:"auto",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:"sans-serif",marginBottom:10,textTransform:"uppercase",letterSpacing:".1em"}}>How Scoring Works</div>
            {[["🟢","Strong (8-10)","#4ade80","Most points gained"],["🟡","Solid (6-7)","#c9a84c","Some points gained"],["🟠","Weak (4-5)","#fb923c","Break even"],["🔴","Poor (1-3)","#f87171","Points lost"]].map(([dot,label,col,explain])=>(
              <div key={label} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:7}}>
                <span style={{fontSize:13,flexShrink:0}}>{dot}</span>
                <div>
                  <span style={{fontSize:13,color:col,fontFamily:"sans-serif",fontWeight:600}}>{label} </span>
                  <span style={{fontSize:13,color:"#c0bdb8",fontFamily:"sans-serif"}}>{explain}</span>
                </div>
              </div>
            ))}
          </div>
          <button disabled={!act||!side} className={act&&side?"bhov":""} onClick={startDebate} style={{width:"100%",padding:"15px",background:act&&side?G:"#1a1a24",color:act&&side?"#0a0a0f":"#444",border:"none",borderRadius:11,fontSize:16,fontWeight:700,fontFamily:"sans-serif",letterSpacing:".05em",cursor:act&&side?"pointer":"not-allowed",transition:"all .2s"}}>
            {act&&side?"⚔️  ENTER THE ARENA":"Select a topic & side first"}
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{height:"100vh",background:"#0a0a0f",color:"#e8e4dc",fontFamily:"Georgia,serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{CSS}</style>
      {lvlModal&&<LevelUpModal level={lvlModal} onClose={()=>setLvlModal(null)}/>}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 24px",borderBottom:BDR,flexShrink:0}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:700,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{act}"</div>
          <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"sans-serif",background:"#0d1f17",color:"#4ade80",border:"1px solid #1a3d2b"}}>YOU: {side==="for"?"FOR":"AGAINST"}</span>
            <span style={{fontSize:12,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"sans-serif",background:"#1e1c2e",color:"#a89eed",border:"1px solid #3d3680"}}>CLAUDE: {side==="for"?"AGAINST":"FOR"}</span>
            {traits.map(id=><span key={id} style={{fontSize:11,padding:"2px 9px",borderRadius:20,fontFamily:"sans-serif",background:"#1a1208",color:G,border:"1px solid #3d2e10"}}>{TRAITS.find(t=>t.id===id)?.label}</span>)}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0,marginLeft:14}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".07em"}}>Round</div><div style={{fontSize:19,fontWeight:700,fontFamily:"sans-serif"}}>{round}</div></div>
          {avg!==null&&<div style={{textAlign:"center"}}><div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".07em"}}>Avg</div><div style={{fontSize:19,fontWeight:700,color:sc(avg),fontFamily:"sans-serif"}}>{avg}<span style={{fontSize:11,color:"#3a3a45"}}>/10</span></div></div>}
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:15}}>{level.icon}</span><div><div style={{fontSize:12,fontWeight:700,color:level.color,fontFamily:"sans-serif"}}>{level.name}</div><div style={{fontSize:11,color:"#6b6860",fontFamily:"sans-serif"}}>{rating} pts</div></div></div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={endDebate} disabled={sumLoading||!!summary} style={{fontSize:13,color:sumLoading||summary?"#3a3a45":"#f87171",background:"none",border:"1px solid",borderColor:sumLoading||summary?"#2a2a35":"#3a1a1a",borderRadius:7,padding:"6px 11px",cursor:sumLoading||summary?"not-allowed":"pointer",fontFamily:"sans-serif",whiteSpace:"nowrap"}}>{sumLoading?"Generating…":"⏹ End & Summarize"}</button>
            <button onClick={()=>setStage("setup")} style={{fontSize:13,color:G,background:"none",border:`1px solid #3d2e10`,borderRadius:7,padding:"6px 11px",cursor:"pointer",fontFamily:"sans-serif"}}>↩ New</button>
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"18px 24px",display:"flex",flexDirection:"column",gap:11}}>
            {msgs.map((m,i)=>(
              <div key={i} className="mi" style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"72%"}}>
                <div style={{fontSize:11,color:"#6b6860",marginBottom:4,fontFamily:"sans-serif",letterSpacing:".06em",textTransform:"uppercase",textAlign:m.role==="user"?"right":"left"}}>{m.role==="user"?"You":"Claude"}</div>
                <div style={{padding:"11px 14px",borderRadius:m.role==="user"?"14px 14px 3px 14px":"14px 14px 14px 3px",fontSize:15,lineHeight:1.65,background:m.role==="user"?G:"#1a1a24",color:m.role==="user"?"#0a0a0f":"#d4d0c8",border:m.role==="user"?"none":BDR}}>{m.text}</div>
                {m.role==="user"&&m.score!=null&&<div style={{display:"flex",alignItems:"center",gap:7,marginTop:5}}><div style={{width:`${(m.score/10)*70}px`,height:3,background:sc(m.score),borderRadius:2,transition:"width .6s ease"}}/><span style={{fontSize:13,color:sc(m.score),fontFamily:"sans-serif",fontWeight:600}}>{sl(m.score)} ({m.score}/10)</span></div>}
                {m.role==="user"&&fallacies[i]&&<div style={{marginTop:4,display:"flex",gap:5,flexWrap:"wrap"}}>{fallacies[i].map(f=><span key={f} style={{fontSize:12,padding:"2px 9px",background:"#2d1515",border:"1px solid #7f1d1d",borderRadius:20,color:"#f87171",fontFamily:"sans-serif"}}>⚠️ {f}</span>)}</div>}
              </div>
            ))}
            {loading&&<div className="mi" style={{display:"flex",flexDirection:"column",alignItems:"flex-start",alignSelf:"flex-start"}}><div style={{fontSize:11,color:"#6b6860",marginBottom:4,fontFamily:"sans-serif",letterSpacing:".06em",textTransform:"uppercase"}}>Claude</div><PulsingOrb/></div>}
            {summary&&<div className="mi" style={{background:"#0e0e1a",border:"1px solid #2a2a55",borderRadius:13,padding:"17px 20px",marginTop:4}}>
              <div style={{fontSize:12,fontWeight:700,color:"#a89eed",marginBottom:8,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"sans-serif"}}>📋 Debate Summary & Coaching</div>
              <p style={{fontSize:14,color:"#c8c4b8",lineHeight:1.75,margin:"0 0 12px"}}>{summary}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:13,color:"#9a9690",fontFamily:"sans-serif"}}>Avg: <span style={{color:sc(avg),fontWeight:700}}>{avg}/10</span>{delta!==null&&<span style={{marginLeft:7,color:delta>=0?"#4ade80":"#f87171",fontWeight:700}}>{delta>=0?"+":""}{delta} pts</span>}</span>
                <button onClick={()=>setStage("setup")} style={{padding:"7px 16px",background:G,color:"#0a0a0f",border:"none",borderRadius:8,fontSize:13,fontWeight:700,fontFamily:"sans-serif",cursor:"pointer"}}>New Debate</button>
              </div>
            </div>}
          </div>
          {!summary&&<div style={{padding:"12px 24px",borderTop:BDR,display:"flex",gap:10,flexShrink:0}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Make your argument… (Enter to send)" style={{flex:1,resize:"none",height:46,padding:"11px 13px",fontSize:14,fontFamily:"sans-serif",background:"#0f0f16",border:BDR,borderRadius:9,color:"#e8e4dc",lineHeight:1.4}}/>
            <button disabled={loading||!input.trim()} onClick={send} style={{padding:"0 22px",background:loading||!input.trim()?"#1a1a24":G,color:loading||!input.trim()?"#444":"#0a0a0f",border:"none",borderRadius:9,fontSize:14,fontWeight:700,fontFamily:"sans-serif",cursor:loading||!input.trim()?"not-allowed":"pointer",flexShrink:0}}>Send</button>
          </div>}
        </div>
        <div style={{width:220,borderLeft:BDR,padding:"16px 14px",display:"flex",flexDirection:"column",gap:16,flexShrink:0,overflowY:"auto"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:9}}>Argument Score</div>
            {[["🟢","Strong","8-10","#4ade80"],["🟡","Solid","6-7","#c9a84c"],["🟠","Weak","4-5","#fb923c"],["🔴","Poor","1-3","#f87171"]].map(([dot,l,r,col])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontFamily:"sans-serif",color:"#c8c4b8"}}>{dot} {l}</span>
                <span style={{fontSize:13,color:col,fontFamily:"sans-serif",fontWeight:600}}>{r}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:7}}>Fallacy Flags</div>
            <div style={{fontSize:13,color:"#c0bdb8",fontFamily:"sans-serif",lineHeight:1.6}}>If you make a logical mistake, a <span style={{color:"#f87171"}}>⚠️ red tag</span> appears under your message.</div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:7}}>Tips</div>
            {["Use real examples","Stay on topic","Address Claude's point directly","Avoid emotional language"].map(tip=>(
              <div key={tip} style={{fontSize:13,color:"#c0bdb8",fontFamily:"sans-serif",marginBottom:6,paddingLeft:8,borderLeft:"2px solid #534AB7"}}>{tip}</div>
            ))}
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:G,fontFamily:"sans-serif",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>Your Level</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}><span style={{fontSize:17}}>{level.icon}</span><span style={{fontSize:13,fontWeight:700,color:level.color,fontFamily:"sans-serif"}}>{level.name}</span></div>
            <div style={{height:4,background:"#1a1a24",borderRadius:2,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${pct}%`,background:level.color,transition:"width 1s ease"}}/></div>
            {nxt&&<div style={{fontSize:12,color:"#9a9690",fontFamily:"sans-serif"}}>{nxt.min-rating} pts to {nxt.name}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
