import React, { useState } from 'react'
import { StatusIndicator } from './components/StatusIndicator'
import { useWebSocket } from './hook/useWebSocket';

const App = () => {
  const [wsError, setWsError] = useState("Ali")
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const { status } = useWebSocket();
  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-yellow border-2 border-black rounded-2xl p-6 shadow-hard">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-brand-dark mb-1">
              Spotrz
            </h1>
            <p className="text-sm font-medium opacity-80">Real-time match data demo</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusIndicator status={status} />
            {wsError && (
              <span className="text-xs font-mono bg-red-100 text-red-700 border border-red-200 px-2 py-1 rounded">
                WS: {wsError}
              </span>
            )}
          </div>
        </header>
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Match List */}
          <main className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold border-l-4 border-brand-blue pl-3">Current Matches</h2>
              <span className="text-xs font-mono bg-black text-white px-2 py-1 rounded">
                API: {isLoading ? '...' : matches.length}
              </span>
            </div>
            {isLoading && (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-2xl">
                <div className="animate-spin w-8 h-8 border-4 border-brand-yellow border-t-black rounded-full mx-auto mb-4"></div>
                <p className="font-medium text-gray-500">Loading matches...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-2 border-red-500 text-red-900 p-6 rounded-xl text-center shadow-sm">
                <div className="flex justify-center mb-3 text-red-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold mb-1">Connection Error</h3>
                <p className="font-mono text-sm bg-red-100 py-1 px-2 rounded inline-block mb-4 border border-red-200">{error}</p>
                <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
                  The application could not reach the API. Please ensure the API server is online and accessible from your network.
                </p>
                <button
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-all shadow-md active:translate-y-0.5"
                >
                  Retry Connection
                </button>
              </div>
            )}
            {!isLoading && !error && matches.length === 0 && (
              <div className="p-12 text-center border-2 border-black rounded-2xl bg-gray-50">
                <p className="font-bold text-lg">No matches found</p>
              </div>
            )}
          </main>
            {/* Right Column: Live Feed (Sticky on Desktop) */}
          <aside className="lg:col-span-1 h-[500px] lg:h-[calc(100vh-140px)] lg:sticky lg:top-8 bg-amber-200">
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App