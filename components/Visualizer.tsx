
import React from 'react';
import { Server, ServerStatus, DeploymentStage } from '../types';

interface VisualizerProps {
  stage: DeploymentStage;
  servers: Server[];
}

const Visualizer: React.FC<VisualizerProps> = ({ servers, stage }) => {
  const v1Servers = servers.filter(s => s.version === 'v1.0.0');
  
  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ACTIVE: return 'fill-emerald-500';
      case ServerStatus.HEALTH_CHECK: return 'fill-blue-400 animate-pulse';
      case ServerStatus.DRAINING: return 'fill-amber-500';
      case ServerStatus.FAILED: return 'fill-rose-600';
      case ServerStatus.DECOMMISSIONED: return 'fill-slate-700';
      default: return 'fill-slate-500';
    }
  };

  const getStatusIcon = (status: ServerStatus) => {
    switch (status) {
      case ServerStatus.ACTIVE: return 'fa-check-circle';
      case ServerStatus.HEALTH_CHECK: return 'fa-spinner fa-spin';
      case ServerStatus.DRAINING: return 'fa-exchange-alt';
      case ServerStatus.FAILED: return 'fa-exclamation-triangle';
      case ServerStatus.DECOMMISSIONED: return 'fa-power-off';
      default: return 'fa-server';
    }
  };

  return (
    <div className="flex-1 w-full relative p-8 flex items-center justify-center">
      <svg className="w-full h-full max-w-5xl max-h-[650px] drop-shadow-2xl" viewBox="0 0 800 600">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Global User Traffic Source */}
        <g transform="translate(400, 50)">
          <circle r="35" fill="#1e293b" stroke="#6366f1" strokeWidth="3" filter="url(#glow)" />
          <foreignObject x="-20" y="-12" width="40" height="30">
            <div className="flex items-center justify-center w-full h-full">
               <i className="fas fa-users text-white text-lg"></i>
            </div>
          </foreignObject>
          <text y="48" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" className="uppercase tracking-widest">Global Traffic</text>
          <path d="M0,45 L0,90" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="traffic-line" />
        </g>

        {/* Load Balancer */}
        <g transform="translate(300, 110)">
          <rect width="200" height="70" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <rect x="0" y="0" width="200" height="25" rx="12" fill="#334155" clipPath="inset(0 0 45 0)" />
          <text x="100" y="42" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" className="tracking-tighter">NGINX LOAD BALANCER</text>
          <text x="100" y="58" textAnchor="middle" fill="#94a3b8" fontSize="9" className="font-mono">NODES: {servers.filter(s => s.status !== ServerStatus.DECOMMISSIONED).length}</text>
        </g>

        {/* Traffic Lines & Servers */}
        {servers.map((server, index) => {
          const isV1 = server.version === 'v1.0.0';
          // Adjusted layout to prevent overlapping
          const xPos = isV1 ? 120 + (index * 90) : 480 + ((index - v1Servers.length) * 90);
          const yPos = 380;
          const isActive = server.trafficPercentage > 0;
          const borderColor = isV1 ? '#3b82f6' : '#10b981';

          return (
            <g key={server.id} className="transition-all duration-1000">
              {/* Traffic path from LB */}
              {isActive && (
                <path 
                  d={`M 400 180 Q 400 280 ${xPos} 370`} 
                  stroke={borderColor} 
                  strokeWidth={Math.max(1, server.trafficPercentage / 8)} 
                  fill="none" 
                  className="traffic-line opacity-60" 
                  style={{ animationDuration: `${1.5 - (server.trafficPercentage / 40)}s` }}
                />
              )}

              {/* Server Instance */}
              <g transform={`translate(${xPos - 35}, ${yPos})`} className="server-transition">
                <rect 
                  width="70" 
                  height="110" 
                  rx="8" 
                  fill="#0f172a" 
                  stroke={server.status === ServerStatus.FAILED ? '#f43f5e' : server.status === ServerStatus.ACTIVE ? borderColor : '#334155'} 
                  strokeWidth="2" 
                  className="transition-all duration-500"
                />
                
                {/* Status Indicator */}
                <circle cx="35" cy="35" r="18" className={`${getStatusColor(server.status)} transition-colors duration-500`} />
                <foreignObject x="25" y="25" width="20" height="20">
                    <div className="flex items-center justify-center w-full h-full">
                        <i className={`fas ${getStatusIcon(server.status)} text-[12px] text-white`}></i>
                    </div>
                </foreignObject>

                <text x="35" y="75" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="font-mono">{server.id.toUpperCase()}</text>
                <text x="35" y="90" textAnchor="middle" fill={isV1 ? '#60a5fa' : '#34d399'} fontSize="9" fontWeight="medium">{server.version}</text>
                
                {isActive && (
                   <g transform="translate(5, 120)">
                     <rect width="60" height="4" rx="2" fill="#1e293b" />
                     <rect width={(server.trafficPercentage / 33.33) * 60} height="4" rx="2" fill={borderColor} className="transition-all duration-1000" />
                     <text x="30" y="15" textAnchor="middle" fill={borderColor} fontSize="8" fontWeight="bold" className="font-mono">{Math.round(server.trafficPercentage * 3)}% LB WEIGHT</text>
                   </g>
                )}
                
                {/* Failure Spark */}
                {server.status === ServerStatus.FAILED && (
                   <circle cx="35" cy="35" r="22" fill="none" stroke="#f43f5e" strokeWidth="2" className="animate-ping opacity-20" />
                )}
              </g>
            </g>
          );
        })}

        {/* Backdrop Annotations */}
        <g opacity="0.1" pointerEvents="none">
          <line x1="50" y1="320" x2="750" y2="320" stroke="white" strokeWidth="1" strokeDasharray="10,5" />
          <text x="50" y="315" fill="white" fontSize="9" fontWeight="bold" className="uppercase tracking-tighter">Compute Cluster Zone</text>
        </g>
      </svg>
      
      {/* Simulation Metrics Overlay */}
      <div className="absolute bottom-10 right-10 p-5 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl min-w-[200px] pointer-events-none transform hover:scale-105 transition-transform">
        <h4 className="text-indigo-400 font-bold text-[10px] uppercase mb-3 tracking-widest border-b border-white/5 pb-2">Real-time Telemetry</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500 uppercase">Availability</span>
              <span className="text-emerald-400 font-mono font-bold">100.00%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500 uppercase">Error Rate</span>
              <span className={`${stage === DeploymentStage.FAILURE_SIMULATION ? "text-rose-500" : "text-emerald-400"} font-mono font-bold`}>
                {stage === DeploymentStage.FAILURE_SIMULATION ? "0.002%" : "0.00%"}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
               <div className={`h-full ${stage === DeploymentStage.FAILURE_SIMULATION ? "bg-rose-500 w-[2%]" : "bg-emerald-500 w-0"} transition-all duration-500`}></div>
            </div>
          </div>
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[9px] text-slate-400 font-mono uppercase">LB Health Check: Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
