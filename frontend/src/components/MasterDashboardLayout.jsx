import React from 'react';
import { useTenant } from '../context/TenantContext';
import AiOpsConsole from './AiOpsConsole';
import SecurityAuditTerminal from './SecurityAuditTerminal';
import { Shield, Bot, Terminal, LayoutDashboard, Database, Lock, CheckCircle2, ChevronDown, Activity, Server, AlertShield } from 'lucide-react';

export default function MasterDashboardLayout() {
  const { currentTenant, tenants, switchTenant, activeTab, setActiveTab } = useTenant();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base text-white tracking-wide">GuardianOS</h1>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">v1.0.0 SECURE</span>
            </div>
            <p className="text-xs text-slate-400">SecOps-Integrated AI Internal Operating System</p>
          </div>
        </div>

        {/* Tenant Selector & System Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
            <Database className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Active Tenant Context</div>
              <select
                value={currentTenant.id}
                onChange={(e) => switchTenant(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3 bg-emerald-950/40 border border-emerald-800/50 px-4 py-2 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">RLS Isolation</div>
              <div className="text-xs text-emerald-200">Zero-Trust Active</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col justify-between">
          <nav className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Control Center</div>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Mission Control</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-console')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'ai-console'
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Ops Console</span>
            </button>

            <button
              onClick={() => setActiveTab('audit-terminal')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'audit-terminal'
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Security Audit Stream</span>
            </button>
          </nav>

          {/* Tenant Metadata Card in Sidebar */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Tenant Profile</span>
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Tier: <span className="text-cyan-400">{currentTenant.tier}</span></div>
              <div>Region: <span className="text-slate-300">{currentTenant.region}</span></div>
              <div className="truncate text-[10px] text-slate-500">ID: {currentTenant.id}</div>
            </div>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-xl font-bold text-white mb-2">Welcome to GuardianOS Control Center</h2>
                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  You are operating within the secure multi-tenant environment of <strong className="text-cyan-400">{currentTenant.name}</strong>. All AI operations, database requests, and telemetry are isolated via zero-trust architecture and protected against the OWASP LLM Top 10.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button
                    onClick={() => setActiveTab('ai-console')}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors shadow-lg shadow-cyan-600/30"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Launch AI Ops Console</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('audit-terminal')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors border border-slate-700"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>View Live Security Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Security Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Tenant Isolation Status</span>
                    <Database className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">Active RLS</div>
                  <p className="text-xs text-slate-400">Database row-level security enforced for {currentTenant.id.substring(0, 8)}...</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">OWASP LLM Guardrails</span>
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">100% Protected</div>
                  <p className="text-xs text-slate-400">Zero injection or prompt leakage vulnerabilities detected.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Gateway Latency</span>
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">14ms</div>
                  <p className="text-xs text-slate-400">High-performance async request sanitization pipeline.</p>
                </div>
              </div>

              {/* Security Features Overview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-base font-bold text-white mb-4">Defense-in-Depth Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-sm font-semibold text-cyan-400 mb-1">Multi-Tenant Isolation (LLM06)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every API call extracts and validates the `x-tenant-id` header against rigorous UUID formats before passing context down to the secure runtime.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-sm font-semibold text-emerald-400 mb-1">Prompt Injection Defense (LLM01)</div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Real-time regex signature matching intercepts SQL injection, jailbreak attempts, command execution, and unauthorized configuration queries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-console' && <AiOpsConsole />}
          {activeTab === 'audit-terminal' && <SecurityAuditTerminal />}
        </main>
      </div>
    </div>
  );
}