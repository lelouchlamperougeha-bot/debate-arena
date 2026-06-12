import { useState, useRef, useEffect } from "react";

const G = "#c9a84c";
const BDR = "1px solid #1e1e2e";

const LEVEL_TIME = { "Novice":120,"Debater":100,"Rhetorician":80,"Sophist":60,"Orator":45,"Philosopher King":30 };
const LEVEL_HINTS = { "Novice":3,"Debater":2,"Rhetorician":1,"Sophist":1,"Orator":0,"Philosopher King":0 };
const MIN_WORDS = 20;

async function callClaude(messages, system) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 400, system, messages }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
      return d.content?.[0]?.text || '';
    } catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 1000 * (i + 1))); }
  }
}

const LEVELS = [
  { name:"Novice",min:0,max:400,icon:"⚔️",color:"#b0b0b0",unlock:"Basic topics" },
  { name:"Debater",min:400,max:900,icon:"🗡️",color:"#6abf69",unlock:"Political topics" },
  { name:"Rhetorician",min:900,max:1600,icon:"🔥",color:"#4fc3f7",unlock:"Hard topics" },
  { name:"Sophist",min:1600,max:2500,icon:"⚡",color:"#ce93d8",unlock:"Custom traits" },
  { name:"Orator",min:2500,max:3600,icon:"🏛️",color:"#ffb74d",unlock:"Expert topics" },
  { name:"Philosopher King",min:3600,max:Infinity,icon:"👑",color:"#c9a84c",unlock:"All topics" },
];

const ALL_TOPICS = [
  { label:"Pineapple belongs on pizza",d:1,cat:"🍕 Food" },
  { label:"Cats are better pets than dogs",d:1,cat:"🐾 Pets" },
  { label:"Morning people have a better life than night owls",d:1,cat:"🌅 Lifestyle" },
  { label:"Video games are a waste of time",d:1,cat:"🎮 Gaming" },
  { label:"Paper books are better than e-books",d:1,cat:"📖 Culture" },
  { label:"Going to the gym is overrated",d:1,cat:"💪 Health" },
  { label:"Fast food should be taxed like cigarettes",d:1,cat:"🍔 Health" },
  { label:"Cold weather is better than hot weather",d:1,cat:"🌦️ Lifestyle" },
  { label:"Social media makes people lonelier",d:1,cat:"📱 Social Media" },
  { label:"Streaming services have ruined cinema",d:1,cat:"🎬 Entertainment" },
  { label:"Smartphones have made us less smart",d:1,cat:"📱 Technology" },
  { label:"Coffee is better than tea",d:1,cat:"☕ Food" },
  { label:"Online friendships are just as real as offline ones",d:1,cat:"👥 Relationships" },
  { label:"Breakfast is the most important meal of the day",d:1,cat:"🍳 Health" },
  { label:"Tattoos in the workplace should be fully accepted",d:1,cat:"💼 Work" },
  { label:"Napping during the workday should be encouraged",d:1,cat:"💤 Work" },
  { label:"Tourism does more harm than good",d:1,cat:"✈️ Travel" },
  { label:"People are too dependent on technology",d:1,cat:"📱 Technology" },
  { label:"Art degrees are a waste of money",d:2,cat:"🎓 Education" },
  { label:"Zoos should be shut down",d:2,cat:"🦁 Ethics" },
  { label:"Competitive sports do more harm than good for kids",d:2,cat:"⚽ Sports" },
  { label:"Celebrity culture is toxic",d:2,cat:"🌟 Celebrity" },
  { label:"School uniforms should be mandatory everywhere",d:2,cat:"🎓 Education" },
  { label:"Homework should be abolished",d:2,cat:"🎓 Education" },
  { label:"Violent video games make people more violent",d:2,cat:"🎮 Gaming" },
  { label:"Zuckerberg has made the world worse",d:2,cat:"💻 Technology" },
  { label:"Public transport should be free for everyone",d:2,cat:"🚌 Transport" },
  { label:"Influencers deserve to earn more than teachers",d:2,cat:"💰 Economy" },
  { label:"Alcohol is more dangerous than marijuana",d:2,cat:"🍺 Health" },
  { label:"Owning a car in a city is irresponsible",d:2,cat:"🚗 Environment" },
  { label:"Parents should not post photos of their kids online",d:2,cat:"👶 Parenting" },
  { label:"The minimum wage should be doubled",d:2,cat:"💸 Economy" },
  { label:"College is no longer worth the cost",d:2,cat:"🎓 Education" },
  { label:"Cancel culture has gone too far",d:2,cat:"📢 Society" },
  { label:"The news makes people more anxious and less informed",d:2,cat:"📰 Media" },
  { label:"Bottled water should be banned",d:2,cat:"🌍 Environment" },
  { label:"Working more than 40 hours a week is self-destructive",d:2,cat:"💼 Work" },
  { label:"AI will eliminate more jobs than it creates",d:3,cat:"🤖 AI" },
  { label:"Crypto is a scam",d:3,cat:"💸 Finance" },
  { label:"Universal basic income should be implemented globally",d:3,cat:"💸 Economy" },
  { label:"Meat-eating is ethically wrong",d:3,cat:"🥩 Ethics" },
  { label:"Space exploration is a waste of money",d:3,cat:"🚀 Science" },
  { label:"TikTok should be permanently banned",d:3,cat:"📱 Technology" },
  { label:"The death penalty should be abolished everywhere",d:3,cat:"⚖️ Law" },
  { label:"Prisons should focus on fixing people, not punishment",d:3,cat:"⚖️ Law" },
  { label:"Billionaires should not be allowed to exist",d:3,cat:"💸 Economy" },
  { label:"Religion does more harm than good",d:3,cat:"⛪ Religion" },
  { label:"The four-day work week should be the global standard",d:3,cat:"💼 Work" },
  { label:"Recreational drugs should be decriminalized",d:3,cat:"⚖️ Law" },
  { label:"Online privacy is more important than national security",d:3,cat:"🔐 Technology" },
  { label:"Assisted dying should be legal everywhere",d:3,cat:"⚖️ Ethics" },
  { label:"The gig economy exploits workers",d:3,cat:"💼 Economy" },
  { label:"Electric cars are not actually better for the environment",d:3,cat:"🌍 Environment" },
  { label:"Animal testing should be completely banned",d:3,cat:"🐭 Ethics" },
  { label:"The war on drugs has been a total failure",d:3,cat:"⚖️ Law" },
  { label:"Elon Musk has done more harm than good",d:4,cat:"🌍 Politics" },
  { label:"The EU is becoming irrelevant",d:4,cat:"🌍 Politics" },
  { label:"Democracy is overrated as a system of government",d:4,cat:"🌍 Politics" },
  { label:"The US two-party system is broken beyond repair",d:4,cat:"🌍 Politics" },
  { label:"Capitalism is the root cause of climate change",d:4,cat:"🌍 Economy" },
  { label:"Open borders would make the world better",d:4,cat:"🌍 Politics" },
  { label:"Mainstream media can no longer be trusted",d:4,cat:"📰 Media" },
  { label:"Globalization has hurt more people than it has helped",d:4,cat:"🌍 Economy" },
  { label:"Governments should tax the wealthy far more",d:4,cat:"💸 Economy" },
  { label:"The tech industry has too much power over society",d:4,cat:"💻 Technology" },
  { label:"Immigration is a net positive for any country",d:4,cat:"🌍 Politics" },
  { label:"Nationalism is dangerous in the modern world",d:4,cat:"🌍 Politics" },
  { label:"The US should take military action against Iran",d:5,cat:"⚔️ Geopolitics" },
  { label:"China will surpass the US as the world's superpower",d:5,cat:"⚔️ Geopolitics" },
  { label:"Nuclear energy is the only real path to net zero",d:5,cat:"⚔️ Science" },
  { label:"Western sanctions on Russia have failed",d:5,cat:"⚔️ Geopolitics" },
  { label:"AI poses an existential threat to humanity",d:5,cat:"🤖 AI" },
  { label:"The West should stop sending weapons to Ukraine",d:5,cat:"⚔️ Geopolitics" },
  { label:"Free will does not exist",d:5,cat:"🧠 Philosophy" },
  { label:"Morality is relative — nothing is truly right or wrong",d:5,cat:"🧠 Philosophy" },
  { label:"A world government is the only way to solve global problems",d:5,cat:"⚔️ Geopolitics" },
  { label:"Democracy will not survive the age of AI",d:5,cat:"🤖 AI" },
];

const DC = {1:"#4ade80",2:"#a3e635",3:"#c9a84c",4:"#fb923c",5:"#f87171"};
const DL = {1:"Easy",2:"Medium",3:"Hard",4:"Expert",5:"Master"};
const FALLACIES = [
  { name:"Ad Hominem",pat:/you (don't|cant|wouldn't|never)|your kind|people like you/i },
  { name:"Straw Man",pat:/so you('re| are) saying|you think everyone|that means you believe/i },
  { name:"False Dichotomy",pat:/either.+or|only two|no other (option|choice|way)/i },
  { name:"Slippery Slope",pat:/next (thing|you know)|leads to|end up with|inevitably/i },
  { name:"Appeal to Emotion",pat:/think of the (children|future|people)|imagine if your/i },
];
const TRAITS = [
  { id:"sarcastic",label:"Sarcastic",desc:"Dry, cutting humor" },
  { id:"questioning",label:"Questions back",desc:"Responds with questions" },
  { id:"data-driven",label:"Uses data",desc:"Cites stats & studies" },
  { id:"empathetic",label:"Empathetic",desc:"Acknowledges feelings first" },
  { id:"contrarian",label:"Contrarian",desc:"Disagrees with everything" },
  { id:"detailed",label:"Very detailed",desc:"Long, thorough responses" },
];
const INTENSITY = {
  civil: { label:"😇 Respectful",desc:"Measured and fair",prompt:"Be respectful and measured. Acknowledge good points while firmly defending your position.",timeout:"The user ran out of time. Respond graciously and respectfully, gently noting they didn't get an argument in, and restate your position politely.",coach:"respectful, encouraging, and constructive" },
  sharp: { label:"⚔️ Sharp",desc:"Confident, no mercy",prompt:"Be confident and incisive. Push back hard on weak arguments. Do not concede easily.",timeout:"The user ran out of time. Note their silence with confident superiority and press your advantage.",coach:"sharp, direct, and pointed but fair" },
  ruthless: { label:"😈 Ruthless",desc:"Brutal and relentless",prompt:"Be relentless. Find every flaw. Be blunt and unyielding. Do not soften your rebuttals.",timeout:"The user ran out of time. Mock them mercilessly for failing to respond in time, then drive your point home brutally.",coach:"brutal, cutting, and merciless (but still genuinely useful)" },
};

const QUOTES = [
  { t: "The aim of argument should be progress, not victory.", a: "Karl Popper" },
  { t: "It is the mark of an educated mind to entertain a thought without accepting it.", a: "Aristotle" },
  { t: "He who knows only his own side of the case knows little of it.", a: "John Stuart Mill" },
  { t: "I may not agree with you, but I will defend to the death your right to make an ass of yourself.", a: "Oscar Wilde" },
  { t: "Whenever you find yourself on the side of the majority, it is time to pause and reflect.", a: "Mark Twain" },
  { t: "The first principle is that you must not fool yourself, and you are the easiest person to fool.", a: "Richard Feynman" },
  { t: "If you can't explain it simply, you don't understand it well enough.", a: "Albert Einstein" },
  { t: "Argument is meant to reveal the truth, not to create it.", a: "Edward de Bono" },
  { t: "Those who cannot change their minds cannot change anything.", a: "George Bernard Shaw" },
  { t: "When the debate is lost, slander becomes the tool of the loser.", a: "Socrates" },
  { t: "Doubt is not a pleasant condition, but certainty is absurd.", a: "Voltaire" },
  { t: "The truth is rarely pure and never simple.", a: "Oscar Wilde" },
  { t: "Honest disagreement is often a good sign of progress.", a: "Mahatma Gandhi" },
  { t: "A wise man proportions his belief to the evidence.", a: "David Hume" },
  { t: "To argue with a person who has renounced reason is like giving medicine to the dead.", a: "Thomas Paine" },
];

const getLevel = r => LEVELS.find(l => r >= l.min && r < l.max) || LEVELS[LEVELS.length - 1];
const getMaxDiff = r => r < 400 ? 2 : r < 900 ? 3 : r < 2500 ? 4 : 5;
const loadSt = () => { try { const s = localStorage.getItem("da_v4"); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveSt = s => { try { localStorage.setItem("da_v4", JSON.stringify(s)); } catch {} };

function pickTopics(rating, exclude = []) {
  const max = getMaxDiff(rating), sh = a => [...a].sort(() => Math.random() - 0.5);
  const full = ALL_TOPICS.filter(t => t.d <= max);
  const pool = full.filter(t => !exclude.includes(t.label));
  const src = pool.length >= 8 ? pool : full;
  const pick = [], usedCats = new Set();
  for (const t of sh(src)) {
    if (pick.length >= 4) break;
    const base = t.cat.split(" ").slice(1).join(" ");
    if (!usedCats.has(base)) { pick.push(t); usedCats.add(base); }
  }
  const used = new Set(pick.map(t => t.label));
  const rem = sh(src.filter(t => !used.has(t.label)));
  while (pick.length < 4 && rem.length) pick.push(rem.shift());
  return sh(pick).slice(0, 4);
}

function stripMd(t) {
  return (t || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-•]\s*/gm, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .trim();
}

function PulsingOrb() {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",background:"rgba(20,20,32,0.9)",border:"1px solid #2a2a3e",borderRadius:"18px 18px 18px 4px",width:"fit-content",backdropFilter:"blur(12px)" }}>
      <div style={{ position:"relative",width:20,height:20 }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:G,animation:"pR 1.4s ease-out infinite" }} />
        <div style={{ position:"absolute",inset:5,borderRadius:"50%",background:G,animation:"pC 1.4s ease-in-out infinite" }} />
      </div>
      <span style={{ fontSize:15,color:"#8a8680",fontStyle:"italic" }}>Thinking…</span>
    </div>
  );
}

function LevelUpModal({ level, onClose }) {
  const down = level.deranked;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.94)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,animation:"fadeIn .3s ease" }}>
      <div style={{ background:"linear-gradient(145deg, #13131f, #1a1a2e)",border:`1px solid ${down?"#f8717144":level.color+"44"}`,borderRadius:28,padding:"3.5rem 3rem",textAlign:"center",maxWidth:420,boxShadow:`0 0 80px ${down?"#f8717133":level.color+"33"}` }}>
        <div style={{ fontSize:72,marginBottom:20,filter:down?"grayscale(.5)":"none" }}>{down?"📉":level.icon}</div>
        <div style={{ fontSize:11,letterSpacing:".3em",textTransform:"uppercase",color:down?"#f87171":level.color,marginBottom:12,opacity:.8 }}>{down?"Deranked":"Level Up"}</div>
        <div style={{ fontSize:34,fontWeight:900,color:"#f0ece4",marginBottom:12,letterSpacing:"-1px",fontFamily:"'Playfair Display',serif" }}>{level.name}</div>
        <div style={{ fontSize:16,color:"#6b6860",marginBottom:6 }}>{down ? <>You dropped back to <span style={{color:"#f87171"}}>{level.name}</span>. Win debates to climb again.</> : <>Unlocked: <span style={{ color:level.color }}>{level.unlock}</span></>}</div>
        <button onClick={onClose} style={{ marginTop:28,padding:"14px 40px",background:down?"#f87171":level.color,color:"#0a0a0f",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",letterSpacing:".05em" }}>{down?"I'll be back":"Continue →"}</button>
      </div>
    </div>
  );
}

function Typewriter({ text, onTick }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (onTick) onTick();
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text]);
  return <>{shown}<span style={{ opacity: shown.length < text.length ? 1 : 0, color: "#c9a84c" }}>▍</span></>;
}

function ConfirmModal({ onSave, onDiscard, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,animation:"fadeIn .25s ease" }} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"linear-gradient(145deg, #13131f, #1a1a2e)",border:BDR,borderRadius:20,padding:"32px",maxWidth:420,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>
        <div style={{ fontSize:40,marginBottom:14 }}>⚠️</div>
        <div style={{ fontSize:20,fontWeight:700,color:"#f0ece4",marginBottom:10,fontFamily:"'Playfair Display',serif" }}>Leave this debate?</div>
        <div style={{ fontSize:14,color:"#8a8680",lineHeight:1.6,marginBottom:24 }}>Your debate is in progress. Would you like to save your result before leaving?</div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <button className="bhov" onClick={onSave} style={{ padding:"13px",background:`linear-gradient(135deg,${G},#b8962e)`,color:"#0a0a0f",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer" }}>Save & Leave</button>
          <button className="bhov" onClick={onDiscard} style={{ padding:"13px",background:"rgba(248,113,113,.1)",color:"#f87171",border:"1px solid #3a1a1a",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer" }}>Discard & Leave</button>
          <button onClick={onCancel} style={{ padding:"13px",background:"none",color:"#6b6860",border:"none",borderRadius:10,fontSize:14,cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Circular ring countdown with orbiting spark
function RingTimer({ left, total, idle = false }) {
  const pct = idle ? 1 : Math.max(0, left / total);
  const col = idle ? "#3a3a4e" : pct > 0.5 ? "#4ade80" : pct > 0.25 ? G : "#f87171";
  const urgent = !idle && pct <= 0.25;
  const R = 30, C = 2 * Math.PI * R;
  const angle = pct * 360 - 90;
  const sparkX = 38 + R * Math.cos(angle * Math.PI / 180);
  const sparkY = 38 + R * Math.sin(angle * Math.PI / 180);
  const mins = Math.floor(left / 60), secs = left % 60;
  return (
    <div style={{ position:"relative",width:76,height:76 }}>
      {!idle && <div style={{ position:"absolute",inset:-6,borderRadius:"50%",background:`radial-gradient(circle, ${col}1e 0%, transparent 70%)`,animation:urgent?"hintPulse .6s ease-in-out infinite":"none" }} />}
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={R} fill="none" stroke="#1e1e2e" strokeWidth="5" />
        <circle cx="38" cy="38" r={R} fill="none" stroke={col} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 38 38)"
          style={{ transition:"stroke-dashoffset 1s linear, stroke .5s ease", filter:`drop-shadow(0 0 5px ${col}aa)` }} />
        {!idle && left > 0 && <circle cx={sparkX} cy={sparkY} r="3.5" fill="#fff" style={{ filter:`drop-shadow(0 0 6px ${col})`, transition:"all 1s linear" }} />}
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
        <span style={{ fontSize:idle?15:18,fontWeight:900,color:idle?"#5a5868":col,fontVariantNumeric:"tabular-nums",lineHeight:1,letterSpacing:"-0.5px" }}>
          {idle ? `${total}s` : mins > 0 ? `${mins}:${String(secs).padStart(2,"0")}` : secs}
        </span>
        {!idle && <span style={{ fontSize:8,color:"#5a5868",letterSpacing:".12em",textTransform:"uppercase",marginTop:2 }}>sec</span>}
      </div>
    </div>
  );
}

function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef(null);
  useEffect(() => {
    setLeft(seconds);
    ref.current = setInterval(() => {
      setLeft(s => { if (s <= 1) { clearInterval(ref.current); onExpire(); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [seconds]);
  return <RingTimer left={left} total={seconds} />;
}

function Confetti() {
  const colors = ["#c9a84c", "#4ade80", "#a89eed", "#4fc3f7", "#f0ece4", "#ffb74d"];
  const pieces = Array.from({ length: 90 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 1.8 + Math.random() * 1.6,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 9,
    drift: (Math.random() - 0.5) * 200,
    rot: Math.random() * 720,
  }));
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:400,overflow:"hidden" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position:"absolute", top:"-24px", left:`${p.left}%`,
          width:p.size, height:p.size*0.55, background:p.color, borderRadius:2,
          animation:`confettiFall ${p.dur}s cubic-bezier(.25,.6,.5,1) ${p.delay}s forwards`,
          "--drift":`${p.drift}px`, "--rot":`${p.rot}deg`,
        }} />
      ))}
    </div>
  );
}

function DamageFlash() {
  return (
    <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:400,animation:"damageFlash 1s ease-out forwards",background:"radial-gradient(circle at center, transparent 35%, rgba(248,113,113,0.4) 100%)" }} />
  );
}

function PastDebateModal({ debate, onClose }) {
  if (!debate) return null;
  const G2 = "#c9a84c";
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:350,animation:"fadeIn .25s ease",padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"linear-gradient(160deg,#0e0e1a,#0c0c14)",border:"1px solid #2a2a3e",borderRadius:20,maxWidth:680,width:"100%",maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 70px rgba(0,0,0,.7)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px",borderBottom:"1px solid #1e1e2e",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:18,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif",lineHeight:1.3 }}>"{debate.topic}"</div>
            <div style={{ fontSize:12,color:"#6b6860",marginTop:6 }}>
              {debate.date} · {debate.rounds} rounds · avg {debate.avg}/10
              {debate.delta !== 0 && <span style={{ color:debate.delta>0?"#4ade80":"#f87171",fontWeight:700,marginLeft:8 }}>{debate.delta>0?"+":""}{debate.delta} pts</span>}
              {debate.draw && <span style={{ color:"#4fc3f7",marginLeft:8 }}>🤝 draw</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.05)",border:"1px solid #2a2a3e",borderRadius:8,color:"#9a9690",fontSize:18,cursor:"pointer",padding:"4px 12px",flexShrink:0 }}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          {(debate.msgs || []).map((m, i) => (
            <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"80%" }}>
              <div style={{ fontSize:10,color:"#5a5868",marginBottom:5,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600 }}>{m.role==="user"?"You":"Claude"}</div>
              <div style={{ padding:"13px 16px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",fontSize:15,lineHeight:1.65,background:m.role==="user"?`linear-gradient(135deg,${G2},#b8962e)`:"rgba(20,20,32,0.92)",color:m.role==="user"?"#0a0a0f":"#d4d0c8",border:m.role==="user"?"none":"1px solid #1e1e2e" }}>
                {m.timedOut ? <span style={{ color:"#7a2020",fontStyle:"italic",fontWeight:600 }}>⏱ Time ran out</span> : m.text}
              </div>
              {m.role==="user" && !m.timedOut && m.score != null && (
                <div style={{ fontSize:12,color:m.score>=8?"#4ade80":m.score>=6?G2:m.score>=4?"#fb923c":"#f87171",fontWeight:700,marginTop:4 }}>{m.score}/10{m.offTopic?" · off-topic":""}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const saved = loadSt();
  const [rating, setRating]       = useState(saved?.rating ?? 0);
  const [bonusNext, setBonusNext] = useState(saved?.bonusNext ?? false);
  const [prevRating, setPrev]     = useState(null);
  const [trophies, setTrophies]   = useState(saved?.trophies ?? []);
  const [pinned, setPinned]       = useState(saved?.pinned ?? []);
  const [viewDebate, setViewDebate] = useState(null); // a past debate opened for review
  const [topics, setTopics]       = useState(() => pickTopics(saved?.rating ?? 0));
  const [stage, setStage]         = useState("setup");
  const [debateStarted, setDebateStarted] = useState(false);
  const [topic, setTopic]         = useState("");
  const [custom, setCustom]       = useState("");
  const [side, setSide]           = useState("");
  const [intensity, setIntensity] = useState("sharp");
  const [traits, setTraits]       = useState([]);
  const [showTraits, setShowTraits] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsClosing, setStatsClosing] = useState(false);
  const [msgs, setMsgs]           = useState([]);
  const [hist, setHist]           = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [round, setRound]         = useState(1);
  const [scores, setScores]       = useState([]);
  const [offTopicCount, setOffTopicCount] = useState(0);
  const [inputError, setInputError] = useState("");
  const [fallacies, setFallacies] = useState({});
  const [summary, setSummary]     = useState("");
  const [summaryTip, setSummaryTip] = useState("");
  const [sumLoading, setSumLoading] = useState(false);
  const [lvlModal, setLvlModal]   = useState(null);
  const [timerKey, setTimerKey]   = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeouts, setTimeouts]   = useState(0);
  const [hintsLeft, setHintsLeft] = useState(0);
  const [hint, setHint]           = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [autoLost, setAutoLost]   = useState(false);
  const [drawResult, setDrawResult] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [pendingResult, setPendingResult] = useState(null); // {delta, oldRating, newRating, newLevel, deranked, bonusEarned}
  const [pointsRevealed, setPointsRevealed] = useState(false);
  const [confirmEarlyEnd, setConfirmEarlyEnd] = useState(false);
  const [fxConfetti, setFxConfetti] = useState(false);
  const [fxDamage, setFxDamage] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const chatRef = useRef(null);

  const act   = custom.trim() || topic;
  const level = getLevel(rating);
  const nxt   = LEVELS[LEVELS.indexOf(level) + 1];
  const pct   = nxt ? ((rating - level.min) / (nxt.min - level.min)) * 100 : 100;
  const avg   = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const delta = prevRating !== null ? rating - prevRating : null;
  const sc    = s => s >= 8 ? "#4ade80" : s >= 6 ? G : s >= 4 ? "#fb923c" : "#f87171";
  const sl    = s => s >= 8 ? "Strong" : s >= 6 ? "Solid" : s >= 4 ? "Weak" : "Poor";
  const timeLimit = LEVEL_TIME[level.name] || 60;
  const maxHints = LEVEL_HINTS[level.name] ?? 0;

  useEffect(() => { saveSt({ rating, trophies, bonusNext, pinned }); }, [rating, trophies, bonusNext, pinned]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs, loading, summary]);

  const refresh = () => { setTopics(pickTopics(rating, topics.map(t => t.label))); setTopic(""); setCustom(""); setShuffleKey(k => k + 1); };
  const toggleStats = () => {
    if (showStats) { setStatsClosing(true); setTimeout(() => { setShowStats(false); setStatsClosing(false); }, 540); }
    else setShowStats(true);
  };
  const toggleTrait = id => setTraits(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);

  const buildSys = (timeoutMode = false) => {
    const cs = side === "for" ? "against" : "for";
    const td = traits.map(id => TRAITS.find(t => t.id === id)?.desc).filter(Boolean).join(". ");
    const diff = level.name === "Novice"
      ? "IMPORTANT: Use simple everyday language. Occasionally make a logical mistake or leave a weak point the user could challenge. No jargon."
      : level.name === "Debater" ? "Use clear arguments. Occasionally leave a small logical gap."
      : "Argue sharply and rigorously.";
    let base = `You are a debate opponent. Topic: "${act}". You argue ${cs === "for" ? "in favor of" : "against"} this. The user argues ${side === "for" ? "in favor of" : "against"} it.\n${INTENSITY[intensity].prompt}${td ? " Style: " + td + "." : ""}\n${diff}\nRules: Never break character. Never fully concede. 2-4 sentences only. No bullet points.`;
    // Draw handling — depends on how strong the user's arguments have been
    const strongRound = scores.filter(s => s >= 7).length;
    const avgSoFar = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
    const drawWorthy = scores.length >= 4 && avgSoFar >= 7 && strongRound >= 3;
    if (drawWorthy) {
      base += `\nIf the user proposes a draw, a tie, "agree to disagree", or to call it even, you MAY accept — they have argued well and shown the topic has genuine nuance. If you accept, acknowledge their strong case, concede the topic is more balanced than you first claimed, and begin your reply with the exact token [DRAW] on its own line.`;
    } else {
      base += `\nIf the user proposes a draw, a tie, "agree to disagree", or tries to call it even, REJECT it. Tell them the debate isn't settled and press them to actually defend their position. Do NOT accept a draw.`;
    }
    if (timeoutMode) base += `\n${INTENSITY[intensity].timeout}`;
    return base;
  };

  const detectF = (text, idx) => {
    const found = FALLACIES.filter(f => f.pat.test(text)).map(f => f.name);
    if (found.length) setFallacies(p => ({ ...p, [idx]: found }));
  };

  const grade = async text => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    try {
      const r = await callClaude([{ role: "user", content: `Topic being debated: "${act}".\nThe user argues ${side === "for" ? "in favor of" : "against"} it.\n\nTheir argument:\n"${text}"\n\nReturn ONLY a JSON object, nothing else: {"score": <integer 1-10>, "onTopic": <true|false>}. onTopic is false if the argument ignores the topic, changes the subject, or doesn't actually engage the debate.` }], `Impartial debate judge. Reply with ONLY raw JSON, no markdown. Rubric for score: 1-3 off-topic or no real argument; 4-5 weak or generic; 6-7 solid with reasoning; 8 strong with evidence or examples; 9 excellent — clear logic plus concrete evidence; 10 exceptional. Genuinely strong arguments deserve 9s.`);
      let parsed; try { parsed = JSON.parse(r.replace(/```json|```/g, "").trim()); } catch { parsed = {}; }
      let n = parseInt(parsed.score); if (isNaN(n)) n = 5;
      const onTopic = parsed.onTopic !== false;
      // Slight length reward: long, developed arguments edge up by up to +1
      if (words >= 60) n += 1; else if (words >= 35) n += 0.5;
      // Off-topic penalty
      if (!onTopic) n = Math.min(n, 3) - 1;
      n = Math.min(10, Math.max(1, Math.round(n)));
      return { score: n, onTopic };
    } catch { return { score: 5, onTopic: true }; }
  };

  const getHint = async () => {
    if (hintsLeft <= 0 || hintLoading) return;
    setHintLoading(true);
    try {
      const lastClaude = [...hist].reverse().find(m => m.role === "assistant")?.content || "";
      const h = await callClaude([{ role: "user", content: `I'm debating "${act}", arguing ${side === "for" ? "in favor" : "against"}. Claude just said: "${lastClaude}". Give me 2-3 very short bullet points — each a punchy seed of an argument I could build on. Each bullet under 12 words. Output ONLY the bullets, one per line starting with "- ". No intro, no explanation.` }], "You are a debate coach giving quick seed ideas as terse bullet points. Each under 12 words. No preamble.");
      setHint(h); setHintsLeft(n => n - 1);
    } catch (e) { setHint("Couldn't load a hint, try again."); }
    setHintLoading(false);
  };

  const beginDebate = async () => {
    setDebateStarted(true); setLoading(true); setTimerActive(false); setHintsLeft(maxHints);
    try {
      const o = await callClaude([{ role: "user", content: "Open with your strongest single argument." }], buildSys());
      setHist([{ role: "assistant", content: o }]); setMsgs([{ role: "claude", text: o, fresh: true }]);
      const typeMs = Math.min(o.length * 8 + 300, 6000);
      setTimerKey(k => k + 1);
      setTimeout(() => setTimerActive(true), typeMs);
    } catch (e) { setMsgs([{ role: "claude", text: "Error: " + e.message }]); }
    setLoading(false);
  };

  const enterArena = () => {
    setTransitioning(true);
    setTimeout(() => {
      setStage("debate"); setMsgs([]); setHist([]); setRound(1); setScores([]);
      setFallacies({}); setSummary(""); setPrev(null); setDebateStarted(false);
      setTimerActive(false); setTimeouts(0); setHint(""); setAutoLost(false);
      setPendingResult(null); setPointsRevealed(false);
      setOffTopicCount(0); setInputError("");
      setDrawResult(false); setSummaryTip("");
    }, 950);
    setTimeout(() => setTransitioning(false), 2000);
  };

  // Return to a finished debate to review feedback, without wiping it
  const reviewLast = () => {
    setLoading(false); setSumLoading(false); setTimerActive(false); setHintLoading(false);
    setMsgs(m => m.map(x => ({ ...x, fresh: false }))); // don't re-type on review
    setStage("debate");
  };

  const goHome = () => {
    if (debateStarted && !summary) setConfirmLeave(true);
    else setStage("setup");
  };

  const send = async (autoSubmit = false) => {
    if (loading) return;
    const timedOut = autoSubmit && !input.trim();
    // Enforce minimum word count on real submissions
    if (!timedOut) {
      const words = input.trim().split(/\s+/).filter(Boolean).length;
      if (words < MIN_WORDS) {
        setInputError(`Develop your argument — at least ${MIN_WORDS} words (you have ${words}).`);
        return;
      }
    }
    setInputError("");
    const txt = timedOut ? "[Time ran out]" : input.trim();
    if (!txt && !autoSubmit) return;
    setTimerActive(false); setInput(""); setHint("");

    let newTimeouts = timeouts;
    if (timedOut) { newTimeouts = timeouts + 1; setTimeouts(newTimeouts); }

    const idx = msgs.length;
    setMsgs(m => [...m.map(x => ({ ...x, fresh: false })), { role: "user", text: txt, timedOut }]);
    if (!timedOut) detectF(txt, idx);
    const newH = [...hist, { role: "user", content: timedOut ? "[I ran out of time and didn't respond]" : txt }];
    setHist(newH); setRound(r => r + 1); setLoading(true);

    // timeout = automatic low score; otherwise grade returns {score, onTopic}
    const gradePromise = timedOut ? Promise.resolve({ score: 2, onTopic: true }) : grade(txt);
    const [g, replyRaw] = await Promise.all([gradePromise, callClaude(newH, buildSys(timedOut)).catch(e => "Error: " + e.message)]);
    const isDraw = /\[DRAW\]/i.test(replyRaw);
    const reply = replyRaw.replace(/\[DRAW\]/ig, "").trim();
    const s = g.score;
    if (!timedOut && !g.onTopic) setOffTopicCount(c => c + 1);
    setScores(x => [...x, s]);
    setHist([...newH, { role: "assistant", content: reply }]);
    setMsgs(m => {
      const copy = m.map(x => ({ ...x, fresh: false }));
      for (let j = copy.length - 1; j >= 0; j--) {
        if (copy[j].role === "user" && copy[j].score == null) { copy[j] = { ...copy[j], score: s, offTopic: !timedOut && !g.onTopic }; break; }
      }
      return [...copy, { role: "claude", text: reply, fresh: true }];
    });
    setLoading(false);

    // Claude accepted a draw
    if (isDraw) { setDrawResult(true); const typeMs = Math.min(reply.length * 8 + 300, 6000); setTimeout(() => endDebate(false, true), typeMs + 400); return; }

    // Two timeouts = auto loss
    if (newTimeouts >= 2) { setAutoLost(true); setTimeout(() => endDebate(true), 800); return; }
    const typeMs = Math.min(reply.length * 8 + 300, 6000);
    setTimerKey(k => k + 1);
    setTimeout(() => setTimerActive(true), typeMs);
  };

  const endDebate = async (lost = false, draw = false) => {
    if (sumLoading || summary) return;
    setTimerActive(false); setSumLoading(true);
    const participated = scores.length > 0;
    const roundsPlayed = scores.length;
    const eligibleForGains = roundsPlayed >= 5 || draw; // a draw is always honorable
    let a = participated ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
    if (lost) a = Math.min(a, 2);

    // Point delta: no participation = flat penalty; loss = heavy penalty; draw = modest reward; else Elo-style
    let d;
    if (!participated) d = -40;
    else if (lost) d = -Math.abs(Math.round((5 - a) * 20)) - 20;
    else if (draw) d = Math.max(15, Math.round((a - 5) * 15)); // honorable draw earns solid points
    else d = Math.round((a - 5) * 20);

    // Off-topic penalty: lose 8 points for each argument that strayed from the topic
    const offTopicPenalty = offTopicCount * 8;
    d -= offTopicPenalty;

    // Fewer than 5 rounds: you can still LOSE points, but you cannot GAIN them
    if (!eligibleForGains && d > 0) d = 0;

    // 2x bonus from a previous 9+ debate applies to positive gains only
    const bonusApplied = bonusNext && d > 0;
    if (bonusApplied) d *= 2;
    const bonusEarned = eligibleForGains && !lost && a >= 9;

    const old = rating, nw = Math.max(0, old + d);
    const ol = getLevel(old), nl = getLevel(nw);

    // Store the result but DON'T apply it yet — wait for the reveal button
    setPendingResult({
      delta: d, oldRating: old, newRating: nw, avg: Math.round(a * 10) / 10,
      levelChanged: nl.name !== ol.name, newLevel: nl, deranked: nw < old,
      bonusApplied, bonusEarned, rounds: round, roundsPlayed, eligibleForGains, draw,
    });
    setPointsRevealed(false);

    if (!participated) {
      // No arguments were made — don't ask the API to invent feedback
      const noShow = {
        civil: "You didn't make any arguments this time, so there's nothing for me to assess. No harm done — come back when you're ready to engage, and we'll have a proper debate. Points were deducted for the forfeit.",
        sharp: "You didn't put forward a single argument, so there's nothing to evaluate. A debate requires participation. Points deducted — show up ready to argue next time.",
        ruthless: "You showed up, said nothing of substance, and bailed. That's not a debate, that's a forfeit. I can't critique arguments that don't exist. Points deducted. Come back when you actually have something to say.",
      };
      setSummary(noShow[intensity]);
      setSumLoading(false);
      return;
    }

    try {
      const userSide = side === "for" ? "in favor of" : "against";
      const claudeSide = side === "for" ? "against" : "in favor of";
      const transcript = hist.map(m =>
        m.role === "user" ? `THE STUDENT (arguing ${userSide}): ${m.content}`
                          : `THE OPPONENT (arguing ${claudeSide}): ${m.content}`
      ).join("\n\n");
      const task = lost
        ? `The student lost by running out of time twice. In under 90 words, coach THE STUDENT — tell them they need to respond faster and engage. Speak to the student as "you".`
        : draw
        ? `The debate ended in a DRAW — the student argued well enough that you conceded the topic has real nuance. In under 110 words, coach THE STUDENT: acknowledge the strong case they built, note their best argument, and give one tip to push from a draw to a win next time. Speak to the student as "you". End with a single concrete tip on its own line starting with "TIP: ".`
        : `In under 110 words, coach THE STUDENT on THEIR OWN arguments only (the lines marked "THE STUDENT"). Cover: their strongest moment, their weakest point, and any logical mistakes THEY made. Speak to the student as "you". Do NOT praise or critique the opponent — only the student.${offTopicCount > 0 ? ` IMPORTANT: ${offTopicCount} of their argument(s) drifted off-topic or didn't engage the actual debate — call this out directly and tell them it cost them points.` : ""} End with a single concrete tip on its own line starting with "TIP: ".`;
      const prompt = `Topic: "${act}". Here is the debate transcript:\n\n${transcript}\n\n${task}`;
      const s = await callClaude([{ role: "user", content: prompt }], `You are a debate coach reviewing a student's performance. Your feedback style is ${INTENSITY[intensity].coach}. You are evaluating ONLY "THE STUDENT" — never the opponent. Write flowing natural prose — NO markdown, NO asterisks, NO bullet points, NO numbered lists, NO headers. Address the student as "you".`);
      const raw = stripMd(s);
      const tipMatch = raw.match(/TIP:\s*(.+)$/is);
      if (tipMatch) {
        setSummaryTip(tipMatch[1].trim());
        setSummary(raw.replace(/TIP:\s*.+$/is, "").trim());
      } else {
        setSummaryTip("");
        setSummary(raw);
      }
    } catch (e) { setSummary("Could not generate summary: " + e.message); }
    setSumLoading(false);
  };

  const attemptEnd = () => {
    if (sumLoading || summary || !debateStarted) return;
    // Warn if ending before 5 rounds (no points to gain, only possible loss)
    if (scores.length < 5) { setConfirmEarlyEnd(true); return; }
    endDebate();
  };

  const revealPoints = () => {
    if (!pendingResult || pointsRevealed) return;
    const r = pendingResult;
    const effDelta = r.newRating - r.oldRating; // clamped at 0 floor
    setPrev(r.oldRating);
    setRating(r.newRating);
    setTrophies(t => [{ id: Date.now() + "-" + Math.random().toString(36).slice(2,7), topic: act, side, avg: r.avg, delta: effDelta, date: new Date().toLocaleDateString(), rounds: r.rounds, draw: r.draw, hist, msgs, intensity, traits }, ...t].slice(0, 20));
    setBonusNext(r.bonusEarned);
    if (r.levelChanged) setTimeout(() => setLvlModal({ ...r.newLevel, deranked: r.deranked }), 900);
    if (effDelta > 0) { setFxConfetti(true); setTimeout(() => setFxConfetti(false), 3500); }
    else if (effDelta < 0) { setFxDamage(true); setTimeout(() => setFxDamage(false), 1100); }
    setPointsRevealed(true);
  };

  const togglePin = (d) => {
    setPinned(p => {
      if (p.find(x => x.id === d.id)) return p.filter(x => x.id !== d.id);
      if (p.length >= 5) return p; // max 5 pins
      return [d, ...p].slice(0, 5);
    });
  };
  const isPinned = (d) => pinned.some(x => x.id === d.id);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%;overflow:hidden}
    body{background:#0c0c14;color:#e8e4dc;font-family:'Inter',sans-serif}
    @keyframes pR{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.8);opacity:0}}
    @keyframes pC{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
    @keyframes msgIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes urgentPulse{0%,100%{opacity:1}50%{opacity:.45}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes drawerDown{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
    @keyframes drawerUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-100%)}}
    @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes hintPulse{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes revealGlow{0%,100%{box-shadow:0 4px 18px #c9a84c44}50%{box-shadow:0 4px 28px #c9a84c88,0 0 12px #c9a84c66}}
    @keyframes confettiFall{0%{transform:translateY(0) translateX(0) rotate(0);opacity:1}100%{transform:translateY(105vh) translateX(var(--drift)) rotate(var(--rot));opacity:0.9}}
    @keyframes damageFlash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes shuffleIn{0%{opacity:0;transform:translateX(-24px) scale(.96)}100%{opacity:1;transform:translateX(0) scale(1)}}
    @keyframes spin360{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes resultPop{0%{transform:scale(0) rotate(-12deg);opacity:0}50%{transform:scale(1.35) rotate(4deg)}70%{transform:scale(.92)}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes resultGlow{0%{text-shadow:0 0 0 transparent}40%{text-shadow:0 0 30px currentColor}100%{text-shadow:0 0 12px currentColor}}
    @keyframes flashRing{0%{transform:scale(.3);opacity:.9}100%{transform:scale(2.4);opacity:0}}
    @keyframes screenPulse{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
    @keyframes sandShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-0.6px)}75%{transform:translateX(0.6px)}}
    @keyframes arenaFlash{0%{opacity:0}12%{opacity:1}70%{opacity:1}100%{opacity:0}}
    @keyframes arenaText{0%{opacity:0;transform:scale(.8) translateY(10px);letter-spacing:.1em}30%{opacity:1;transform:scale(1) translateY(0);letter-spacing:.35em}75%{opacity:1;transform:scale(1) translateY(0);letter-spacing:.35em}100%{opacity:0;transform:scale(1.1);letter-spacing:.6em}}
    @keyframes swordSlash{0%{transform:translateX(-120%) rotate(-12deg);opacity:0}40%{opacity:1}100%{transform:translateX(120%) rotate(-12deg);opacity:0}}
    .mi{animation:msgIn .4s cubic-bezier(.2,.8,.2,1) forwards}
    .drawer{animation:drawerDown .4s cubic-bezier(.2,.8,.2,1) forwards;overflow:hidden}
    .hov{transition:all .15s ease;cursor:pointer}
    .hov:hover{opacity:.9;transform:translateY(-2px)}
    .bhov{transition:all .15s ease;cursor:pointer}
    .bhov:hover{filter:brightness(1.08);transform:translateY(-1px)}
    .hint-loading{background:linear-gradient(90deg,#534AB733 25%,#a89eed44 50%,#534AB733 75%);background-size:200% 100%;animation:shimmer 1.2s linear infinite}
    input:focus,textarea:focus{outline:none;border-color:#c9a84c!important;box-shadow:0 0 0 3px #c9a84c18!important}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:3px}
  `;

  const arenaTransition = transitioning && (
    <div style={{ position:"fixed",inset:0,zIndex:500,background:"radial-gradient(circle at center, #1a1208, #0a0a0f 70%)",display:"flex",alignItems:"center",justifyContent:"center",animation:"arenaFlash 2s ease-in-out forwards",overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"50%",left:0,width:"100%",height:3,background:`linear-gradient(90deg,transparent,${G},transparent)`,animation:"swordSlash 2s ease-in-out forwards",boxShadow:`0 0 20px ${G}` }} />
      <div style={{ textAlign:"center",animation:"arenaText 2s ease-in-out forwards" }}>
        <div style={{ fontSize:56,marginBottom:12 }}>⚔️</div>
        <div style={{ fontSize:34,fontWeight:900,color:G,fontFamily:"'Playfair Display',serif",textTransform:"uppercase" }}>Enter the Arena</div>
      </div>
    </div>
  );

  const bgArt = (
    <div style={{ position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"-15%",right:"-8%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle, #c9a84c0a 0%, transparent 65%)",animation:"floaty 14s ease-in-out infinite" }} />
      <div style={{ position:"absolute",bottom:"-15%",left:"-8%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, #534AB70a 0%, transparent 65%)",animation:"floaty 18s ease-in-out infinite reverse" }} />
      <div style={{ position:"absolute",top:"40%",left:"45%",transform:"translate(-50%,-50%)",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle, #4fc3f706 0%, transparent 60%)" }} />
      <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.022 }}>
        <defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#c9a84c" strokeWidth="0.5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
    </div>
  );

  // ── SETUP ────────────────────────────────────────────────────────────────
  if (stage === "setup") return (
    <div style={{ width:"100vw",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:"linear-gradient(135deg,#0c0c14,#0e0e1a 50%,#0c0e14)" }}>
      <style>{CSS}</style>
      {arenaTransition}
      {lvlModal && <LevelUpModal level={lvlModal} onClose={() => setLvlModal(null)} />}
      {viewDebate && <PastDebateModal debate={viewDebate} onClose={() => setViewDebate(null)} />}
      {bgArt}

      {/* TOP BAR */}
      <div style={{ height:"68px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",borderBottom:BDR,flexShrink:0,position:"relative",zIndex:2,background:"rgba(12,12,20,0.8)",backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:"1.6rem",fontFamily:"'Playfair Display',serif",fontWeight:900,color:"#f0ece4" }}>DEBATE</span>
          <span style={{ fontSize:"1.6rem",fontFamily:"'Playfair Display',serif",fontWeight:900,color:G,fontStyle:"italic" }}>ARENA</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:`${level.color}22`,border:`1px solid ${level.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{level.icon}</div>
            <div>
              <div style={{ fontSize:14,fontWeight:600,color:level.color }}>{level.name}</div>
              <div style={{ fontSize:12,color:"#6b6860" }}>{rating} pts{delta != null && delta !== 0 && <span style={{ color:delta>0?"#4ade80":"#f87171",marginLeft:5 }}>{delta>0?"+":""}{delta}</span>}</div>
            </div>
          </div>
          <div style={{ width:120 }}>
            <div style={{ height:5,background:"#1e1e2e",borderRadius:3,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${level.color}88,${level.color})`,borderRadius:3,transition:"width 1s ease" }} />
            </div>
            {nxt && <div style={{ fontSize:11,color:"#5a5868",marginTop:3,textAlign:"center",fontWeight:500 }}>{nxt.min - rating} pts to {nxt.name}</div>}
          </div>
          <button onClick={toggleStats} className="hov" style={{ background:"rgba(255,255,255,.04)",border:BDR,borderRadius:8,padding:"8px 16px",fontSize:13,color:"#9a9690",cursor:"pointer",fontWeight:500 }}>{showStats && !statsClosing ? "▾ Stats" : "▸ My Stats"}</button>
        </div>
      </div>

      {/* STATS DRAWER */}
      {showStats && (
        <div style={{ position:"absolute",top:"68px",left:0,right:0,overflow:"hidden",zIndex:20 }}>
        <div className="drawer" style={{ background:"#0c0c16",borderBottom:BDR,padding:"20px 44px",display:"flex",gap:48,backdropFilter:"blur(20px)",boxShadow:"0 16px 40px rgba(0,0,0,0.6)",animation:statsClosing?"drawerUp .55s cubic-bezier(.4,0,.2,1) forwards":"drawerDown .55s cubic-bezier(.16,1,.3,1) forwards" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:14 }}>Recent Debates</div>
            {trophies.length === 0 && <p style={{ fontSize:13,color:"#5a5868" }}>No debates yet. Enter the arena to begin.</p>}
            {trophies.slice(0, 5).map((t, i) => (
              <div key={t.id || i} className="hov" onClick={() => t.hist && setViewDebate(t)} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,cursor:t.hist?"pointer":"default",background:"transparent",marginBottom:2 }}>
                <div style={{ minWidth:0,flex:1 }}>
                  <div style={{ fontSize:13,color:"#c8c4b8",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{t.topic}</div>
                  <div style={{ fontSize:11,color:"#5a5868",marginTop:2 }}>{t.date} · {t.rounds} rounds · avg {t.avg}/10{t.draw?" · 🤝 draw":""}</div>
                </div>
                {t.delta !== 0 && <span style={{ fontSize:14,fontWeight:700,color:t.delta>0?"#4ade80":"#f87171",flexShrink:0 }}>{t.delta>0?"+":""}{t.delta}</span>}
                <button onClick={e => { e.stopPropagation(); togglePin(t); }} title={isPinned(t)?"Unpin":"Pin this debate"} style={{ background:"none",border:"none",cursor:"pointer",fontSize:15,padding:"2px 4px",opacity:isPinned(t)?1:0.4,flexShrink:0 }}>📌</button>
              </div>
            ))}
          </div>
          {pinned.length > 0 && (
            <div style={{ width:230 }}>
              <div style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:14 }}>📌 Pinned ({pinned.length}/5)</div>
              {pinned.map((t, i) => (
                <div key={t.id || i} className="hov" onClick={() => t.hist && setViewDebate(t)} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:"rgba(201,168,76,.05)",border:"1px solid #c9a84c22",marginBottom:6 }}>
                  <div style={{ minWidth:0,flex:1 }}>
                    <div style={{ fontSize:12,color:"#c8c4b8",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{t.topic}</div>
                    <div style={{ fontSize:10,color:"#5a5868",marginTop:1 }}>avg {t.avg}/10</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); togglePin(t); }} title="Unpin" style={{ background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"2px",flexShrink:0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ width:260 }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G,marginBottom:14 }}>Levels & Requirements</div>
            {LEVELS.map((l, i) => {
              const isCurrent = l.name === level.name;
              const reached = rating >= l.min;
              return (
                <div key={l.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9,padding:"6px 10px",borderRadius:8,background:isCurrent?`${l.color}14`:"transparent",border:isCurrent?`1px solid ${l.color}44`:"1px solid transparent" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                    <span style={{ fontSize:16,filter:reached?"none":"grayscale(1)",opacity:reached?1:.5 }}>{l.icon}</span>
                    <span style={{ fontSize:14,fontWeight:isCurrent?700:600,color:reached?l.color:"#5a5868" }}>{l.name}</span>
                  </div>
                  <span style={{ fontSize:13,color:reached?"#8a8680":"#4a4858",fontWeight:600 }}>{l.min.toLocaleString()} pts</span>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}

      {/* 3 COLUMNS */}
      <div style={{ flex:1,display:"flex",minHeight:0,position:"relative",zIndex:1 }}>
        {/* LEFT */}
        <div style={{ flex:1,borderRight:BDR,display:"flex",flexDirection:"column",padding:"28px 36px",gap:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G }}>Pick Your Battleground</span>
            <button onClick={refresh} className="hov" style={{ background:"rgba(255,255,255,.04)",border:BDR,borderRadius:7,padding:"5px 14px",fontSize:15,color:"#6b6860",cursor:"pointer" }}><span key={shuffleKey} style={{ display:"inline-block",animation:"spin360 .5s ease" }}>↻</span></button>
          </div>
          {topics.map((t, ti) => (
            <button key={`${shuffleKey}-${t.label}`} className="hov" onClick={() => { setTopic(t.label); setCustom(""); }}
              style={{ flex:1,background:topic===t.label&&!custom?"linear-gradient(135deg,#1e1c2e,#252040)":"rgba(255,255,255,.025)",border:topic===t.label&&!custom?"1px solid #6058c8":BDR,borderRadius:12,padding:"16px 18px",color:topic===t.label&&!custom?"#c0b8f0":"#a0a098",cursor:"pointer",display:"flex",flexDirection:"column",textAlign:"left",position:"relative",overflow:"hidden",boxShadow:topic===t.label&&!custom?"0 0 24px #534AB722":"none",animation:`shuffleIn .5s cubic-bezier(.2,.8,.2,1) ${ti*0.07}s both` }}>
              <div style={{ position:"absolute",top:0,left:0,width:3,height:"100%",background:topic===t.label&&!custom?"linear-gradient(180deg,#6058c8,transparent)":"transparent",transition:"all .2s" }} />
              <div style={{ position:"absolute",bottom:0,left:"8%",right:"8%",height:1,background:`linear-gradient(90deg,transparent,${topic===t.label&&!custom?"#6058c8":"#2a2a3e"},transparent)` }} />
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,position:"relative",zIndex:1 }}>
                <span style={{ fontSize:12,color:"#9a9690",fontWeight:700,letterSpacing:".06em",textTransform:"uppercase" }}>{t.cat.split(" ").slice(1).join(" ")}</span>
                <span style={{ fontSize:11,color:DC[t.d],fontWeight:700,background:DC[t.d]+"18",padding:"2px 10px",borderRadius:20,border:`1px solid ${DC[t.d]}33` }}>{DL[t.d]}</span>
              </div>
              <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"4px 0 0",position:"relative",zIndex:1 }}>
                <span style={{ fontSize:19,lineHeight:1.4,fontFamily:"'Playfair Display',serif",fontWeight:700,color:topic===t.label&&!custom?"#f0ece4":"#d4d0c8" }}>{t.label} {t.cat.split(" ")[0]}</span>
              </div>
            </button>
          ))}
          <div style={{ display:"flex",gap:14,flexWrap:"wrap",alignItems:"center",justifyContent:"center",padding:"2px 0" }}>
            {Object.entries(DL).map(([d, l]) => (
              <div key={d} style={{ display:"flex",alignItems:"center",gap:5 }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:DC[d],display:"inline-block" }} />
                <span style={{ fontSize:12,color:"#6b6860",fontWeight:500 }}>{l}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:12,color:"#5a5868",marginBottom:8,fontWeight:500 }}>Or type your own topic:</div>
            <input value={custom} onChange={e => { setCustom(e.target.value); setTopic(""); }}
              style={{ width:"100%",background:"rgba(255,255,255,.03)",border:BDR,borderRadius:10,padding:"14px 18px",fontSize:16,color:"#e8e4dc",fontFamily:"'Inter',sans-serif" }} />
          </div>
        </div>

        {/* MIDDLE */}
        <div style={{ flex:1,borderRight:BDR,display:"flex",flexDirection:"column",padding:"28px 36px",gap:10 }}>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G }}>Your Side</div>
          {[["for","👍","I'm FOR it","You argue in favor — Claude argues against"],
            ["against","👎","I'm AGAINST it","You argue against — Claude argues in favor"]].map(([v, ic, ti, de]) => (
            <div key={v} className="hov" onClick={() => setSide(v)}
              style={{ flex:1,background:side===v?"linear-gradient(135deg,#1e1c2e,#252040)":"rgba(255,255,255,.025)",border:side===v?"1px solid #6058c8":BDR,borderRadius:14,padding:"22px",cursor:"pointer",display:"flex",alignItems:"center",gap:20,position:"relative",overflow:"hidden",boxShadow:side===v?"0 0 24px #534AB722":"none" }}>
              <div style={{ position:"absolute",top:0,left:0,width:3,height:"100%",background:side===v?"linear-gradient(180deg,#6058c8,transparent)":"transparent",transition:"all .2s" }} />
              <div style={{ position:"absolute",bottom:0,left:"10%",right:"10%",height:1,background:`linear-gradient(90deg,transparent,${side===v?"#6058c8":"#2a2a3e"},transparent)` }} />
              <span style={{ fontSize:40,position:"relative",zIndex:1 }}>{ic}</span>
              <div style={{ position:"relative",zIndex:1 }}>
                <div style={{ fontSize:20,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif" }}>{ti}</div>
                <div style={{ fontSize:14,color:"#6b6860",marginTop:5 }}>{de}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:G }}>Debate Style</div>
          {Object.entries(INTENSITY).map(([k, { label, desc }]) => (
            <button key={k} className="hov" onClick={() => setIntensity(k)}
              style={{ flex:1,background:intensity===k?"linear-gradient(135deg,#1a1208,#221808)":"rgba(255,255,255,.025)",border:intensity===k?`1px solid ${G}88`:BDR,borderRadius:12,padding:"18px 22px",cursor:"pointer",textAlign:"left",display:"flex",flexDirection:"column",justifyContent:"center",gap:5,position:"relative",overflow:"hidden",boxShadow:intensity===k?`0 0 20px ${G}18`:"none" }}>
              <div style={{ position:"absolute",top:0,left:0,width:3,height:"100%",background:intensity===k?`linear-gradient(180deg,${G},transparent)`:"transparent",transition:"all .2s" }} />
              <div style={{ position:"absolute",bottom:0,left:"10%",right:"10%",height:1,background:`linear-gradient(90deg,transparent,${intensity===k?G:"#2a2a3e"},transparent)` }} />
              <div style={{ fontSize:18,fontWeight:700,color:intensity===k?G:"#a0a098",fontFamily:"'Playfair Display',serif",position:"relative",zIndex:1 }}>{label}</div>
              <div style={{ fontSize:14,color:intensity===k?G+"88":"#5a5868",position:"relative",zIndex:1 }}>{desc}</div>
            </button>
          ))}
        </div>

        {/* RIGHT */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",padding:"28px 36px",gap:12 }}>
          <button onClick={() => setShowTraits(s => !s)} className="hov" style={{ background:"none",border:"none",cursor:"pointer",color:G,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".14em",padding:0,display:"flex",alignItems:"center",gap:6 }}>
            {showTraits ? "▾" : "▸"} Customize Claude's Style
          </button>
          {showTraits && (
            <div className="drawer" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {TRAITS.map(t => (
                <button key={t.id} className="hov" onClick={() => toggleTrait(t.id)}
                  style={{ background:traits.includes(t.id)?"linear-gradient(135deg,#1a1208,#221808)":"rgba(255,255,255,.025)",border:traits.includes(t.id)?`1px solid ${G}66`:BDR,borderRadius:10,padding:"12px 14px",cursor:"pointer",textAlign:"left" }}>
                  <div style={{ fontSize:13,fontWeight:600,color:traits.includes(t.id)?G:"#c8c4b8",marginBottom:3 }}>{t.label}</div>
                  <div style={{ fontSize:12,color:"#5a5868" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          )}
          <div style={{ flex:1,background:"rgba(255,255,255,.02)",border:BDR,borderRadius:14,padding:"24px 28px",display:"flex",flexDirection:"column" }}>
            <div style={{ fontSize:11,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".14em",textAlign:"center",marginBottom:6,paddingBottom:14,borderBottom:BDR }}>How Scoring Works</div>
            <div style={{ flex:1,display:"flex",flexDirection:"column",justifyContent:"space-evenly",gap:10 }}>
              {[["🟢","Strong (8-10)","#4ade80","Gain the most points"],
                ["🟡","Solid (6-7)",G,"Gain some points"],
                ["🟠","Weak (4-5)","#fb923c","Break even"],
                ["🔴","Poor (1-3)","#f87171","Lose points"]].map(([dot, label, col, explain]) => (
                <div key={label} className="hov" style={{ display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:3,padding:"12px 8px",borderRadius:12,background:`linear-gradient(135deg, ${col}10, transparent)`,border:`1px solid ${col}22`,position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${col},transparent)`,opacity:0.5 }} />
                  <span style={{ fontSize:24,filter:`drop-shadow(0 0 8px ${col}66)` }}>{dot}</span>
                  <div style={{ fontSize:16,color:col,fontWeight:700 }}>{label}</div>
                  <div style={{ fontSize:13,color:"#8a8680" }}>{explain}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <div style={{ flex:1,background:"rgba(201,168,76,.06)",border:"1px solid #c9a84c22",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:13,color:"#6b6860" }}>⏱ Time</span>
              <span style={{ fontSize:17,fontWeight:700,color:G }}>{timeLimit}s</span>
            </div>
            <div style={{ flex:1,background:"rgba(83,74,183,.06)",border:"1px solid #534AB733",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <span style={{ fontSize:13,color:"#6b6860" }}>💡 Hints</span>
              <span style={{ fontSize:17,fontWeight:700,color:"#a89eed" }}>{maxHints}</span>
            </div>
          </div>
          {summary && (
            <button onClick={reviewLast} className="bhov" style={{ width:"100%",padding:"12px",background:"rgba(168,158,237,0.1)",color:"#a89eed",border:"1px solid #534AB755",borderRadius:11,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:-2 }}>
              ↩ Review your last debate{pendingResult && !pointsRevealed ? " — points not yet revealed!" : ""}
            </button>
          )}
          <button disabled={!act || !side} className={act && side ? "bhov" : ""} onClick={enterArena}
            style={{ width:"100%",padding:"20px",background:act&&side?`linear-gradient(135deg,${G},#b8962e)`:"rgba(255,255,255,.04)",color:act&&side?"#0a0a0f":"#3a3a4e",border:act&&side?"none":BDR,borderRadius:12,fontSize:17,fontWeight:700,letterSpacing:".06em",cursor:act&&side?"pointer":"not-allowed",transition:"all .2s",boxShadow:act&&side?`0 4px 24px ${G}44`:"none" }}>
            {act && side ? "⚔️  ENTER THE ARENA" : "Select a topic & side first"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── DEBATE ──────────────────────────────────────────────────────────────
  return (
    <div style={{ width:"100vw",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>
      <style>{CSS}</style>
      {arenaTransition}
      {fxConfetti && <Confetti />}
      {fxDamage && <DamageFlash />}
      {lvlModal && <LevelUpModal level={lvlModal} onClose={() => setLvlModal(null)} />}
      {confirmLeave && <ConfirmModal
        onSave={() => { setConfirmLeave(false); endDebate(); }}
        onDiscard={() => { setConfirmLeave(false); setStage("setup"); }}
        onCancel={() => setConfirmLeave(false)} />}
      {confirmEarlyEnd && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,animation:"fadeIn .25s ease" }} onClick={() => setConfirmEarlyEnd(false)}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"linear-gradient(145deg, #13131f, #1a1a2e)",border:BDR,borderRadius:20,padding:"32px",maxWidth:440,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>
            <div style={{ fontSize:40,marginBottom:14 }}>⏳</div>
            <div style={{ fontSize:20,fontWeight:700,color:"#f0ece4",marginBottom:10,fontFamily:"'Playfair Display',serif" }}>End early?</div>
            <div style={{ fontSize:14,color:"#8a8680",lineHeight:1.6,marginBottom:8 }}>You've only argued <strong style={{ color:G }}>{scores.length} of 5</strong> rounds needed to earn points. Play <strong style={{ color:G }}>{5 - scores.length} more</strong> to become eligible for a reward.</div>
            <div style={{ fontSize:13,color:"#f87171",lineHeight:1.5,marginBottom:24 }}>If you end now you <strong>cannot gain points</strong> — but you can still <strong>lose</strong> them.</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <button className="bhov" onClick={() => setConfirmEarlyEnd(false)} style={{ padding:"13px",background:`linear-gradient(135deg,${G},#b8962e)`,color:"#0a0a0f",border:"none",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer" }}>Keep Debating</button>
              <button className="bhov" onClick={() => { setConfirmEarlyEnd(false); endDebate(); }} style={{ padding:"13px",background:"rgba(248,113,113,.1)",color:"#f87171",border:"1px solid #3a1a1a",borderRadius:10,fontSize:15,fontWeight:600,cursor:"pointer" }}>End Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ height:"60px",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",borderBottom:BDR,flexShrink:0,background:"rgba(10,10,16,0.95)",backdropFilter:"blur(20px)",zIndex:10,position:"relative" }}>
        <div style={{ display:"flex",gap:14,alignItems:"center",minWidth:0,flex:1 }}>
          <button onClick={goHome} className="hov" style={{ fontSize:13,color:G,background:"rgba(201,168,76,.06)",border:`1px solid ${G}33`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontWeight:600,flexShrink:0 }}>← Home</button>
          <div style={{ minWidth:0,overflow:"hidden",display:"flex",alignItems:"baseline",gap:10,justifyContent:"center",flex:1 }}>
            <span style={{ fontSize:14,fontStyle:"italic",color:"#9a9690",fontFamily:"'Playfair Display',serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>"{quote.t}"</span>
            <span style={{ fontSize:12,color:G,fontWeight:600,whiteSpace:"nowrap",flexShrink:0 }}>— {quote.a}</span>
          </div>
          {bonusNext && <span style={{ fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,background:"#0d1f17",color:"#4ade80",border:"1px solid #1a3d2b",flexShrink:0 }}>✨ 2x</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10,color:"#5a5868",textTransform:"uppercase",letterSpacing:".1em",fontWeight:600 }}>Round</div>
            <div style={{ fontSize:20,fontWeight:700,lineHeight:1 }}>{round}</div>
          </div>
          {avg !== null && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10,color:"#5a5868",textTransform:"uppercase",letterSpacing:".1em",fontWeight:600 }}>Avg</div>
            <div style={{ fontSize:20,fontWeight:700,color:sc(avg),lineHeight:1 }}>{avg}<span style={{ fontSize:12,color:"#3a3a4e" }}>/10</span></div>
          </div>}
          {timeouts > 0 && <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10,color:"#5a5868",textTransform:"uppercase",letterSpacing:".1em",fontWeight:600 }}>Timeouts</div>
            <div style={{ fontSize:20,fontWeight:700,color:"#f87171",lineHeight:1 }}>{timeouts}<span style={{ fontSize:12,color:"#3a3a4e" }}>/2</span></div>
          </div>}
          <button onClick={attemptEnd} disabled={sumLoading || !!summary || !debateStarted}
            style={{ fontSize:13,color:sumLoading||summary||!debateStarted?"#3a3a4e":"#f87171",background:"rgba(255,255,255,.03)",border:"1px solid",borderColor:sumLoading||summary||!debateStarted?"#1e1e2e":"#3a1a1a",borderRadius:8,padding:"7px 14px",cursor:sumLoading||summary||!debateStarted?"not-allowed":"pointer",fontWeight:500 }}>
            {sumLoading ? "Generating…" : "⏹ End"}
          </button>
        </div>
      </div>

      <div style={{ flex:1,display:"flex",minHeight:0 }}>
        {/* CHAT */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",minHeight:0,position:"relative",background:"linear-gradient(160deg,#0c0c18,#0e0e1c 40%,#0c0e16)" }}>
          {bgArt}
          <div ref={chatRef} style={{ flex:1,overflowY:"auto",padding:"28px 36px",display:"flex",flexDirection:"column",gap:20,position:"relative",zIndex:1 }}>
            {!debateStarted && !loading && (
              <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,minHeight:300 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:52,marginBottom:16,animation:"floaty 3s ease-in-out infinite" }}>⚔️</div>
                  <div style={{ fontSize:26,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif",marginBottom:10 }}>Ready to Debate?</div>
                  <div style={{ fontSize:15,color:"#6b6860",maxWidth:400,lineHeight:1.6 }}>You have <strong style={{ color:G }}>{timeLimit} seconds</strong> per argument and <strong style={{ color:"#a89eed" }}>{maxHints} hint{maxHints!==1?"s":""}</strong>. Read the tips on the right, then start when ready.</div>
                </div>
                <button className="bhov" onClick={beginDebate} style={{ padding:"16px 48px",background:`linear-gradient(135deg,${G},#b8962e)`,color:"#0a0a0f",border:"none",borderRadius:12,fontSize:18,fontWeight:700,cursor:"pointer",letterSpacing:".06em",boxShadow:`0 8px 32px ${G}44` }}>Start Debate</button>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className="mi" style={{ display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"68%" }}>
                <div style={{ fontSize:11,color:"#5a5868",marginBottom:6,letterSpacing:".08em",textTransform:"uppercase",textAlign:m.role==="user"?"right":"left",fontWeight:600 }}>{m.role === "user" ? "You" : "Claude"}</div>
                <div style={{ padding:"16px 20px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",fontSize:16,lineHeight:1.75,background:m.role==="user"?`linear-gradient(135deg,#c9a84c,#b8962e)`:"rgba(20,20,32,0.92)",color:m.role==="user"?"#0a0a0f":"#d4d0c8",border:m.role==="user"?"none":"1px solid #1e1e2e",backdropFilter:m.role==="user"?"none":"blur(12px)",boxShadow:m.role==="user"?"0 4px 20px #c9a84c33":"0 4px 20px rgba(0,0,0,0.4)",fontWeight:m.role==="user"?500:400 }}>
                  {m.timedOut ? <span style={{ color:"#7a2020",fontStyle:"italic",fontWeight:600 }}>⏱ Time ran out</span>
                    : (m.role === "claude" && m.fresh)
                      ? <Typewriter text={m.text} onTick={() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }} />
                      : m.text}
                </div>
                {m.role === "user" && !m.timedOut && m.score != null && (
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:7,flexWrap:"wrap" }}>
                    <div style={{ width:`${(m.score/10)*80}px`,height:3,background:sc(m.score),borderRadius:2,transition:"width .6s ease",boxShadow:`0 0 6px ${sc(m.score)}88` }} />
                    <span style={{ fontSize:13,color:sc(m.score),fontWeight:700 }}>{m.score}/10</span>
                    {m.offTopic && <span style={{ fontSize:12,padding:"2px 9px",background:"#2d1515",border:"1px solid #7f1d1d",borderRadius:20,color:"#f87171",fontWeight:600 }}>⤳ off-topic</span>}
                  </div>
                )}
                {m.role === "user" && fallacies[i] && (
                  <div style={{ marginTop:6,display:"flex",gap:6,flexWrap:"wrap" }}>
                    {fallacies[i].map(f => <span key={f} style={{ fontSize:12,padding:"3px 10px",background:"#2d1515",border:"1px solid #7f1d1d",borderRadius:20,color:"#f87171",fontWeight:500 }}>⚠️ {f}</span>)}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mi" style={{ display:"flex",flexDirection:"column",alignItems:"flex-start",alignSelf:"flex-start" }}>
                <div style={{ fontSize:11,color:"#5a5868",marginBottom:6,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600 }}>Claude</div>
                <PulsingOrb />
              </div>
            )}
            {sumLoading && (
              <div className="mi" style={{ display:"flex",flexDirection:"column",alignItems:"flex-start",alignSelf:"flex-start",maxWidth:"68%" }}>
                <div style={{ fontSize:11,color:"#a89eed",marginBottom:6,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600 }}>{autoLost ? "💀 Final Verdict" : "📋 Coach"}</div>
                <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 20px",background:"rgba(20,20,32,0.92)",border:"1px solid #2a2a55",borderRadius:"18px 18px 18px 4px",backdropFilter:"blur(12px)" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8,height:8,borderRadius:"50%",background:"#a89eed",animation:`hintPulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  <span style={{ fontSize:14,color:"#8a8680",fontStyle:"italic",marginLeft:4 }}>Reviewing your performance…</span>
                </div>
              </div>
            )}
            {summary && (
              <div className="mi" style={{ display:"flex",flexDirection:"column",alignItems:"flex-start",alignSelf:"flex-start",maxWidth:"72%" }}>
                <div style={{ fontSize:11,color:autoLost?"#f87171":drawResult?"#4fc3f7":"#a89eed",marginBottom:6,letterSpacing:".08em",textTransform:"uppercase",fontWeight:600 }}>{autoLost ? "💀 Final Verdict" : drawResult ? "🤝 Draw — Coach's Feedback" : "📋 Coach's Feedback"}</div>
                <div style={{ padding:"18px 22px",borderRadius:"18px 18px 18px 4px",fontSize:16,lineHeight:1.8,background:"rgba(20,20,32,0.92)",color:"#d4d0c8",border:`1px solid ${autoLost?"#7f1d1d":drawResult?"#1d5a7f":"#2a2a55"}`,backdropFilter:"blur(12px)",boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>
                  <Typewriter text={summary} onTick={() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }} />
                </div>
                {summaryTip && (
                  <div className="mi" style={{ marginTop:10,padding:"14px 18px",background:"rgba(201,168,76,0.08)",border:`1px solid ${G}44`,borderRadius:12,display:"flex",gap:12,alignItems:"flex-start",maxWidth:"100%" }}>
                    <span style={{ fontSize:20,flexShrink:0 }}>🎯</span>
                    <div>
                      <div style={{ fontSize:11,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".1em",marginBottom:4 }}>Key Tip</div>
                      <div style={{ fontSize:15,color:"#e8e4dc",lineHeight:1.6 }}>{summaryTip}</div>
                    </div>
                  </div>
                )}
                <div style={{ display:"flex",alignItems:"center",gap:14,marginTop:14,padding:"14px 18px",background:"rgba(255,255,255,.02)",border:BDR,borderRadius:12,flexWrap:"wrap" }}>
                  <span style={{ fontSize:14,color:"#6b6860" }}>Avg score: <span style={{ color:sc(pendingResult?.avg ?? 0),fontWeight:700 }}>{pendingResult?.avg ?? "—"}/10</span></span>
                  {pointsRevealed
                    ? <button onClick={() => setStage("setup")} className="bhov" style={{ padding:"10px 24px",background:`linear-gradient(135deg,${G},#b8962e)`,color:"#0a0a0f",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",marginLeft:"auto" }}>New Debate →</button>
                    : <span style={{ fontSize:13,color:"#a89eed",marginLeft:"auto",fontWeight:600 }}>→ Reveal your points in the sidebar</span>}
                </div>
              </div>
            )}
          </div>

          {/* Hint loading shimmer */}
          {hintLoading && !summary && (
            <div className="mi" style={{ margin:"0 36px 4px",padding:"14px 18px",borderRadius:12,position:"relative",zIndex:1,border:"1px solid #534AB744" }} >
              <div className="hint-loading" style={{ position:"absolute",inset:0,borderRadius:12,opacity:0.5 }} />
              <div style={{ position:"relative",display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ display:"flex",gap:5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#a89eed",animation:`hintPulse 1.1s ease-in-out ${i*0.18}s infinite` }} />)}
                </div>
                <span style={{ fontSize:14,color:"#a89eed",fontWeight:500 }}>Crafting a hint for you…</span>
              </div>
            </div>
          )}

          {/* Hint banner */}
          {hint && !summary && (
            <div className="mi" style={{ margin:"0 36px 4px",padding:"14px 18px",background:"rgba(83,74,183,0.1)",border:"1px solid #534AB744",borderRadius:12,position:"relative",zIndex:1 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#a89eed",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8 }}>💡 Hint</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {hint.split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).map((l, i) => (
                  <div key={i} style={{ display:"flex",gap:8,alignItems:"flex-start",fontSize:15,color:"#c8c4b8",lineHeight:1.5 }}>
                    <span style={{ color:"#a89eed",flexShrink:0,fontWeight:700 }}>▸</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          {!summary && debateStarted && (
            <div style={{ padding:"14px 36px",borderTop:"1px solid #1e1e2e",display:"flex",gap:12,alignItems:"center",flexShrink:0,background:"rgba(10,10,16,0.95)",backdropFilter:"blur(20px)",position:"relative",zIndex:1 }}>
              {maxHints > 0 && (() => {
                const hintReady = hintsLeft > 0 && !hintLoading && !loading && scores.length >= 1;
                const reason = scores.length < 1 ? "Make your first argument to unlock hints"
                  : loading ? "Wait for Claude to finish"
                  : hintsLeft <= 0 ? "No hints left" : "";
                return (
                  <button onClick={getHint} disabled={!hintReady} title={reason} className={hintReady?"bhov":""}
                    style={{ height:"52px",padding:"0 18px",background:hintReady?"rgba(83,74,183,0.12)":"rgba(255,255,255,.03)",color:hintReady?"#a89eed":"#3a3a4e",border:`1px solid ${hintReady?"#534AB755":"#1e1e2e"}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:hintReady?"pointer":"not-allowed",flexShrink:0,whiteSpace:"nowrap",transition:"all .2s" }}>
                    💡 {hintLoading ? "…" : `Hint (${hintsLeft})`}
                  </button>
                );
              })()}
              <div style={{ flex:1,position:"relative" }}>
                <textarea value={input} onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(false); } }}
                  placeholder={scores.length === 0 ? `Min. ${MIN_WORDS} words` : ""}
                  style={{ width:"100%",resize:"none",height:"52px",padding:"14px 18px",fontSize:15,fontFamily:"'Inter',sans-serif",background:"rgba(255,255,255,.04)",border:`1px solid ${inputError?"#7f1d1d":"#1e1e2e"}`,borderRadius:12,color:"#e8e4dc",lineHeight:1.4 }} />
                {input.trim() && (() => {
                  const w = input.trim().split(/\s+/).filter(Boolean).length;
                  return <span style={{ position:"absolute",right:12,bottom:6,fontSize:11,color:w>=MIN_WORDS?"#4ade80":"#6b6860",fontWeight:600 }}>{w}/{MIN_WORDS}</span>;
                })()}
                {inputError && <div style={{ position:"absolute",left:2,top:-22,fontSize:12,color:"#f87171",fontWeight:500 }}>{inputError}</div>}
              </div>
              {(() => {
                const wc = input.trim().split(/\s+/).filter(Boolean).length;
                const canSend = !loading && wc >= MIN_WORDS;
                return (
                  <button disabled={!canSend} onClick={() => send(false)}
                    style={{ height:"52px",padding:"0 28px",background:!canSend?"rgba(255,255,255,.04)":`linear-gradient(135deg,${G},#b8962e)`,color:!canSend?"#3a3a4e":"#0a0a0f",border:!canSend?BDR:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:!canSend?"not-allowed":"pointer",flexShrink:0,boxShadow:!canSend?"none":`0 4px 16px ${G}44` }}>Send</button>
                );
              })()}
            </div>
          )}
        </div>

        {/* SIDEBAR — no scroll, all fits */}
        <div style={{ width:"340px",borderLeft:"1px solid #1e1e2e",display:"flex",flexDirection:"column",flexShrink:0,background:"linear-gradient(180deg,#0d0d18,#0b0b14)",overflow:"hidden" }}>
          <div style={{ padding:"14px 22px",borderBottom:"1px solid #1e1e2e",textAlign:"center" }}>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,justifyContent:"center" }}>
              <span style={{ fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,background:"#0d1f17",color:"#4ade80",border:"1px solid #1a3d2b" }}>YOU: {side === "for" ? "FOR" : "AGAINST"}</span>
              <span style={{ fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,background:"#1e1c2e",color:"#a89eed",border:"1px solid #3d3680" }}>CLAUDE: {side === "for" ? "AGAINST" : "FOR"}</span>
              {traits.map(id => <span key={id} style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"#1a1208",color:G,border:"1px solid #3d2e10" }}>{TRAITS.find(t => t.id === id)?.label}</span>)}
            </div>
            <div style={{ fontSize:10,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".12em",marginBottom:6 }}>Topic</div>
            <div style={{ fontSize:15,color:"#f0ece4",lineHeight:1.4,fontWeight:600,fontFamily:"'Playfair Display',serif" }}>"{act}"</div>
          </div>

          {!summary && (
            <div style={{ padding:"12px 22px",borderBottom:"1px solid #1e1e2e",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div>
                <div style={{ fontSize:10,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".12em",marginBottom:3 }}>Your Time</div>
                <div style={{ fontSize:12,color:"#5a5868" }}>{debateStarted ? "Per argument" : "Starts with the debate"}</div>
                {bonusNext && <div style={{ fontSize:11,color:"#4ade80",fontWeight:700,marginTop:4 }}>✨ 2x points active</div>}
              </div>
              {timerActive && !loading && debateStarted
                ? <Timer key={timerKey} seconds={timeLimit} onExpire={() => send(true)} />
                : <RingTimer left={timeLimit} total={timeLimit} idle />}
            </div>
          )}

          <div style={{ flex:1,padding:"14px 22px",display:"flex",flexDirection:"column",gap:12,minHeight:0 }}>
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".12em",marginBottom:8 }}>Argument Score</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {[["🟢","Strong","8-10","#4ade80"],["🟡","Solid","6-7",G],["🟠","Weak","4-5","#fb923c"],["🔴","Poor","1-3","#f87171"]].map(([dot, l, r, col]) => (
                  <div key={l} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 9px",background:"rgba(255,255,255,.02)",borderRadius:8,border:"1px solid #1e1e2e" }}>
                    <span style={{ fontSize:12 }}>{dot}</span>
                    <span style={{ fontSize:13,color:col,fontWeight:700 }}>{l}</span>
                    <span style={{ fontSize:12,color:"#6b6860",marginLeft:"auto" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Live match stats */}
            <div>
              <div style={{ fontSize:10,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".12em",marginBottom:8 }}>This Match</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {[
                  ["Best", scores.length ? Math.max(...scores) + "/10" : "—", scores.length ? sc(Math.max(...scores)) : "#5a5868"],
                  ["Last", scores.length ? scores[scores.length-1] + "/10" : "—", scores.length ? sc(scores[scores.length-1]) : "#5a5868"],
                  ["Hints", maxHints > 0 ? `${hintsLeft} left` : "none", hintsLeft > 0 ? "#a89eed" : "#5a5868"],
                  ["Timeouts", `${timeouts}/2`, timeouts > 0 ? "#f87171" : "#5a5868"],
                ].map(([label, val, col]) => (
                  <div key={label} style={{ padding:"8px 10px",background:"rgba(255,255,255,.02)",border:"1px solid #1e1e2e",borderRadius:8,textAlign:"center" }}>
                    <div style={{ fontSize:10,color:"#5a5868",textTransform:"uppercase",letterSpacing:".08em",fontWeight:600,marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:15,fontWeight:700,color:col }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex:1,minHeight:0 }}>
              <div style={{ fontSize:10,fontWeight:700,color:G,textTransform:"uppercase",letterSpacing:".12em",marginBottom:8 }}>Tips</div>
              {["Use real-world examples","Address Claude's specific point","Ask 'why?' to expose weak logic"].map(tip => (
                <div key={tip} style={{ fontSize:13,color:"#8a8680",marginBottom:6,padding:"7px 12px",paddingLeft:12,borderLeft:"2px solid #534AB7",background:"rgba(83,74,183,.06)",borderRadius:"0 8px 8px 0",lineHeight:1.4 }}>{tip}</div>
              ))}
            </div>
          </div>

          {/* Points reveal — only after debate ends */}
          {summary && pendingResult && (
            <div style={{ padding:"14px 22px",borderTop:"1px solid #1e1e2e",background:"rgba(201,168,76,.04)" }}>
              {!pointsRevealed ? (
                <button onClick={revealPoints} className="bhov" style={{ width:"100%",padding:"14px",background:`linear-gradient(135deg,${G},#b8962e)`,color:"#0a0a0f",border:"none",borderRadius:11,fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:".03em",animation:"revealGlow 1.6s ease-in-out infinite" }}>
                  🎲 Reveal Your Points
                </button>
              ) : (() => {
                const rc = pendingResult.delta>0?"#4ade80":pendingResult.delta<0?"#f87171":"#9a9690";
                return (
                <div style={{ textAlign:"center",position:"relative" }}>
                  <div style={{ position:"absolute",top:"50%",left:"50%",width:120,height:120,marginLeft:-60,marginTop:-60,borderRadius:"50%",border:`3px solid ${rc}`,animation:"flashRing .8s ease-out forwards",pointerEvents:"none" }} />
                  <div style={{ fontSize:10,color:"#5a5868",textTransform:"uppercase",letterSpacing:".12em",fontWeight:700,marginBottom:4 }}>Result</div>
                  <div style={{ fontSize:40,fontWeight:900,color:rc,lineHeight:1.05,animation:"resultPop .7s cubic-bezier(.2,1.4,.4,1) forwards, resultGlow 1s ease-out forwards" }}>
                    {pendingResult.delta>0?"+":""}{pendingResult.delta} <span style={{ fontSize:18 }}>pts</span>
                  </div>
                  {pendingResult.bonusApplied && <div style={{ fontSize:12,color:G,fontWeight:700,marginTop:5,animation:"msgIn .5s ease .3s both" }}>✨ 2x bonus applied!</div>}
                  {pendingResult.bonusEarned && <div style={{ fontSize:12,color:"#4ade80",fontWeight:600,marginTop:5,animation:"msgIn .5s ease .4s both" }}>9+ avg — next debate is 2x!</div>}
                  {pendingResult.delta===0 && !pendingResult.eligibleForGains && <div style={{ fontSize:12,color:"#6b6860",marginTop:5 }}>Under 5 rounds — no gain</div>}
                </div>
                );
              })()}
            </div>
          )}

          <div style={{ padding:"14px 22px",borderTop:"1px solid #1e1e2e",background:"rgba(10,10,16,0.5)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:18 }}>{level.icon}</span>
                <span style={{ fontSize:15,fontWeight:700,color:level.color }}>{level.name}</span>
              </div>
              <span style={{ fontSize:13,color:"#5a5868" }}>{rating} pts</span>
            </div>
            <div style={{ height:7,background:"#1e1e2e",borderRadius:4,overflow:"hidden",marginBottom:5 }}>
              <div style={{ height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${level.color}88,${level.color})`,borderRadius:4,transition:"width 1s ease",boxShadow:`0 0 10px ${level.color}88` }} />
            </div>
            {nxt && <div style={{ fontSize:13,color:"#5a5868",textAlign:"center",fontWeight:500 }}>{nxt.min - rating} pts to {nxt.name}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
