/** Builds a CSV from rows and starts a download. columns: [[header, row => value], ...] */
export function downloadCSV(name, rows, columns) {
  // Prefix formula-looking cells so spreadsheets don't execute them (CSV injection).
  const esc = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [columns.map(([h]) => esc(h)).join(','), ...rows.map((r) => columns.map(([, get]) => esc(get(r))).join(','))].join('\n');
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** { status: 'New', q: '' } -> '?status=New' (empty values skipped) */
export const toQuery = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString();
  return q ? `?${q}` : '';
};
