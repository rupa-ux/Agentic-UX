import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import RHSPanelHeader from '../RHSHeader/RHSHeader';
import RHSPanelFooter from '../RHSFooter/RHSFooter';
import LocationsDrawer from '../../../RHSDrawer/LocationsDrawer';
import ChannelConfig from '../../ChannelConfig/ChannelConfig';
import AdvancedConfigDrawer from './AdvancedConfigDrawer';

const font = '"Roboto", arial, sans-serif';


export function RHSStartBody({ initialValues = {}, onValuesChange }) {
  const [values, setValues] = useState({
    name:      initialValues.name      ?? '',
    goals:     initialValues.goals     ?? '',
    outcomes:  initialValues.outcomes  ?? '',
    locations: initialValues.locations ?? [],
  });
  const [channelValues, setChannelValues] = useState(initialValues.channelValues ?? {});
  const [channels, setChannels] = useState(initialValues.channels ?? []);
  const [activeChannel, setActiveChannel] = useState(initialValues.channels?.[0] ?? null);

  useEffect(() => {
    onValuesChange?.({ ...values, channels, channelValues });
  }, [values, channels, channelValues]);
  const [showLocations, setShowLocations] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const set = (field) => (val) => setValues((v) => ({ ...v, [field]: val }));

  const handleChannelChange = (vals) => {
    setChannels(vals);
    if (!vals.includes(activeChannel)) setActiveChannel(vals[0] ?? null);
  };

  if (showLocations) {
    return (
      <LocationsDrawer
        selectedIds={(values.locations || []).map((l) => l.id)}
        onBack={() => setShowLocations(false)}
        onSave={(selected) => { set('locations')(selected); setShowLocations(false); }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Name <span style={{ color: '#de1b0c' }}>*</span>
        </label>
        <Input
          name="name"
          type="text"
          placeholder="Enter name"
          value={values.name}
          onChange={(e) => set('name')(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Goals <span style={{ color: '#de1b0c' }}>*</span>
        </label>
        <Textarea
          name="goals"
          placeholder="Enter goals"
          value={values.goals}
          onChange={(e) => set('goals')(e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Outcomes
        </label>
        <Textarea
          name="outcomes"
          placeholder="Enter outcomes"
          value={values.outcomes}
          onChange={(e) => set('outcomes')(e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
        />
      </div>

      {/* Locations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 400, lineHeight: '18px', fontFamily: font }}>
          <span style={{ color: '#212121' }}>Locations</span>
          <span style={{ color: '#de1b0c' }}>*</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer', lineHeight: 1 }}>info</span>
        </div>
        {values.locations.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {values.locations.slice(0, 4).map((loc) => (
              <span key={loc.id} onClick={() => setShowLocations(true)} style={{ cursor: 'pointer' }}>
                <Badge variant="secondary" style={{ fontWeight: 400, fontSize: 12, background: '#f5f5f5', color: '#212121', border: 'none' }}>
                  {loc.name || loc.id}
                </Badge>
              </span>
            ))}
            {values.locations.length > 4 && (
              <span onClick={() => setShowLocations(true)} style={{ fontSize: 12, fontWeight: 500, color: '#1976d2', fontFamily: font, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                +{values.locations.length - 4} more
              </span>
            )}
          </div>
        )}
        {values.locations.length === 0 && (
          <span onClick={() => setShowLocations(true)} style={{ fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#1976d2', cursor: 'pointer', fontFamily: font }}>
            + Add
          </span>
        )}
      </div>

      {showAdvancedConfig && (
        <AdvancedConfigDrawer
          channels={channels}
          values={channelValues}
          onChange={(field, val) => setChannelValues((v) => ({ ...v, [field]: val }))}
          onBack={() => setShowAdvancedConfig(false)}
        />
      )}
      <ChannelConfig
        channels={channels}
        activeChannel={activeChannel}
        values={channelValues}
        onChange={(field, val) => setChannelValues((v) => ({ ...v, [field]: val }))}
        onChannelChange={handleChannelChange}
        onActiveChannelChange={setActiveChannel}
        onAdvancedConfig={() => setShowAdvancedConfig(true)}
      />
    </div>
  );
}

export default function RHSStart({ onClose, onExpand, onPreview, onSave, onValuesChange, initialValues = {} }) {
  const currentValuesRef = useRef(initialValues);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 390, height: '100%', background: '#ffffff', borderLeft: '1px solid #e5e9f0', fontFamily: font }}>
      <RHSPanelHeader
        title="Agent details"
        showActions={false}
        onPreview={onPreview}
        onExpand={onExpand}
        onClose={onClose}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 15px', boxSizing: 'border-box' }}>
        <RHSStartBody
          initialValues={initialValues}
          onValuesChange={(v) => { currentValuesRef.current = v; onValuesChange?.(v); }}
        />
      </div>
      <RHSPanelFooter onSave={() => onSave?.(currentValuesRef.current)} />
    </div>
  );
}
