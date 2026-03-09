import { useState, useEffect, useCallback } from 'react';

// 1. SETTINGS
const API_URL = "https://script.google.com/macros/s/AKfycbx0_RWArrp25arGOcJlIzl6_7HLbEqS96ZgLlWuRqqHb3gMBCeuKQtp6zv1wqCz-QG2YQ/exec"; // KEEP YOUR URL HERE
const ADMIN_PIN = "7777";
const TEAM_PINS = { 1: "1111", 2: "2222", 3: "3333" };

const TEAM_COLORS = [
  { id: 1, color: "bg-white text-black border-slate-300", raw: "bg-white" },
  { id: 2, color: "bg-red-600 text-white border-red-800", raw: "bg-red-600" },
  { id: 3, color: "bg-blue-500 text-white border-blue-700", raw: "bg-blue-500" }
];

const EFFECT_OPTIONS = [
  { id: "NITRO", label: "+2 Pts for 3 Qs" }, { id: "FREEZE", label: "Freeze Team (2 Qs)" },
  { id: "TAXMAN", label: "Steal 1 Pt from All" }, { id: "CHEAT", label: "Cheat Code (Highlight Ans)" },
  { id: "SHORT", label: "Lose 3 Points" }, { id: "EMP", label: "EMP Blast (Disable All)" },
  { id: "OVERCLOCK", label: "+3 Pts Next Q" }, { id: "SABOTAGE", label: "Sabotage (Auto-Wrong)" },
  { id: "TIMEWARP", label: "Time Warp (Halve Timer)" }, { id: "ADRENALINE", label: "Adrenaline (+1 Pt Auto)" },
  { id: "SWAP", label: "Swap with 1st Place" }, { id: "VIRUS", label: "Randomize Scores" },
  { id: "DIVINE", label: "Take the Lead (+5)" }, { id: "CRASH", label: "Reset All Scores to 0" },
  { id: "RAFFLE", label: "Shuffle All Scores" }
];

const getTeamConfig = (id, gameData) => ({
  ...TEAM_COLORS.find(t => t.id === id),
  name: gameData.teamNames?.[id] || `Team ${id}`
});

// eslint-disable-next-line react-refresh/only-export-components
function PlayerHeader({ teamId, score, questionIndex, timer, isConnected, gameData }) {
  const team = getTeamConfig(teamId, gameData);
  return (
    <div className="bg-black border-b border-slate-800 p-4 flex justify-between items-center font-sans">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-600 animate-pulse shadow-red-600/50'}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${team.color}`}>{team.name}</span>
        </div>
        <span className="text-2xl font-black text-white">{score} <span className="text-xs text-emerald-500">PTS</span></span>
      </div>
      <div className={`px-4 py-1 rounded-lg font-mono font-black text-2xl border-2 ${timer < 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-white border-slate-700'}`}>
        :{timer < 10 ? `0${timer}` : timer}
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
          {questionIndex < 5 ? 'ROUND 1' : questionIndex < 10 ? 'ROUND 2' : 'ROUND 3'}
        </span>
        <span className="text-xl font-black text-yellow-500 italic">Q{Math.min(questionIndex + 1, gameData.questions?.length || 15)}</span>
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function AdminDashboard({ gameData, onClose }) {
  const [tab, setTab] = useState('questions');
  const [qs, setQs] = useState(gameData.questions || []);
  const [cards, setCards] = useState(gameData.cards || { easy: {}, medium: {}, hard: {} });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await fetch(API_URL, { 
      method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, 
      body: JSON.stringify({ action: 'SAVE_CONFIG', questions: qs, cards }) 
    });
    setTimeout(() => { setIsSaving(false); onClose(); }, 1000);
  };

  return (
    <div className="h-screen bg-slate-950 text-white p-10 overflow-y-auto font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex gap-6 items-center">
          <h1 className="text-4xl font-black italic text-emerald-500 mr-4">⚙️ Engine Editor</h1>
          <button onClick={() => setTab('questions')} className={`font-bold px-4 py-2 rounded-xl transition-all ${tab === 'questions' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>Questions</button>
          <button onClick={() => setTab('cards')} className={`font-bold px-4 py-2 rounded-xl transition-all ${tab === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-900'}`}>Destiny Cards</button>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 rounded font-bold hover:bg-slate-700">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-emerald-600 rounded font-bold hover:bg-emerald-500">{isSaving ? 'Saving...' : 'Save All & Exit'}</button>
        </div>
      </div>

      {tab === 'questions' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {qs.map((q, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-700 relative">
              <button onClick={() => setQs(qs.filter((_, idx) => i !== idx))} className="absolute top-4 right-4 text-red-500 font-bold text-xs uppercase">Remove</button>
              <p className="text-emerald-500 font-bold mb-2 uppercase text-xs">Question {i + 1}</p>
              <input type="text" value={q.q} onChange={e => { const n = [...qs]; n[i].q = e.target.value; setQs(n); }} placeholder="Enter Question text..." className="w-full bg-slate-950 border border-slate-700 p-3 rounded mb-4 font-bold outline-none"/>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[0,1,2,3].map(optIdx => (
                  <div key={optIdx} className="flex gap-2 items-center"><span className="text-slate-500 font-bold w-4">{optIdx+1}.</span><input type="text" value={q.options[optIdx]} onChange={e => { const n = [...qs]; n[i].options[optIdx] = e.target.value; setQs(n); }} className="flex-1 bg-slate-950 border border-slate-700 p-2 rounded text-sm outline-none"/></div>
                ))}
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><span className="text-slate-400 text-sm font-bold">Answer:</span><select value={q.a} onChange={e => { const n = [...qs]; n[i].a = e.target.value; setQs(n); }} className="bg-slate-950 border border-slate-700 p-2 rounded font-bold outline-none"><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option><option value="4">Option 4</option></select></div>
                <div className="flex items-center gap-2"><span className="text-slate-400 text-sm font-bold">Timer (Secs):</span><input type="number" value={q.timeLimit || 30} onChange={e => { const n = [...qs]; n[i].timeLimit = Number(e.target.value); setQs(n); }} className="w-20 bg-slate-950 border border-slate-700 p-2 rounded font-bold outline-none text-center"/></div>
              </div>
            </div>
          ))}
          <button onClick={() => setQs([...qs, { q: "", a: "1", options: ["", "", "", ""], timeLimit: 30 }])} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 font-bold hover:border-emerald-500 hover:text-emerald-500 transition-all">+ Add Question</button>
        </div>
      )}

      {tab === 'cards' && (
        <div className="max-w-5xl mx-auto grid gap-10">
          {['easy', 'medium', 'hard'].map(level => (
            <div key={level}>
              <h2 className="text-2xl font-black uppercase text-yellow-500 mb-4 border-b border-slate-800 pb-2">{level} ROUND CARDS</h2>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(num => {
                  const card = cards[level]?.[num] || { name: "", effectId: "NITRO", desc: "", type: "up" };
                  return (
                    <div key={num} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Card #{num}</span>
                      <input type="text" placeholder="Card Name" value={card.name} onChange={e => setCards({...cards, [level]: {...cards[level], [num]: {...card, name: e.target.value}}})} className="bg-slate-950 border border-slate-700 p-2 rounded text-sm font-bold w-full outline-none"/>
                      <select value={card.effectId} onChange={e => setCards({...cards, [level]: {...cards[level], [num]: {...card, effectId: e.target.value}}})} className="bg-slate-950 border border-slate-700 p-2 rounded text-xs w-full outline-none">
                        {EFFECT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                      </select>
                      <input type="text" placeholder="Short Desc" value={card.desc} onChange={e => setCards({...cards, [level]: {...cards[level], [num]: {...card, desc: e.target.value}}})} className="bg-slate-950 border border-slate-700 p-2 rounded text-xs w-full outline-none text-slate-400"/>
                      <select value={card.type} onChange={e => setCards({...cards, [level]: {...cards[level], [num]: {...card, type: e.target.value}}})} className="bg-slate-950 border border-slate-700 p-2 rounded text-xs w-full outline-none">
                        <option value="up">Buff (Green)</option><option value="down">Debuff (Red)</option><option value="chaos">Chaos (Purple)</option>
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function ProjectorView() {
  const [gameData, setGameData] = useState({ scores: {}, questionIndex: 0, state: 'LOBBY', joinedStatus: {}, answeredStatus: {}, powerLog: "", revealed: "", pickers: "", statuses: {}, pausedTime: 0, questions: [], teamNames: {} });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminRevealedCards, setAdminRevealedCards] = useState([]); // NEW STATE: For Thrill reveals

  const totalQuestions = gameData.questions?.length || 15;
  const isGameOver = gameData.state === 'VICTORY';
  const isDestinyPhase = gameData.state === 'DESTINY';
  const isPaused = gameData.state === 'PAUSED';
  const joinedCount = Object.values(gameData.joinedStatus || {}).filter(v => v !== "").length;
  const answeredCount = Object.values(gameData.answeredStatus || {}).filter(v => v === true).length;
  
  const activeDeck = gameData.cards || {};
  let activeCards = activeDeck.easy || {};
  if (gameData.questionIndex >= 5) activeCards = activeDeck.medium || {};
  if (gameData.questionIndex >= 10) activeCards = activeDeck.hard || {};

  const pickerMap = {};
  if (gameData.pickers) String(gameData.pickers).split(',').forEach(pair => { const [tid, cid] = pair.split(':'); pickerMap[cid] = Number(tid); });

  // Reset Admin Reveals when leaving Destiny Phase
  useEffect(() => {
    if (gameData.state !== 'DESTINY') {
      setAdminRevealedCards([]);
    }
  }, [gameData.state]);

  useEffect(() => {
    const sync = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}?t=${Date.now()}`);
        const data = await res.json();
        setGameData(data);
      } catch (e) { console.error("Sync error:", e); }
    }, 2000);
    return () => clearInterval(sync);
  }, []);

  const handleAutoAdvance = useCallback(async () => {
    setIsTransitioning(true);
    const qIndex = gameData.questionIndex;
    const isEndOfRound = (qIndex === 4 || qIndex === 9 || qIndex === totalQuestions - 1); 
    
    setTimeout(async () => {
      if (isEndOfRound && gameData.state === 'RACING') {
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'UPDATE_GAME', state: 'DESTINY' }) });
      } else {
        const nextIdx = qIndex + 1;
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'UPDATE_GAME', state: 'RACING', questionIndex: nextIdx }) });
      }
      setIsTransitioning(false);
      setTimeLeft(gameData.questions?.[qIndex + 1]?.timeLimit || 30);
    }, 3000); 
  }, [gameData, totalQuestions]);

  useEffect(() => {
    if (gameData.state === 'PAUSED') { setTimeLeft(gameData.pausedTime); return; }
    if (gameData.state !== 'RACING' || isTransitioning || isGameOver || isAdminOpen) return;
    if (timeLeft <= 0 || (joinedCount > 0 && answeredCount >= joinedCount)) {
      setTimeout(handleAutoAdvance, 0); 
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameData.state, answeredCount, joinedCount, isGameOver, isTransitioning, handleAutoAdvance, gameData.pausedTime, isAdminOpen]);

  const togglePause = () => {
    if (gameData.state === 'RACING') fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'PAUSE', timeLeft }) });
    else if (gameData.state === 'PAUSED') fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'RESUME' }) });
  };

  const startRace = async () => {
    if(!gameData.questions || gameData.questions.length === 0) return alert("Please add questions in the Admin panel first!");
    setIsTransitioning(true);
    setTimeout(async () => {
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'UPDATE_GAME', state: 'RACING', questionIndex: 0 }) });
      setIsTransitioning(false);
      setTimeLeft(gameData.questions[0].timeLimit || 30);
    }, 2000);
  };

  const startNextRound = async () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      if (gameData.questionIndex >= totalQuestions - 1) {
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'UPDATE_GAME', state: 'VICTORY' }) });
      } else {
        const nextIdx = gameData.questionIndex + 1;
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'UPDATE_GAME', state: 'RACING', questionIndex: nextIdx, resetBoard: true }) });
        setTimeLeft(gameData.questions[nextIdx]?.timeLimit || 30);
      }
      setIsTransitioning(false);
    }, 2000);
  };

  if (isAdminOpen) return <AdminDashboard gameData={gameData} onClose={() => setIsAdminOpen(false)} />;
  if (isTransitioning) return <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white"><div className="w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div><h1 className="text-6xl font-black italic animate-pulse tracking-widest text-emerald-400">LOADING...</h1></div>;

  if (gameData.state === 'LOBBY') return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans relative">
      <button onClick={() => { if(window.prompt("Enter Admin PIN:") === ADMIN_PIN) setIsAdminOpen(true); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all font-bold uppercase tracking-widest text-xs">⚙️ Admin Panel</button>
      <h1 className="text-6xl font-black italic text-emerald-500 mb-4 uppercase tracking-tighter">Pre-Race Paddock</h1>
      <p className="text-slate-500 mb-10 font-bold uppercase tracking-[0.2em]">{gameData.questions?.length || 0} Questions Loaded</p>
      <div className="grid grid-cols-3 gap-8 mb-12">
        {[1,2,3].map(id => {
          const team = getTeamConfig(id, gameData);
          const isReady = gameData.joinedStatus?.[id] !== "" && gameData.joinedStatus?.[id] !== undefined;
          return <div key={id} className={`p-8 rounded-3xl border-4 flex flex-col items-center shadow-xl ${isReady ? 'border-emerald-500 bg-emerald-500/20 scale-105' : 'border-slate-800 opacity-30 grayscale'}`}><div className={`w-6 h-6 rounded-full mb-4 ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div><span className="font-black text-2xl uppercase text-center">{team.name}</span></div>
        })}
      </div>
      <button disabled={joinedCount < 3 || !gameData.questions?.length} onClick={startRace} className={`px-24 py-6 rounded-2xl text-3xl font-black transition-all ${joinedCount >= 3 && gameData.questions?.length ? 'bg-emerald-600 hover:bg-emerald-500 shadow-2xl active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>START RACE →</button>
    </div>
  );

  if (isGameOver) {
    const sortedTeams = [1,2,3].map(id => getTeamConfig(id, gameData)).sort((a,b) => (gameData.scores[b.id]||0) - (gameData.scores[a.id]||0));
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <h1 className="text-8xl font-black text-yellow-500 mb-10 italic animate-bounce uppercase">VICTORY</h1>
        {sortedTeams.map((t, i) => (
          <div key={t.id} className={`${i === 0 ? 'text-5xl text-yellow-400' : 'text-3xl opacity-80'} font-black mb-4 ${t.color} p-6 rounded-2xl`}>{i+1}. {t.name} - {gameData.scores[t.id]||0} PTS</div>
        ))}
      </div>
    );
  }

  if (isDestinyPhase) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans">
      <h1 className="text-6xl font-black italic text-yellow-500 mb-12 uppercase tracking-tighter">CHOOSE DESTINY</h1>
      <div className="grid grid-cols-5 gap-6 w-full max-w-6xl">
        {Object.keys(activeCards).map((key) => {
          const num = String(key);
          const cData = activeCards[num] || { name: "", desc: "", type: "up" };
          const teamWhoPicked = pickerMap[num];
          const team = teamWhoPicked ? getTeamConfig(teamWhoPicked, gameData) : null;
          
          const isAdminRevealed = adminRevealedCards.includes(num);
          
          let cardColor = "bg-emerald-600 border-emerald-400";
          if (cData.type === 'down') cardColor = "bg-red-700 border-red-500";
          if (cData.type === 'chaos') cardColor = "bg-purple-700 border-purple-500";

          // Gray out cards that were purely revealed by the Admin
          if (!team && isAdminRevealed) {
            cardColor = "bg-slate-700 border-slate-500 grayscale opacity-80";
          }

          return (
            <div 
              key={num} 
              onClick={() => {
                // Admin can only flip unpicked cards
                if (!team && !isAdminRevealed) {
                  setAdminRevealedCards(prev => [...prev, num]);
                }
              }}
              className={`h-48 rounded-[2rem] border-4 flex flex-col items-center justify-center transition-all duration-500 
                ${team || isAdminRevealed ? `${cardColor} scale-105 shadow-xl` : 'bg-slate-900 border-slate-800 opacity-50 cursor-pointer hover:opacity-100 hover:scale-95'}`}
            >
              {team ? (
                <div className="text-center p-4 animate-bounce">
                  <span className="block text-[10px] font-black bg-black/40 px-2 py-1 rounded mb-2 uppercase text-white">{team.name}</span>
                  <span className="block text-2xl font-black uppercase italic leading-none">{cData.name}</span>
                  <span className="block text-[10px] font-bold uppercase mt-2 opacity-80">{cData.desc}</span>
                </div>
              ) : isAdminRevealed ? (
                <div className="text-center p-4">
                  <span className="block text-[10px] font-black bg-slate-900/50 px-2 py-1 rounded mb-2 uppercase text-slate-400 tracking-widest">MISSED</span>
                  <span className="block text-2xl font-black uppercase italic leading-none text-slate-300">{cData.name}</span>
                  <span className="block text-[10px] font-bold uppercase mt-2 opacity-60 text-slate-400">{cData.desc}</span>
                </div>
              ) : <span className="text-6xl font-black text-slate-800 pointer-events-none">#{num}</span>}
            </div>
          );
        })}
      </div>
      <div className="h-20 mt-10 text-3xl font-black text-emerald-400 animate-pulse uppercase italic">{gameData.powerLog}</div>
      <button onClick={startNextRound} className="bg-white text-black font-black text-2xl px-16 py-6 rounded-2xl hover:bg-emerald-400 mt-6 shadow-2xl active:scale-95">COMMENCE ROUND →</button>
    </div>
  );

  const currentQ = gameData.questions?.[gameData.questionIndex] || { q: "Loading...", options: ["","","",""] };
  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      <div className="w-[70%] p-12 flex flex-col border-r-4 border-slate-900 bg-slate-900/30">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black italic text-emerald-500 uppercase tracking-tighter">Defense Race</h1>
          <div className="flex gap-4 items-center">
            {isPaused && <span className="text-red-500 font-black animate-pulse tracking-widest text-xl">PAUSED</span>}
            <div className={`text-6xl font-mono font-black border-4 px-6 py-2 rounded-2xl ${timeLeft < 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-white border-slate-700'}`}>:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
          </div>
        </div>
        <div className={`bg-slate-800 p-10 rounded-3xl border-2 border-slate-700 flex-grow flex flex-col justify-center shadow-2xl transition-all ${isPaused ? 'opacity-50 grayscale blur-sm' : ''}`}>
          <p className="text-xl text-slate-400 mb-4 font-bold uppercase tracking-widest">Question {gameData.questionIndex + 1}</p>
          <h2 className="text-4xl font-extrabold mb-10 leading-tight">{currentQ.q}</h2>
          <div className="grid grid-cols-2 gap-6">
            {currentQ.options.map((opt, i) => (
              <div key={i} className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700 text-2xl font-bold shadow-lg"><span className="text-emerald-500 mr-4 font-black">{i + 1}.</span> {opt}</div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={handleAutoAdvance} className="text-slate-500 font-bold hover:text-white uppercase tracking-widest text-xs">Skip →</button>
          <button onClick={togglePause} className={`${isPaused ? 'bg-emerald-600 text-white' : 'bg-yellow-600 text-black'} font-black px-6 py-2 rounded uppercase text-xs tracking-widest hover:scale-105 transition-all`}>{isPaused ? 'Resume Match' : 'Pause Match'}</button>
        </div>
      </div>
      <div className="w-[30%] p-6 bg-black flex flex-col">
        <h3 className="text-center font-black text-slate-600 mb-8 uppercase tracking-widest pb-2 border-b border-slate-800">Standings</h3>
        {[1,2,3].map((id) => {
          const t = getTeamConfig(id, gameData);
          return (
            <div key={t.id} className="mb-8">
              <div className="flex justify-between text-xs font-black mb-2 uppercase items-center">
                <span className="truncate w-32">{t.name} {gameData.answeredStatus?.[t.id] === true && <span className="text-emerald-500 text-lg ml-1">✓</span>}</span>
                <span className="text-emerald-400 bg-slate-900 px-2 py-1 rounded">{gameData.scores[t.id] || 0} PTS</span>
              </div>
              <div className="h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                <div className={`h-full transition-all duration-1000 ${t.raw} border-r-2 border-white`} style={{ width: `${((gameData.scores[t.id] || 0) / 20) * 100}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function PlayerView() {
  const [teamId, setTeamId] = useState(() => localStorage.getItem('myDefenseTeam') ? Number(localStorage.getItem('myDefenseTeam')) : null);
  const [gameData, setGameData] = useState({ scores: {}, state: 'LOBBY', questionIndex: 0, joinedStatus: {}, answeredStatus: {}, revealed: "", powerLog: "", statuses: {}, pausedTime: 0, questions: [], teamNames: {} });
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [powerUsedRound, setPowerUsedRound] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [localAnswerStatus, setLocalAnswerStatus] = useState("WAITING");

  const currentQ = gameData.questions?.[gameData.questionIndex] || { q: "Loading...", options: ["","","",""], timeLimit: 30 };
  const baseTime = Number(currentQ.timeLimit) || 30;

  useEffect(() => {
    const sync = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}?t=${Date.now()}`);
        const data = await res.json();
        setGameData(data);
        setIsConnected(true);
        if (data.questionIndex !== currentQIndex) { 
          setCurrentQIndex(data.questionIndex); 
          const newBase = Number(data.questions?.[data.questionIndex]?.timeLimit) || 30;
          setTimeLeft(data.statuses?.[teamId]?.timeWarp > 0 ? Math.ceil(newBase / 2) : newBase);
          setLocalAnswerStatus("WAITING"); 
        }
      } catch (e) { 
        setIsConnected(false);
        console.error(e); 
      }
    }, 2000);
    return () => clearInterval(sync);
  }, [currentQIndex, teamId]);

  const serverStatus = gameData.answeredStatus?.[teamId];
  const isWaiting = (serverStatus !== true) && (localAnswerStatus === "WAITING");
  const isPaused = gameData.state === 'PAUSED';

  useEffect(() => {
    if (isPaused) { setTimeLeft(gameData.pausedTime); return; }
    if (gameData.state !== 'RACING' || !isWaiting) return;
    const myStatus = gameData.statuses?.[teamId] || {};
    
    if (myStatus.timeWarp > 0 && timeLeft <= Math.floor(baseTime / 2) + 1) {
      setLocalAnswerStatus("WRONG"); 
      fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'WRONG_ANSWER', teamId }) });
    }
    
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [gameData.state, isWaiting, timeLeft, teamId, gameData.statuses, isPaused, gameData.pausedTime, baseTime]);

  const joinTeam = (id) => {
    const pin = window.prompt(`Enter PIN for Team ${id}:`);
    if (pin === TEAM_PINS[id]) {
      const tName = window.prompt("Customize your Team Name:", `Team ${id}`) || `Team ${id}`;
      setTeamId(id);
      localStorage.setItem('myDefenseTeam', id);
      fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'JOIN_TEAM', teamId: id, teamName: tName.substring(0, 15) }) });
    } else if (pin !== null) {
      alert("Incorrect PIN!");
    }
  };

  const handlePress = useCallback(async (key) => {
    const status = gameData.statuses?.[teamId] || {};
    if (!isWaiting || isSending || !teamId || gameData.state !== 'RACING' || status.frozen > 0 || isPaused) return;
    setIsSending(true);
    
    let isCorrectLocal = key === String(gameData.correctKey);
    if (status.sabotage > 0) isCorrectLocal = false; 
    setLocalAnswerStatus(isCorrectLocal ? "CORRECT" : "WRONG");

    const actionToSend = isCorrectLocal ? 'ADD_POINT' : 'WRONG_ANSWER';
    await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: actionToSend, teamId }) });
    setTimeout(() => setIsSending(false), 2000); 
  }, [isWaiting, isSending, teamId, gameData, isPaused]);

  useEffect(() => {
    const handleKey = (e) => ['1','2','3','4'].includes(e.key) && handlePress(e.key);
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, [handlePress]);

  if (!teamId) return (
    <div className="h-screen bg-slate-950 text-white p-6 flex flex-col justify-center font-sans">
      <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-slate-600"><div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div> {isConnected ? 'ONLINE' : 'OFFLINE'}</div>
      <h2 className="text-4xl font-black mb-10 italic uppercase text-center border-b-4 border-emerald-500 pb-2">Choose Car</h2>
      <div className="grid gap-4 max-w-xs mx-auto w-full">
        {[1,2,3].map(id => {
          const t = getTeamConfig(id, gameData);
          const isTakenByOther = Boolean(gameData.joinedStatus?.[id]); 
          return <button key={id} disabled={isTakenByOther} onClick={() => joinTeam(id)} className={`p-6 rounded-2xl font-black text-2xl border-b-8 shadow-lg transition-all active:scale-95 ${t.color} ${isTakenByOther ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}>{t.name} {isTakenByOther && <span className="text-[10px] uppercase ml-2 opacity-60">Taken</span>}</button>
        })}
      </div>
    </div>
  );

  const isGameOver = gameData.state === 'VICTORY';
  if (isGameOver) return <div className="h-screen bg-slate-950 flex items-center justify-center text-white"><h1 className="text-6xl font-black italic text-yellow-500 uppercase tracking-tighter">RACE OVER</h1></div>;

  if (gameData.state === 'LOBBY') return <div className="h-screen bg-slate-950 flex items-center justify-center text-white"><div className="w-20 h-20 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin absolute mb-32"></div><h1 className="text-5xl font-black italic text-emerald-500 uppercase tracking-tighter mt-16">In Paddock</h1></div>;

  if (gameData.state === 'DESTINY') {
    const revealedArray = gameData.revealed ? String(gameData.revealed).split(',') : [];
    const activeDeck = gameData.cards || {};
    let activeCards = activeDeck.easy || {};
    if (gameData.questionIndex >= 5) activeCards = activeDeck.medium || {};
    if (gameData.questionIndex >= 10) activeCards = activeDeck.hard || {};

    if (powerUsedRound === gameData.questionIndex) return <div className="h-screen bg-slate-900 text-white flex flex-col"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={0} isConnected={isConnected} gameData={gameData} /><div className="flex-1 flex flex-col items-center justify-center text-center p-10"><h2 className="text-4xl font-black italic text-slate-500 mb-4 uppercase">Choice Locked</h2><p className="font-bold tracking-widest text-emerald-500 uppercase">Look at the Projector!</p></div></div>;
    return (
      <div className="h-screen bg-indigo-950 flex flex-col text-white font-sans">
        <PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={0} isConnected={isConnected} gameData={gameData} />
        <div className="flex-1 flex flex-col p-6 justify-center">
          <h2 className="text-3xl font-black italic text-yellow-400 mb-8 uppercase text-center">Pick Destiny</h2>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
            {Object.keys(activeCards).map(key => {
              const num = String(key);
              return <button key={num} disabled={revealedArray.includes(num)} onClick={() => {setPowerUsedRound(gameData.questionIndex); fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'REVEAL_CARD', teamId, cardNum: num, cardName: activeCards[num].name, effectId: activeCards[num].effectId }) });}} className="bg-slate-800 rounded-2xl font-black text-4xl py-8 border-b-8 border-black disabled:opacity-10 active:translate-y-2 active:border-b-0 transition-all">{num}</button>
            })}
          </div>
        </div>
      </div>
    );
  }

  const myStatus = gameData.statuses?.[teamId] || {};
  if (myStatus.frozen > 0) return <div className="h-screen bg-cyan-950 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} isConnected={isConnected} gameData={gameData} /><div className="flex-1 flex flex-col items-center justify-center text-center p-10"><h1 className="text-5xl font-black italic text-cyan-400 mb-4 uppercase leading-none">System Frozen</h1><p className="font-bold uppercase tracking-widest text-cyan-700">Affected by EMP/Red Flag</p></div></div>;
  if (isPaused) return <div className="h-screen bg-yellow-900 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} isConnected={isConnected} gameData={gameData} /><div className="flex-1 flex items-center justify-center text-center"><h1 className="text-6xl font-black italic uppercase tracking-tighter">Paused</h1></div></div>;
  
  if (localAnswerStatus === 'WRONG') return <div className="h-screen bg-red-950 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} isConnected={isConnected} gameData={gameData} /><div className="flex-1 flex items-center justify-center text-center"><h1 className="text-6xl font-black italic uppercase leading-none">Stalled</h1></div></div>;
  if (localAnswerStatus === 'CORRECT') return <div className="h-screen bg-emerald-900 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} isConnected={isConnected} gameData={gameData} /><div className="flex-1 flex items-center justify-center animate-pulse text-center"><h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Locked In</h1></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      <PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} isConnected={isConnected} gameData={gameData} />
      <div className="p-6 bg-slate-800 border-b-4 border-slate-950 shadow-xl z-10">
        <p className="text-xs font-black text-emerald-500 mb-2 uppercase tracking-widest">Question {gameData.questionIndex + 1}</p>
        <h3 className="text-lg font-bold leading-tight">{currentQ.q}</h3>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-black/60">
        {['A', 'B', 'C', 'D'].map((l, i) => {
          const isCheatHighlighted = myStatus.cheat > 0 && String(i+1) === String(gameData.correctKey); 
          return (
            <button key={l} onClick={() => handlePress(String(i+1))} className={`${isCheatHighlighted ? 'bg-emerald-600 border-emerald-800' : 'bg-slate-800 border-slate-950'} rounded-3xl flex flex-col items-center justify-center border-b-[8px] active:translate-y-2 active:border-b-[2px] transition-all shadow-xl`}>
              <span className="text-5xl font-black mb-2">{l}</span>
              <span className="text-xl font-bold opacity-80 uppercase px-4 text-center leading-tight">{currentQ.options[i]}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}

// --- 3. MAIN ROUTER ---
export default function App() {
  const path = window.location.pathname;

  const requestAdmin = (targetPath) => {
    const pin = window.prompt("Enter Admin PIN to access Projector:");
    if (pin === ADMIN_PIN) {
      window.location.pathname = targetPath;
    } else if (pin !== null) {
      alert("Access Denied.");
    }
  };

  const handleInit = async () => {
    const pin = window.prompt("Enter Admin PIN to Reset Game:");
    if (pin === ADMIN_PIN) {
      await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'RESET' }) }); 
      setTimeout(() => window.location.pathname = '/projector', 500);
    } else if (pin !== null) {
      alert("Access Denied.");
    }
  };

  if (path === '/projector') return <ProjectorView />;
  if (path === '/player') return <PlayerView />;
  
  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 text-center font-sans">
      <h1 className="text-8xl font-black italic tracking-tighter mb-4 uppercase leading-none">Defense <span className="text-emerald-500">Race</span></h1>
      <p className="text-slate-600 mb-12 font-bold tracking-[0.4em] uppercase text-xs">Automated Game Engine</p>
      
      <div className="flex gap-4">
        <button onClick={() => window.location.pathname = '/player'} className="bg-slate-800 py-6 px-10 rounded-2xl font-black text-xl hover:bg-slate-700 transition-all uppercase shadow-lg">Join Game</button>
        <button onClick={() => requestAdmin('/projector')} className="bg-slate-800 py-6 px-10 rounded-2xl font-black text-xl hover:bg-slate-700 transition-all uppercase shadow-lg">Projector</button>
      </div>
      
      <button onClick={handleInit} className="mt-8 text-slate-600 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-red-500 transition-all">Initialize Engine (Admin Only)</button>
    </div>
  );
} 