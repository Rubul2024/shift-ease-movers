import React, { useCallback, useEffect, useState } from 'react';
import Icon from './Icon';
import { STATUS_TONE, dateTime } from '../utils/format';

/** Fetch helper: const { data, loading, error, reload, setData } = useFetch(api.areas) */
export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return load()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}

export function StatusTag({ status }) {
  const tone = STATUS_TONE[status] || 'gray';
  return <span className={`tag ${tone === 'blue' ? '' : tone}`}>{status}</span>;
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon name={type === 'success' ? 'check' : type === 'info' ? 'bolt' : 'x'} size={18} />
      <div>{children}</div>
    </div>
  );
}

export function PageHeader({ crumb, title, subtitle, children }) {
  return (
    <section className="page-head">
      <div className="container">
        {crumb && <div className="crumbs">{crumb}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ icon = 'inbox', children }) {
  return (
    <div className="empty">
      <Icon name={icon} size={40} />
      {children}
    </div>
  );
}

export const TRACK_STEPS = ['Confirmed', 'Vehicle Assigned', 'Picked Up', 'In Transit', 'Delivered'];

export function StatusTimeline({ status, history = [] }) {
  const idx = TRACK_STEPS.indexOf(status);
  const when = (s) => {
    const h = [...history].reverse().find((x) => x.status === s);
    return h ? dateTime(h.at) : '';
  };
  return (
    <div className="timeline">
      {TRACK_STEPS.map((s, i) => {
        const cls = i <= idx ? 'done' : i === idx + 1 && idx >= 0 ? 'current' : '';
        return (
          <div key={s} className={`timeline-step ${cls}`}>
            <div className="timeline-dot">{cls === 'done' && <Icon name="check" size={14} stroke={3} />}</div>
            <div className="timeline-label">{s}</div>
            <div className="timeline-meta">{when(s) || (i > idx ? (i === idx + 1 ? 'Up next' : 'Pending') : '')}</div>
          </div>
        );
      })}
    </div>
  );
}
