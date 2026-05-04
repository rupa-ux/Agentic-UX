import React from 'react';
import RHS from '../../../../Organisms/Panels/RHS/RHS';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import BranchBody from '../../../../Organisms/Panels/RHS/BranchBody';

const conditionFieldOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'sentiment', label: 'Sentiment' },
  { value: 'source', label: 'Source' },
];
const conditionOperatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'greater_than', label: 'Greater than' },
];
const conditionValueOptions = [
  { value: '4', label: '4 stars' },
  { value: '5', label: '5 stars' },
];

export default {
  title: 'Agent Builder/Modules/Nodes/Control/BranchDetails',
  parameters: { layout: 'centered' },
};

export const CanvasPreview = {
  render: () => (
    <div style={{
      background: '#fff',
      border: '1px solid #ccd5e4',
      borderRadius: 6,
      padding: '6px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 160,
      fontSize: 13,
      color: '#1a2b4a',
      whiteSpace: 'nowrap',
      fontFamily: '"Roboto", arial, sans-serif',
    }}>
      <span style={{ flex: 1 }}>Positive Reviews</span>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8d9dca' }}>info</span>
      <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8d9dca' }}>more_vert</span>
    </div>
  ),
};

// ── Conditions ────────────────────────────────────────────────────────────────

export const ExpandedRHSConditions = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Branch details"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <BranchBody
            branchType="conditions"
            initialValues={{
              branchName: 'Positive Reviews',
              description: 'Branch for reviews with a rating of 4 stars or above',
              logic: 'AND',
              conditions: [{
                id: 1,
                fieldOptions: conditionFieldOptions,
                operatorOptions: conditionOperatorOptions,
                valueOptions: conditionValueOptions,
                fieldValue: 'rating',
                operatorValue: 'greater_than',
                valueValue: '4',
              }],
            }}
          />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreviewConditions = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="branch" title="Branch details" onClose={() => {}} onSave={() => {}}
        bodyProps={{
          branchType: 'conditions',
          initialValues: {
            branchName: 'Positive Reviews',
            description: 'Branch for reviews with a rating of 4 stars or above',
            logic: 'AND',
            conditions: [{
              id: 1,
              fieldOptions: conditionFieldOptions,
              operatorOptions: conditionOperatorOptions,
              valueOptions: conditionValueOptions,
              fieldValue: 'rating',
              operatorValue: 'greater_than',
              valueValue: '4',
            }],
          },
        }}
      />
    </div>
  ),
};

// ── Field ─────────────────────────────────────────────────────────────────────

export const ExpandedRHSField = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Branch details"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <BranchBody
            branchType="field"
            initialValues={{
              branchName: 'High Ratings',
              fieldValue: '5',
            }}
          />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreviewField = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="branch" title="Branch details" onClose={() => {}} onSave={() => {}}
        bodyProps={{
          branchType: 'field',
          initialValues: {
            branchName: 'High Ratings',
            fieldValue: '5',
          },
        }}
      />
    </div>
  ),
};

// ── Percentage ────────────────────────────────────────────────────────────────

export const ExpandedRHSPercentage = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Branch details"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <BranchBody
            branchType="percentage"
            initialValues={{
              branchName: 'Group A',
              percentage: 40,
            }}
          />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreviewPercentage = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="branch" title="Branch details" onClose={() => {}} onSave={() => {}}
        bodyProps={{
          branchType: 'percentage',
          initialValues: {
            branchName: 'Group A',
            percentage: 40,
          },
        }}
      />
    </div>
  ),
};

// ── LLM ───────────────────────────────────────────────────────────────────────

export const ExpandedRHSLlm = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Branch details"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <BranchBody
            branchType="llm"
            initialValues={{
              branchName: 'Positive Review',
            }}
          />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreviewLlm = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="branch" title="Branch details" onClose={() => {}} onSave={() => {}}
        bodyProps={{
          branchType: 'llm',
          initialValues: {
            branchName: 'Positive Review',
          },
        }}
      />
    </div>
  ),
};
