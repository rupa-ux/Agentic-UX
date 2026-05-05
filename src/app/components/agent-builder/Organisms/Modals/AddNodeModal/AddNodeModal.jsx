import React, { useState, useEffect, useRef } from 'react';

const font = '"Roboto", arial, sans-serif';

const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
  padding: '4px 0',
  minWidth: 176,
};

const TOP_ITEMS = [
  { key: 'trigger', title: 'Trigger', icon: 'bolt' },
  { key: 'task',    title: 'Task',    icon: 'task_alt' },
  { key: 'control', title: 'Control', icon: 'call_split' },
];

const SUB_ITEMS = {
  trigger: [
    { title: 'Schedule-based', icon: 'schedule',            type: 'trigger', label: 'Schedule-based',  description: 'Schedule-based' },
    { title: 'Custom',         icon: 'tune',                type: 'trigger', label: 'Custom trigger',  description: 'Custom trigger' },
    { title: 'Entity',         icon: 'category',            type: 'trigger', label: 'Entity',          description: 'Entity' },
  ],
  task: [
    { title: 'Custom',         icon: 'dashboard_customize', type: 'task',    label: 'Custom',          description: 'Custom' },
    { title: 'Entity',         icon: 'category',            type: 'task',    label: 'Entity',          description: 'Entity' },
    { title: 'Conversation',   icon: 'forum',               type: 'task',    label: 'Conversation',    description: 'Conversation' },
  ],
  control: [
    { title: 'Branch',         icon: 'account_tree',        type: 'branch',   label: 'Branch',         description: 'Branch' },
    { title: 'Delay',          icon: 'schedule',            type: 'delay',    label: 'Delay',          description: 'Delay' },
    { title: 'Parallel task',  icon: 'splitscreen_add',     type: 'parallel', label: 'Parallel tasks', description: 'Parallel tasks' },
    { title: 'Loop',           icon: 'repeat',              type: 'loop',     label: 'Loop',           description: 'Loop' },
    { title: 'Sub-workflow',   icon: 'device_hub',          type: 'task',     label: 'Sub-workflow',   description: 'Sub-workflow' },
  ],
};

function MenuItem({ title, icon, active, hasChildren, onClick, onHover }) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '8px 14px', background: active ? '#f5f5f5' : 'none',
        border: 'none', cursor: 'pointer', fontSize: 13, color: '#212121', fontFamily: font,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && (
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#616161' }}>{icon}</span>
        )}
        {title}
      </div>
      {hasChildren && (
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#9e9e9e' }}>chevron_right</span>
      )}
    </button>
  );
}

export default function AddNodeModal({ onSelect, onClose, anchorRect }) {
  const [activeTop, setActiveTop] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const pick = (type, label, description) => {
    onSelect(type, label, description);
    onClose?.();
  };

  // Position to the right of the + button when anchorRect is available
  const positionStyle = anchorRect
    ? {
        position: 'fixed',
        top: anchorRect.bottom + 8,
        left: anchorRect.left + anchorRect.width / 2 - 88,
        transform: 'none',
      }
    : {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
      };

  return (
    <div
      ref={ref}
      style={{
        ...positionStyle,
        zIndex: 1000, display: 'flex', gap: 4, alignItems: 'flex-start',
      }}
    >
      {/* Level 1 */}
      <div style={cardStyle}>
        {TOP_ITEMS.map((item) => (
          <MenuItem
            key={item.key}
            title={item.title}
            icon={item.icon}
            hasChildren
            active={activeTop === item.key}
            onHover={() => setActiveTop(item.key)}
          />
        ))}
      </div>

      {/* Level 2 */}
      {activeTop && (
        <div style={cardStyle}>
          {SUB_ITEMS[activeTop].map((item) => (
            <MenuItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              active={false}
              onHover={() => {}}
              onClick={() => pick(item.type, item.label, item.description)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
