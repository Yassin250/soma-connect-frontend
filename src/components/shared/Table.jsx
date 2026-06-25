import React from 'react';

export const Table = ({ headers, rows, className = '', onRowClick }) => {
  return (
    <div className={`border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/20 text-xs ${className}`}>
      <div className="grid p-3.5 bg-slate-900/50 border-b border-slate-850 font-bold text-slate-400" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
        {headers.map((h, i) => (
          <span key={i} className={h.align === 'right' ? 'text-right' : ''}>{h.label}</span>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-center text-slate-500">No data available.</div>
      ) : (
        <div className="divide-y divide-slate-850">
          {rows.map((row, rowIdx) => (
            <div
              key={rowIdx}
              onClick={() => onRowClick?.(row, rowIdx)}
              className={`grid p-3.5 items-center hover:bg-slate-900/40 ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}
            >
              {headers.map((h, colIdx) => (
                <span key={colIdx} className={h.align === 'right' ? 'text-right' : ''}>
                  {row[h.key]}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
