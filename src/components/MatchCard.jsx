import React, { useEffect, useRef, useState } from 'react';

export const MatchCard = ({ match, isActive, isLive }) => {
  
  return (
    <div className={`
      relative p-5 rounded-2xl border-2 border-black bg-white transition-all duration-200
      ${isActive ? 'shadow-hard translate-x-[-2px] translate-y-[-2px] ring-2 ring-brand-yellow ring-offset-2' : 'hover:shadow-hard-sm'}
    `}>
      {/* Header: Sport & Status */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 border border-black rounded-full px-2 py-0.5">
          {match.sport}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
            </span>
          )}
          
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-brand-dark line-clamp-1">{match.homeTeam}</span>
          
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-brand-dark line-clamp-1">{match.awayTeam}</span>
          
        </div>
      </div>

      {/* Footer: Action */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-gray-100 border-dashed">
        <span className="text-xs text-gray-500 font-medium">
          {new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={isActive}
            className={`
              px-4 py-2 rounded-full font-bold text-sm border-2 border-black transition-all
              ${isActive 
                ? 'bg-brand-blue text-black cursor-default opacity-100' 
                : 'bg-brand-yellow text-black hover:bg-yellow-300 active:translate-y-0.5'
              }
            `}
          >
          </button>
          {isActive && (
            <button
              className="px-3 py-2 rounded-full font-bold text-xs border-2 border-black bg-white hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};