import React from 'react';
import StartNode from '../../../Molecules/Canvas/StartNode/StartNode';
import ExpandedRHSModal from '../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import AgentDetailsBody from '../../../Organisms/Panels/RHS/AgentDetailsBody';
import RHS from '../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Start',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div style={{ padding: 24, color: '#9e9e9e', fontFamily: 'sans-serif', fontSize: 14 }}>
      AgentDetailsNode LHS Preview — not yet implemented
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <StartNode
      title="Review response agent"
      subtitle="All locations"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Agent details"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={<AgentDetailsBody values={{
          agentName: 'Review response agent',
          goals: 'Automatically reply to customer reviews',
          outcomes: 'Improved response rate and customer satisfaction',
          locations: [],
        }} />}
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreview = {
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="agentDetails" title="Agent details" onClose={() => {}} onSave={() => {}}
        bodyProps={{ values: {
          agentName: 'Review response agent',
          goals: 'Automatically reply to customer reviews',
          outcomes: 'Improved response rate and customer satisfaction',
          locations: [],
        } }}
      />
    </div>
  ),
};
