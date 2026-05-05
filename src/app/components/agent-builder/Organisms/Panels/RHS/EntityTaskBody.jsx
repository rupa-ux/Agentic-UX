import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import ToolSelectionDrawer from '../../Drawers/ToolSelectionDrawer/ToolSelectionDrawer.jsx';

const font = '"Roboto", arial, sans-serif';

const toOptions = (items) => items.map((item) => ({ value: item, label: item }));

const CATEGORY_TASK_OPTIONS = {
  Review:       toOptions(['Respond to a review', 'Translate a review', 'Categorize a review', 'Analyze review sentiment']),
  Listings:     toOptions(['Update a listing', 'Publish a listing', 'Unpublish a listing']),
  Social:       toOptions(['Post to social', 'Reply to comment', 'Schedule a post']),
  Appointments: toOptions(['Book an appointment', 'Cancel an appointment', 'Send a reminder']),
  Contacts:     toOptions(['Create a contact', 'Update a contact', 'Tag a contact']),
  Ticketing:    toOptions(['Create a ticket', 'Update a ticket', 'Assign a ticket', 'Close a ticket']),
  Payments:     toOptions(['Send a payment request', 'Issue a refund', 'Send a receipt']),
};

const ENTITY_OPTIONS = Object.keys(CATEGORY_TASK_OPTIONS);

function SectionLabel({ label, showInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {showInfo && <i className="icon_phoenix-info" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer' }} />}
    </div>
  );
}

function BirdeyeLogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M13.3917 11.1779L13.3917 11.1777L13.3884 11.1764C13.3427 11.1566 13.2963 11.1382 13.2492 11.1213L8.4815 9.2361L8.4811 9.23678C8.35058 9.17904 8.20644 9.14634 8.05442 9.14634C7.47307 9.14634 7.00177 9.61526 7.00177 10.1937C7.00177 10.4328 7.08322 10.6524 7.21878 10.8287L7.21815 10.8294L7.22638 10.8388C7.25047 10.8694 7.27589 10.899 7.30322 10.9267L10.7214 14.834L10.7215 14.8339C11.1477 15.3122 11.7696 15.6141 12.4625 15.6141C13.7472 15.6141 14.7887 14.5779 14.7887 13.2997C14.7887 12.3502 14.2138 11.5348 13.3917 11.1779ZM11.8213 3.30004C12.9023 2.96157 14.0671 3.52057 14.423 4.54845C14.7789 5.57628 14.1911 6.68381 13.11 7.02232C12.0291 7.36065 10.8642 6.80165 10.5083 5.77387C10.1525 4.74594 10.7403 3.63836 11.8213 3.30004ZM19.3037 4.55494C19.1465 4.33349 18.918 4.19165 18.6698 4.12919L18.6696 4.12553L17.7376 3.88127C17.7241 3.83762 17.7153 3.79342 17.7006 3.74981C16.7328 0.88883 13.5653 -0.666909 10.6255 0.274993C9.10257 0.762827 7.94445 1.82742 7.31168 3.13598L5.62757 5.8118L1.63029 4.23472L1.62765 4.23765C1.37588 4.13542 1.08869 4.11296 0.809326 4.20242C0.191925 4.40034 -0.143909 5.04775 0.0593137 5.64877C0.0891145 5.73657 0.131345 5.81658 0.179153 5.89181L0.172205 5.8998L4.34266 11.42C4.34643 11.425 4.34829 11.4305 4.35205 11.4353C4.35577 11.4405 4.36067 11.4445 4.36463 11.4496L7.34833 15.6315C8.65209 17.9597 11.4727 19.3609 14.1956 18.4885C17.1352 17.5468 18.734 14.464 17.7661 11.603C17.4648 10.7126 16.9502 9.94884 16.2958 9.34724C17.1208 8.5594 17.6806 7.54286 17.8898 6.43972L18.7912 6.17934L18.7906 6.16949C18.8705 6.13933 18.9487 6.10284 19.0223 6.05338C19.5251 5.71523 19.6512 5.04444 19.3037 4.55494Z" fill="#1976D2"/>
    </svg>
  );
}

function ExternalToolIcon({ color, initials }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="16" r="16" fill={color} />
      <text
        x="16" y="16"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#fff"
        fontSize={initials.length > 1 ? '9' : '12'}
        fontFamily="Roboto, Arial, sans-serif"
        fontWeight="600"
      >
        {initials}
      </text>
    </svg>
  );
}

function ToolItem({ tool, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        border: '1px solid #e5e9f0', borderRadius: 4,
        padding: '12px', width: '100%', boxSizing: 'border-box',
        background: hovered ? '#f5f7fa' : 'white', cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {tool.initials
        ? <ExternalToolIcon color={tool.color} initials={tool.initials} />
        : <BirdeyeLogoIcon />
      }
      <span style={{ flex: 1, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.28px', color: '#212121', fontFamily: font }}>
        {tool.name}
      </span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#555' }}>edit</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#555' }}>sync</span>
      </div>
    </button>
  );
}

function AddBox({ onAdd }) {
  return (
    <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, padding: '12px 10px', width: '100%', boxSizing: 'border-box' }}>
      <button
        onClick={onAdd}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <i className="icon_phoenix-add_circle" style={{ fontSize: 20, color: '#1976d2' }} />
        <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#1976d2', fontFamily: font }}>Add</span>
      </button>
    </div>
  );
}

export default function EntityTaskBody({ category, initialValues = {}, onChange }) {
  const isGeneric = !CATEGORY_TASK_OPTIONS[category];
  const [selectedEntity, setSelectedEntity] = useState(initialValues.entity ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [isToolDrawerOpen, setIsToolDrawerOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(initialValues.tool ?? null);

  const resolvedCategory = isGeneric ? selectedEntity : category;
  const taskOptions = CATEGORY_TASK_OPTIONS[resolvedCategory] ?? [];

  function handleToolSelect(tool) {
    setSelectedTool(tool);
    setIsToolDrawerOpen(false);
    onChange?.('tool', tool);
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {isGeneric && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
              Entity <span style={{ color: '#de1b0c' }}>*</span>
            </span>
            <Select
              value={selectedEntity}
              onValueChange={(v) => { setSelectedEntity(v); onChange?.('entity', v); onChange?.('taskName', ''); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
            Task <span style={{ color: '#de1b0c' }}>*</span>
          </span>
          <Select
            value={initialValues.taskName || ''}
            onValueChange={(v) => onChange?.('taskName', v)}
            disabled={isGeneric && !selectedEntity}
          >
            <SelectTrigger>
              <SelectValue placeholder={isGeneric && !selectedEntity ? 'Select entity first' : 'Select task'} />
            </SelectTrigger>
            <SelectContent>
              {taskOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>Description</span>
          <Textarea
            name="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => { setDescription(e.target.value); onChange?.('description', e.target.value); }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SectionLabel label="Tools" showInfo />
          {selectedTool
            ? <ToolItem tool={selectedTool} onClick={() => setIsToolDrawerOpen(true)} />
            : <AddBox onAdd={() => setIsToolDrawerOpen(true)} />
          }
        </div>
      </div>
      <ToolSelectionDrawer
        isOpen={isToolDrawerOpen}
        onClose={() => setIsToolDrawerOpen(false)}
        onToolSelect={handleToolSelect}
        onConnect={() => {}}
        onAddCustom={() => {}}
      />
    </>
  );
}
