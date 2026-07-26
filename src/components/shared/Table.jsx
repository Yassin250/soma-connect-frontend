import React from 'react';

// Legacy simple table, restyled onto the ink/lime system so pages still using
// it match DataTable: 10px uppercase headers, 13px cells, compact paddings.
export const Table = ({ columns, data, emptyMessage = "No data available", className = "" }) => {
  return (
    <div className={`overflow-x-auto border border-[#1b1e26]/[0.06] rounded-2xl bg-white ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f4f6f8] border-b border-[#1b1e26]/[0.06]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-2.5 text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.14em] whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1b1e26]/[0.04]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[13px] text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-accent/[0.08] transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-2.5 text-[13px] text-[#1b1e26]/80">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
