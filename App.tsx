
import React, { useState, useEffect, useMemo } from 'react';
import { DeploymentStage, ServerStatus, Server } from './types';
import { getDevOpsExplanation } from './services/geminiService';
import Visualizer from './components/Visualizer';

const STAGE_TITLES = [
  "1. Initial State",
  "2. Preparation",
  "3. Traffic Shift",
  "4. Parallel State",
  "5. Rollback Demo",
  "6. Final State"
];

const App: React.FC = () => {
  const [stage, setStage] = useState<DeploymentStage>(DeploymentStage.INITIAL);
  const [explanation, setExplanation] = useState<string>('Initializing simulator...');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Deployment Simulator V1.0 Ready."]);

  const servers = useMemo(() => {
    const s: Server[] = [];
    
    // v1.0.0 Servers Logic
    const v1Status = (() => {
      if (stage === DeploymentStage.INITIAL || stage === DeploymentStage.PREPARATION || stage === DeploymentStage.FAILURE_SIMULATION) return ServerStatus.ACTIVE;
      if (stage === DeploymentStage.TRAFFIC_ROUTING) return ServerStatus.DRAINING;
      if (stage === DeploymentStage.PARALLEL_STATE) return ServerStatus.ACTIVE;
      if (stage === DeploymentStage.FINAL_STATE) return ServerStatus.DECOMMISSIONED;
      return ServerStatus.IDLE;
    })();

    const v1Traffic = (() => {
      if (stage === DeploymentStage.INITIAL || stage === DeploymentStage.PREPARATION || stage === DeploymentStage.FAILURE_SIMULATION) return 33.33;
      if (stage === DeploymentStage.TRAFFIC_ROUTING) return 10;
      if (stage === DeploymentStage.PARALLEL_STATE) return 16.66;
      return 0;
    })();

    s.push({ id: 's1', version: 'v1.0.0', status: v1Status, trafficPercentage: v1Traffic });
    s.push({ id: 's2', version: 'v1.0.0', status: v1Status, trafficPercentage: v1Traffic });
    s.push({ id: 's3', version: 'v1.0.0', status: v1Status, trafficPercentage: v1Traffic });

    // v2.0.0 Servers Logic
    if (stage >= DeploymentStage.PREPARATION) {
      const v2Status = (() => {
        if (stage === DeploymentStage.PREPARATION) return ServerStatus.HEALTH_CHECK;
        if (stage === DeploymentStage.FAILURE_SIMULATION) return ServerStatus.FAILED;
        return ServerStatus.ACTIVE;
      })();

      const v2Traffic = (() => {
        if (stage === DeploymentStage.TRAFFIC_ROUTING) return 23.33;
        if (stage === DeploymentStage.PARALLEL_STATE) return 16.66;
        if (stage === DeploymentStage.FINAL_STATE) return 33.33;
        return 0;
      })();

      s.push({ id: 's4', version: 'v2.0.0', status: v2Status, trafficPercentage: v2Traffic });
      s.push({ id: 's5', version: 'v2.0.0', status: v2Status, trafficPercentage: v2Traffic });
      s.push({ id: 's6', version: 'v2.0.0', status: v2Status, trafficPercentage: v2Traffic });
    }

    return s;
  }, [stage]);

  useEffect(() => {
    const loadExplanation = async () => {
      setLoading(true);
      const text = await getDevOpsExplanation(stage);
      setExplanation(text || 'No expert data available.');
      setLoading(false);
      setLogs(prev => [`[LOG] Transitioned to ${STAGE_TITLES[stage]}`, ...prev.slice(0, 15)]);
    };
    loadExplanation();
  }, [stage]);

  const nextStage = () => setStage(prev => Math.min(prev + 1, 5));
  const prevStage = () => setStage(prev => Math.max(prev - 1, 0));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-500/20 shadow-lg">
            <i className="fas fa-server text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Zero-Downtime Deployment Simulator</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">DevOps Simulation Environment</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {STAGE_TITLES.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx <= stage ? 'bg-indigo-500 scale-110 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevStage} 
              disabled={stage === 0 || loading}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 transition-all text-sm font-medium border border-slate-600"
            >
              <i className="fas fa-chevron-left mr-2"></i> Previous
            </button>
            <button 
              onClick={nextStage} 
              disabled={stage === 5 || loading}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 transition-all text-sm font-bold border border-indigo-500 shadow-lg shadow-indigo-600/20"
            >
              Next Phase <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Visualizer */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950">
          <div className="p-4 border-b border-white/5 flex justify-between bg-black/20 backdrop-blur-md z-10">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> v1.0.0
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> v2.0.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`}></div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">System Live</span>
              </div>
            </div>
          </div>
          <Visualizer stage={stage} servers={servers} />
        </div>

        {/* Right Side: Explanation and Console */}
        <aside className="w-96 border-l border-slate-700 bg-slate-800/50 backdrop-blur-sm flex flex-col shadow-2xl z-10">
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-400 text-sm animate-pulse font-medium">Synthesizing Architecture Analysis...</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                 <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                      {explanation}
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="h-64 border-t border-slate-700 bg-slate-950/80 p-4 font-mono text-[10px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-terminal"></i> system.log
              </h3>
              <span className="text-slate-600 text-[9px] uppercase">TTY 01</span>
            </div>
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-2 transition-opacity duration-300 ${i === 0 ? 'opacity-100' : 'opacity-60'}`}>
                  <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes('[SYSTEM]') ? 'text-indigo-400 font-bold' : log.includes('LOG') ? 'text-slate-400' : 'text-emerald-500'}>
                    {`> ${log}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
