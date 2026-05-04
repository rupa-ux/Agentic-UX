import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import BranchNode from './BranchNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import ControlBranchBody from '../../../../Organisms/Panels/RHS/ControlBranchBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Control/Branch',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Branch" icon="account_tree" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BranchNode hasToggle toggleEnabled hasAddButton stepNumber={3} basedOn="conditions" />
      <BranchNode hasToggle toggleEnabled hasAddButton stepNumber={3} basedOn="field" />
      <BranchNode hasToggle toggleEnabled hasAddButton stepNumber={3} basedOn="percentage" />
      <BranchNode hasToggle toggleEnabled hasAddButton stepNumber={3} basedOn="llm" />
    </div>
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Branch"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <ControlBranchBody initialValues={{
            basedOn: 'conditions',
            branches: [
              { id: 1, name: 'Positive Reviews' },
              { id: 2, name: 'Negative Reviews' },
              { id: 3, name: 'Neutral Reviews' },
            ],
          }} />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreview = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="controlBranch" title="Branch" onClose={() => {}} onSave={() => {}}
        bodyProps={{ initialValues: {
          basedOn: 'conditions',
          branches: [
            { id: 1, name: 'Positive Reviews' },
            { id: 2, name: 'Negative Reviews' },
            { id: 3, name: 'Neutral Reviews' },
          ],
        } }}
      />
    </div>
  ),
};
