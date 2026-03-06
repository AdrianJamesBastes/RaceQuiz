import { useState, useEffect, useCallback } from 'react';

// 1. SETTINGS
const API_URL = "https://script.google.com/macros/s/AKfycbzDpknM5pO90KHY-UnDS5rHUYiGxO50ous2WFLtQA3G7MfFqC_MgHR2F_fA5Nfj4m5U6Q/exec";

const getDeviceId = () => {
  let id = localStorage.getItem('myDefenseDeviceId');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('myDefenseDeviceId', id);
  }
  return id;
};

const TEAM_CONFIG = [
  { id: 1, name: "Team 1", color: "bg-white text-black border-slate-300", raw: "bg-white" },
  { id: 2, name: "Team 2", color: "bg-red-600 text-white border-red-800", raw: "bg-red-600" },
  { id: 3, name: "Team 3", color: "bg-blue-500 text-white border-blue-700", raw: "bg-blue-500" },
  { id: 4, name: "Team 4", color: "bg-yellow-400 text-black border-yellow-600", raw: "bg-yellow-400" },
  { id: 5, name: "Team 5", color: "bg-emerald-500 text-white border-emerald-700", raw: "bg-emerald-500" },
];

const DESTINY_CARDS = {
  1: { name: "Nitro Boost", effect: "+2 Pts for 3 Qs", type: "up" },
  2: { name: "Red Flag", effect: "Frozen for 2 Qs", type: "down" },
  3: { name: "Swap Meet", effect: "Swap Score Up", type: "chaos" },
  4: { name: "Adware", effect: "Buttons Scrambled", type: "down" },
  5: { name: "Ghost Mode", effect: "Immune to Debuffs", type: "up" },
  6: { name: "The Taxman", effect: "Steal 1 Pt from All", type: "up" },
  7: { name: "Blue Screen", effect: "Score Cut in Half", type: "down" },
  8: { name: "Cheat Code", effect: "Reveal 3 Answers", type: "up" },
  9: { name: "Short Circuit", effect: "Lose 3 Points", type: "down" },
  10: { name: "The Jackpot", effect: "Gain +5 Points", type: "up" },
};

const QUESTIONS = [
  { q: "Which scheduling algorithm gives the CPU to the process that has the smallest next CPU burst?", a: "3", options: ["FCFS", "Priority", "SJF", "Round Robin"] },
  { q: "What occurs when two or more processes are waiting indefinitely for an event that can be caused by only one of the waiting processes?", a: "2", options: ["Starvation", "Deadlock", "Segmentation", "Paging"] },
  { q: "In OS, what is the term for a program in execution?", a: "1", options: ["Process", "Thread", "Module", "Interrupt"] },
  { q: "Which part of the OS is responsible for loading the initial program (Bootstrap)?", a: "4", options: ["Kernel", "GUI", "Shell", "ROM/Firmware"] },
  { q: "A 'Context Switch' is the process of saving the state of an old process and loading the state of a new one. True or False?", a: "1", options: ["True", "False", "Only in Linux", "Only in Windows"] },
  { q: "Which memory management scheme allows the physical address space of a process to be non-contiguous?", a: "2", options: ["Swapping", "Paging", "Fragmentation", "Contiguous Allocation"] },
  { q: "What is the phenomenon where the page-fault rate increases even though the number of frames increases?", a: "3", options: ["Thrashing", "Paging", "Belady's Anomaly", "Segmentation"] },
  { q: "Which disk scheduling algorithm services requests by moving the head from one end of the disk to the other?", a: "2", options: ["SSTF", "SCAN", "FCFS", "C-LOOK"] },
  { q: "RAID Level 1 is primarily used for what purpose?", a: "1", options: ["Mirroring", "Striping", "Parity", "Speed only"] },
  { q: "Which type of fragmentation occurs when physical memory is broken into small holes between loaded processes?", a: "4", options: ["Internal", "Systemic", "Logical", "External"] },
  { q: "Which layer of the OSI model is responsible for IP Addressing and Routing?", a: "3", options: ["Data Link", "Transport", "Network", "Physical"] },
  { q: "What is the default subnet mask for a Class C IP address?", a: "1", options: ["255.255.255.0", "255.255.0.0", "255.0.0.0", "192.168.1.1"] },
  { q: "Which protocol is used to map a known IP address to a MAC address?", a: "2", options: ["DNS", "ARP", "DHCP", "ICMP"] },
  { q: "In Networking, which port number is used by the HTTP protocol by default?", a: "4", options: ["21", "443", "25", "80"] },
  { q: "Which Cisco command is used to enter Privileged EXEC mode?", a: "1", options: ["enable", "configure terminal", "show run", "login"] },
  { q: "Which component of the CPU performs mathematical and logical operations?", a: "2", options: ["Control Unit", "ALU", "Registers", "Cache"] },
  { q: "What is the smallest unit of data a computer can process?", a: "3", options: ["Byte", "Nibble", "Bit", "Word"] },
  { q: "Which type of memory is volatile and used as the 'working memory' of the CPU?", a: "1", options: ["RAM", "ROM", "SSD", "HDD"] },
  { q: "The ESP32 is a low-power system-on-a-chip with integrated Wi-Fi and dual-mode Bluetooth. True or False?", a: "1", options: ["True", "False", "Bluetooth only", "Wi-Fi only"] },
  { q: "Which bus carries the addresses of data to be read from or written to memory?", a: "4", options: ["Data Bus", "Control Bus", "I/O Bus", "Address Bus"] },
  { q: "What is the term for a malicious program that hides within a seemingly harmless program?", a: "2", options: ["Worm", "Trojan Horse", "Spyware", "Adware"] },
  { q: "Which security protocol provides encryption for web traffic (HTTPS)?", a: "3", options: ["FTP", "SSH", "TLS/SSL", "SMTP"] },
  { q: "In Cybersecurity, what does the acronym 'CIA' stand for?", a: "1", options: ["Confidentiality, Integrity, Availability", "Central Intel Agency", "Control, Integrity, Access", "Cloud, Internet, Apps"] },
  { q: "A firewall can be implemented as hardware, software, or both. True or False?", a: "1", options: ["True", "False", "Software only", "Hardware only"] },
  { q: "FINAL QUESTION: Which UM campus are you currently defending in?", a: "2", options: ["Matina", "Panabo", "Digos", "Tagum"] }
];

// --- SHARED COMPONENTS ---
function PlayerHeader({ teamId, score, questionIndex, timer }) {
  const team = TEAM_CONFIG[teamId - 1];
  return (
    <div className="bg-black border-b border-slate-800 p-4 flex justify-between items-center font-sans">
      <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${team.color}`}>TEAM {teamId}</span>
        <span className="text-2xl font-black text-white">{score} <span className="text-xs text-emerald-500">PTS</span></span>
      </div>
      <div className={`px-4 py-1 rounded-lg font-mono font-black text-2xl border-2 ${timer < 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-white border-slate-700'}`}>
        :{timer < 10 ? `0${timer}` : timer}
      </div>
      <div className="text-right flex flex-col items-end">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ROUND</span>
        <span className="text-xl font-black text-yellow-500 italic">{Math.floor(questionIndex / 5) + 1}</span>
      </div>
    </div>
  );
}

// --- 1. PROJECTOR VIEW ---
function ProjectorView() {
  const [gameData, setGameData] = useState({ scores: {}, questionIndex: 0, state: 'LOBBY', joinedStatus: {}, answeredStatus: {}, powerLog: "", revealed: "", pickers: "" });
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Parse Picker Map: "TeamID:CardNum"
  const pickerMap = {};
  if (gameData.pickers) {
    String(gameData.pickers).split(',').forEach(pair => {
      const [tid, cid] = pair.split(':');
      pickerMap[cid] = tid;
    });
  }

  const joinedCount = Object.values(gameData.joinedStatus || {}).filter(v => v && v !== false && v !== "FALSE").length;
  const answeredCount = Object.values(gameData.answeredStatus || {}).filter(v => v === true).length;
  const isBattlePhase = gameData.questionIndex > 0 && gameData.questionIndex % 5 === 0 && gameData.state === 'RACING';

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

  useEffect(() => {
    if (gameData.state !== 'RACING' || isTransitioning || isBattlePhase) return;
    if (timeLeft <= 0 || (joinedCount > 0 && answeredCount >= joinedCount)) {
      setTimeout(nextQuestion, 0);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTransitioning, gameData.state, answeredCount, joinedCount, isBattlePhase]);

  const nextQuestion = useCallback(async () => {
    setIsTransitioning(true);
    setTimeLeft(30);
    setTimeout(async () => {
      const nextIdx = (gameData.questionIndex + 1) % QUESTIONS.length;
      await fetch(API_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'UPDATE_GAME', questionIndex: nextIdx })
      });
      setIsTransitioning(false);
    }, 3000);
  }, [gameData.questionIndex]);

  if (gameData.state === 'LOBBY') {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans">
        <h1 className="text-6xl font-black italic text-emerald-500 mb-8 uppercase animate-pulse">Pre-Race Paddock</h1>
        <div className="grid grid-cols-5 gap-6 mb-12">
          {TEAM_CONFIG.map(t => {
            const isReady = gameData.joinedStatus?.[t.id] && gameData.joinedStatus?.[t.id] !== false && gameData.joinedStatus?.[t.id] !== "FALSE";
            return (
              <div key={t.id} className={`p-6 rounded-2xl border-4 transition-all duration-500 flex flex-col items-center shadow-2xl ${isReady ? 'border-emerald-500 bg-emerald-500/10 scale-105' : 'border-slate-800 opacity-30 grayscale'}`}>
                <div className={`w-4 h-4 rounded-full mb-3 ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                <span className="font-black italic">{t.name}</span>
              </div>
            );
          })}
        </div>
        <button disabled={joinedCount < 5} onClick={() => fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'UPDATE_GAME', state: 'RACING' }) })} className="bg-emerald-600 px-24 py-6 rounded-2xl text-3xl font-black shadow-2xl active:scale-95">START RACE →</button>
      </div>
    );
  }

  if (isBattlePhase) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-30"></div>
        <h1 className="text-6xl font-black italic text-yellow-500 mb-2 uppercase z-10">ROUND {gameData.questionIndex / 5} COMPLETE</h1>
        <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.4em] mb-10 z-10">Waiting for Remote Selection...</p>
        <div className="grid grid-cols-5 gap-4 w-full max-w-6xl z-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const teamWhoPicked = pickerMap[num];
            const team = teamWhoPicked ? TEAM_CONFIG[teamWhoPicked - 1] : null;
            return (
              <div key={num} className={`h-40 rounded-[2rem] border-4 flex flex-col items-center justify-center transition-all duration-500 
                ${team ? `${team.color} scale-105 shadow-xl rotate-0` : 'bg-slate-900 border-slate-800 opacity-20 scale-95'}`}>
                {team ? (
                  <div className="text-center p-4 animate-bounce">
                    <span className="block text-[10px] font-black uppercase mb-1 bg-black/20 rounded">TEAM {teamWhoPicked}</span>
                    <span className="block text-xl font-black uppercase italic leading-none">{DESTINY_CARDS[num].name}</span>
                    <p className="text-[8px] font-bold mt-2 uppercase opacity-80">{DESTINY_CARDS[num].effect}</p>
                  </div>
                ) : <span className="text-5xl font-black text-slate-800">#{num}</span>}
              </div>
            );
          })}
        </div>
        <div className="h-20 mt-10 text-3xl font-black text-emerald-400 animate-pulse z-10 uppercase italic">{gameData.powerLog}</div>
        <button onClick={nextQuestion} className="bg-white text-black font-black text-2xl px-16 py-6 rounded-2xl hover:bg-emerald-400 mt-6 z-10">NEXT ROUND →</button>
      </div>
    );
  }

  if (isTransitioning) return <div className="h-screen w-full bg-emerald-600 flex items-center justify-center text-8xl font-black italic text-white animate-pulse uppercase">Relinking...</div>;

  const currentQ = QUESTIONS[gameData.questionIndex] || QUESTIONS[0];
  return (
    <div className="flex h-screen w-full bg-slate-950 text-white font-sans overflow-hidden">
      <div className="w-[70%] p-12 flex flex-col border-r-4 border-slate-900 bg-slate-900/30">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-black uppercase italic text-emerald-500 tracking-tighter">Defense Race</h1>
          <div className="flex items-center gap-6">
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{answeredCount}/{joinedCount} Answered</span>
             <div className={`text-6xl font-mono font-black px-6 py-2 rounded-xl border-4 ${timeLeft < 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-white border-slate-700'}`}>
                :{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
             </div>
          </div>
        </div>
        <div className="bg-slate-800 p-10 rounded-3xl border-2 border-slate-700 shadow-2xl flex-grow flex flex-col justify-center">
          <p className="text-xl text-slate-400 mb-4 font-bold uppercase tracking-widest">Question {gameData.questionIndex + 1}</p>
          <h2 className="text-4xl font-extrabold leading-tight mb-12">{currentQ.q}</h2>
          <div className="grid grid-cols-2 gap-6">
            {currentQ.options.map((opt, i) => (
              <div key={i} className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-800 text-2xl font-bold"><span className="text-emerald-500 mr-4 font-black">{i + 1}.</span> {opt}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-[30%] p-6 bg-black flex flex-col">
        <h3 className="text-center font-black text-slate-600 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2 italic">Standings</h3>
        {TEAM_CONFIG.map((team) => (
          <div key={team.id} className="mb-6">
            <div className="flex justify-between text-[11px] font-black text-slate-500 mb-2 uppercase items-center">
              <span>{team.name} {gameData.answeredStatus?.[team.id] && <span className="ml-2 text-emerald-500 text-lg">✓</span>}</span>
              <span className="text-white bg-slate-800 px-2 rounded font-mono">{gameData.scores[team.id] || 0} PTS</span>
            </div>
            <div className="h-8 bg-slate-900 rounded-full border border-slate-800 overflow-hidden relative shadow-inner">
              <div className={`h-full transition-all duration-1000 ${team.color} border-r-4 border-white`} style={{ width: `${((gameData.scores[team.id] || 0) / 25) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 2. PLAYER VIEW ---
function PlayerView() {
  const [teamId, setTeamId] = useState(() => localStorage.getItem('myDefenseTeam') ? Number(localStorage.getItem('myDefenseTeam')) : null);
  const deviceId = getDeviceId();
  const [gameData, setGameData] = useState({ scores: {}, playerCount: 5, state: 'LOBBY', questionIndex: 0, joinedStatus: {}, correctKey: '1', revealed: "", powerLog: "" });
  const [isSending, setIsSending] = useState(false);
  const [myAnswerStatus, setMyAnswerStatus] = useState('waiting');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [powerUsedRound, setPowerUsedRound] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const sync = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}?t=${Date.now()}`);
        const data = await res.json();
        setGameData(data);
        if (teamId && data.joinedStatus?.[teamId] && data.joinedStatus?.[teamId] !== deviceId) {
          alert("Kicked: Device ID Mismatch!"); setTeamId(null); localStorage.removeItem('myDefenseTeam');
        }
        if (data.questionIndex !== currentQIndex) { setMyAnswerStatus('waiting'); setCurrentQIndex(data.questionIndex); setTimeLeft(30); }
      } catch (e) { console.error(e); }
    }, 2000);
    return () => clearInterval(sync);
  }, [currentQIndex, teamId, deviceId]);

  useEffect(() => {
    if (gameData.state !== 'RACING' || myAnswerStatus !== 'waiting') return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [gameData.state, myAnswerStatus]);

  const handlePress = useCallback(async (key) => {
    if (myAnswerStatus !== 'waiting' || isSending || !teamId || gameData.state !== 'RACING') return;
    setIsSending(true);
    const isCorrect = key === String(gameData.correctKey);
    setMyAnswerStatus(isCorrect ? 'correct' : 'wrong');
    await fetch(API_URL, { 
      method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'},
      body: JSON.stringify({ action: isCorrect ? 'ADD_POINT' : 'WRONG_ANSWER', teamId }) 
    });
    setIsSending(false);
  }, [myAnswerStatus, isSending, teamId, gameData.state, gameData.correctKey]);

  useEffect(() => {
    const handleKey = (e) => ['1','2','3','4'].includes(e.key) && handlePress(e.key);
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, [handlePress]);

  if (!teamId) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
      <h2 className="text-4xl font-black mb-8 italic uppercase border-b-4 border-emerald-500 pb-2">Choose Car</h2>
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        {TEAM_CONFIG.map(t => {
          const isTaken = gameData.joinedStatus?.[t.id] && gameData.joinedStatus?.[t.id] !== deviceId;
          return <button key={t.id} disabled={isTaken} onClick={() => {setTeamId(t.id); localStorage.setItem('myDefenseTeam', t.id); fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'JOIN_TEAM', teamId: t.id, deviceId }) });}} className={`p-6 rounded-2xl font-black text-2xl border-b-8 shadow-lg transition-all active:scale-95 ${t.color} ${isTaken ? 'opacity-20 grayscale' : ''}`}>{t.name}</button>;
        })}
      </div>
    </div>
  );

  const isBattlePhase = gameData.questionIndex > 0 && gameData.questionIndex % 5 === 0 && gameData.state === 'RACING';
  const currentQ = QUESTIONS[gameData.questionIndex] || QUESTIONS[0];

  if (isBattlePhase) {
    if (powerUsedRound === gameData.questionIndex) return <div className="h-screen bg-slate-900 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={0} /><div className="flex-1 flex flex-col items-center justify-center p-10 text-center"><h2 className="text-4xl font-black italic text-slate-500 mb-4">CHOICE LOCKED</h2><p className="font-bold tracking-widest text-emerald-500">LOOK AT THE BIG SCREEN!</p></div></div>;
    return (
      <div className="h-screen bg-indigo-950 flex flex-col text-white">
        <PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={0} />
        <div className="flex-1 flex flex-col p-6 justify-center">
          <h2 className="text-3xl font-black italic text-yellow-400 mb-6 uppercase text-center">Pick Destiny</h2>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button key={num} onClick={() => {setPowerUsedRound(gameData.questionIndex); fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action: 'REVEAL_CARD', teamId, cardNum: num, cardName: DESTINY_CARDS[num].name }) });}} className="bg-slate-800 rounded-xl font-black text-3xl h-20 border-b-4 border-black active:scale-90">{num}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (myAnswerStatus === 'wrong') return <div className="h-screen bg-red-950 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} /><div className="flex-1 flex items-center justify-center text-center"><h1 className="text-6xl font-black italic uppercase italic">Stalled</h1></div></div>;
  if (myAnswerStatus === 'correct') return <div className="h-screen bg-emerald-900 flex flex-col text-white"><PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} /><div className="flex-1 flex items-center justify-center animate-pulse text-center"><h1 className="text-6xl font-black italic uppercase tracking-tighter">Locked In</h1></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white font-sans">
      <PlayerHeader teamId={teamId} score={gameData.scores[teamId]||0} questionIndex={gameData.questionIndex} timer={timeLeft} />
      <div className="p-6 bg-slate-800 border-b border-slate-700">
        <p className="text-xs font-black text-emerald-500 mb-1 uppercase tracking-widest">Question {gameData.questionIndex + 1}</p>
        <h3 className="text-lg font-bold leading-tight line-clamp-3">{currentQ.q}</h3>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 bg-black/60">
        {['A', 'B', 'C', 'D'].map((l, i) => (
          <button key={l} onClick={() => handlePress(String(i+1))} className="bg-slate-800 rounded-3xl flex flex-col items-center justify-center border-b-[12px] border-slate-950 active:translate-y-2 active:border-b-[4px]">
            <span className="text-5xl font-black mb-1">{l}</span>
            <span className="text-[10px] font-bold opacity-40 uppercase px-4 text-center leading-tight">{currentQ.options[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- 3. MAIN ROUTER ---
export default function App() {
  const path = window.location.pathname;
  if (path === '/projector') return <ProjectorView />;
  if (path === '/player') return <PlayerView />;
  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 text-center font-sans">
      <h1 className="text-8xl font-black italic tracking-tighter mb-4 uppercase leading-none">Defense <span className="text-emerald-500">Race</span></h1>
      <button onClick={async () => { await fetch(API_URL, { method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'RESET' }) }); setTimeout(() => window.location.pathname = '/projector', 500); }} className="bg-emerald-600 py-8 px-16 rounded-3xl font-black text-3xl shadow-lg active:scale-95 uppercase italic">Initialize Race →</button>
    </div>
  );
}