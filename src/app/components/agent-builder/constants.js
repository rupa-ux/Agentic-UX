/**
 * Public string enums for consumers of @aditijagrawal/agent-builder.
 *
 * NODE_TYPES values must match the keys consumed by FlowCanvas's internal
 * React Flow nodeTypes map (start, trigger, task, branch, branchPath, end).
 *
 * RHS_VARIANTS values must match the variant strings accepted by RHS.jsx,
 * with SCHEDULE_BASED reserved as a sentinel so consumers can route to the
 * ScheduleBased component instead of the RHS panel.
 */
export const NODE_TYPES = {
  START: 'start',
  TRIGGER: 'trigger',
  TASK: 'task',
  BRANCH: 'branch',
  BRANCH_PATH: 'branchPath',
  END: 'end',
};

export const RHS_VARIANTS = {
  START: 'start',
  AGENT_DETAILS: 'agentDetails',
  LLM_TASK: 'llmTask',
  ENTITY_TASK: 'entityTask',
  ENTITY_TRIGGER: 'entityTrigger',
  BRANCH: 'branch',
  DELAY: 'delay',
  PARALLEL: 'parallel',
  LOOP: 'loop',
  CONTROL_BRANCH: 'controlBranch',
  SCHEDULE_BASED: 'scheduleBased',
};
