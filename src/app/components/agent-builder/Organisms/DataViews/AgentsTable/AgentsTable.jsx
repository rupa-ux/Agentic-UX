import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Badge } from '@/app/components/ui/badge';
import './AgentsTable.css';

const STATUS_VARIANT = {
  Running: 'default',
  Paused:  'secondary',
  Draft:   'outline',
};

const STATUS_COLOR = {
  Running: { background: '#e8f5e9', color: '#2e7d32' },
  Paused:  { background: '#fff8e1', color: '#f57f17' },
  Draft:   { background: '#f5f5f5', color: '#616161' },
};

function StatusCell({ status }) {
  const style = STATUS_COLOR[status] ?? STATUS_COLOR.Draft;
  return (
    <Badge style={{ ...style, border: 'none', fontWeight: 400, fontSize: 12 }}>
      {status}
    </Badge>
  );
}

function LocationCell({ count }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, color: '#212121' }}>{count}</span>
      <span
        className="material-symbols-outlined"
        style={{
          fontFamily: "'Material Symbols Outlined'",
          fontStyle: 'normal',
          fontSize: 16,
          color: '#555',
          lineHeight: 1,
          fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
        }}
      >
        expand_more
      </span>
    </span>
  );
}

const MENU_ITEMS = ['Edit', 'Duplicate', 'Outcomes', 'Delete'];

export function ActionsCell({ agent, onAction }) {
  const [open, setOpen] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState({ top: 0, right: 0 });
  const btnRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle(e) {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(o => !o);
  }

  const pauseLabel = agent.status === 'Paused' ? 'Resume' : 'Pause';

  return (
    <div className="actions-cell">
      <button
        ref={btnRef}
        className="actions-cell-btn"
        onClick={handleToggle}
        aria-label="More actions"
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontFamily: "'Material Symbols Outlined'",
            fontStyle: 'normal',
            fontSize: 20,
            color: '#555',
            lineHeight: 1,
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
          }}
        >
          more_vert
        </span>
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="actions-dropdown"
          style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
        >
          <button
            className="actions-dropdown-item"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onAction?.('Edit', agent); }}
          >
            Edit
          </button>
          <button
            className="actions-dropdown-item"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onAction?.('Pause', agent); }}
          >
            {pauseLabel}
          </button>
          {MENU_ITEMS.slice(1).map(item => (
            <button
              key={item}
              className="actions-dropdown-item"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onAction?.(item, agent); }}
            >
              {item}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

const DEFAULT_AGENTS = [
  { id: 1, name: 'Review response agent replying autonomously - North Region', status: 'Running',  reviewsResponded: 102, responseRate: '15%', avgResponseTime: '20m', timeSaved: '4h 20m', locations: 500 },
  { id: 2, name: 'Review response agent replying autonomously - East Region',  status: 'Running',  reviewsResponded: 98,  responseRate: '9%',  avgResponseTime: '5m',  timeSaved: '1h 10m', locations: 250 },
  { id: 3, name: 'Review response agent replying autonomously - South Region', status: 'Paused',   reviewsResponded: 53,  responseRate: '9%',  avgResponseTime: '10m', timeSaved: '45m',    locations: 200 },
  { id: 4, name: 'Review response agent replying autonomously - West Region',  status: 'Draft',    reviewsResponded: 35,  responseRate: '8%',  avgResponseTime: '2m',  timeSaved: '3h 20m', locations: 100 },
];

const COLUMNS = [
  { key: 'name',             label: 'Agent name',            width: 320 },
  { key: 'status',           label: 'Status',                width: 110 },
  { key: 'reviewsResponded', label: 'Reviews responded',     width: 160 },
  { key: 'responseRate',     label: 'Response rate',         width: 130 },
  { key: 'avgResponseTime',  label: 'Average response time', width: 170 },
  { key: 'timeSaved',        label: 'Time saved',            width: 120 },
  { key: 'locations',        label: 'Locations',             width: 110 },
  { key: 'actions',          label: '',                      width: 52  },
];

export default function AgentsTable({ agents = DEFAULT_AGENTS, onRowClick, onAction }) {
  return (
    <div style={{ background: '#fff', overflowX: 'auto' }} className="agents-table">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Roboto", arial, sans-serif', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e9f0' }}>
            {COLUMNS.map((col) => (
              <th key={col.key} style={{ width: col.width, padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#555', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr
              key={agent.id}
              style={{ borderBottom: '1px solid #f0f0f0', cursor: onRowClick ? 'pointer' : 'default' }}
              onClick={() => onRowClick?.(agent)}
            >
              <td style={{ padding: '12px 12px', color: '#212121', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</td>
              <td style={{ padding: '12px 12px' }}><StatusCell status={agent.status} /></td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{agent.reviewsResponded}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{agent.responseRate}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{agent.avgResponseTime}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{agent.timeSaved}</td>
              <td style={{ padding: '12px 12px' }}><LocationCell count={agent.locations} /></td>
              <td style={{ padding: '12px 4px' }} onClick={(e) => e.stopPropagation()}>
                <ActionsCell agent={agent} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

AgentsTable.propTypes = {
  agents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Running', 'Paused', 'Draft']),
    reviewsResponded: PropTypes.number,
    responseRate: PropTypes.string,
    avgResponseTime: PropTypes.string,
    timeSaved: PropTypes.string,
    locations: PropTypes.number,
  })),
  onRowClick: PropTypes.func,
  onAction: PropTypes.func,
};
