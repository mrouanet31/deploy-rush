/**
 * Event definitions — the heart of gameplay balance.
 *
 * Tweak points, gauge effects, required actions and spawn weights here.
 * Adding a new event type only requires: (1) extend PipelineEventType in
 * types.ts, (2) add an entry below.
 */
import { Colors } from '../constants';
import type { PipelineEventDefinition, PipelineEventType } from '../types';

export const EVENT_DEFINITIONS: Record<PipelineEventType, PipelineEventDefinition> = {
  FEATURE: {
    type: 'FEATURE',
    label: 'Feature',
    icon: '\u2726', // ✦
    color: Colors.green,
    lane: 'DEPLOY',
    sequence: ['TEST', 'DEPLOY'],
    onSuccess: { score: 100, buildStability: 2, featureShipped: true },
    onIgnore: { score: -10, buildStability: -6 },
    onWrong: { score: -25, buildStability: -8 },
    dangerousActions: ['DEPLOY'], // deploying before testing
    dangerousEffect: { score: -30, buildStability: -18, productionHealth: -6 },
    basePoints: 100,
    weight: 24
  },

  BUG: {
    type: 'BUG',
    label: 'Bug',
    icon: '\u2716', // ✖
    color: Colors.orange,
    lane: 'CODE',
    sequence: ['FIX'],
    onSuccess: { score: 80, productionHealth: 3 },
    onIgnore: { score: -15, productionHealth: -10 },
    onWrong: { score: -20 },
    basePoints: 80,
    weight: 20
  },

  BROKEN_TEST: {
    type: 'BROKEN_TEST',
    label: 'Broken Test',
    icon: '\u26A0', // ⚠
    color: Colors.yellow,
    lane: 'TEST',
    sequence: ['TEST'],
    altFirstActions: ['FIX'],
    onSuccess: { score: 90, buildStability: 5 },
    onIgnore: { score: -12, buildStability: -15 },
    onWrong: { score: -18, buildStability: -6 },
    basePoints: 90,
    weight: 16
  },

  SECURITY_FINDING: {
    type: 'SECURITY_FINDING',
    label: 'Security Finding',
    icon: '\u26E8', // ⛨-ish shield
    color: Colors.red,
    lane: 'SECURITY',
    sequence: ['BLOCK'],
    altFirstActions: ['FIX'],
    onSuccess: { score: 150, productionHealth: 2 },
    onIgnore: { score: -25, productionHealth: -20, resetCombo: true, majorIncident: true },
    onWrong: { score: -30, productionHealth: -10 },
    basePoints: 150,
    weight: 12,
    critical: true
  },

  MERGE_CONFLICT: {
    type: 'MERGE_CONFLICT',
    label: 'Merge Conflict',
    icon: '\u2442', // ⑂-ish
    color: Colors.purple,
    lane: 'CODE',
    sequence: ['ANALYZE', 'FIX'],
    onSuccess: { score: 120, buildStability: 2 },
    onIgnore: { score: -14, buildStability: -10 },
    onWrong: { score: -22, buildStability: -20 },
    basePoints: 120,
    weight: 12
  },

  PROD_ALERT: {
    type: 'PROD_ALERT',
    label: 'Prod Alert',
    icon: '\u2762', // ❢
    color: Colors.red,
    lane: 'DEPLOY',
    sequence: ['ROLLBACK'],
    onSuccess: { score: 180, productionHealth: 10 },
    onIgnore: { score: -30, productionHealth: -25, resetCombo: true, majorIncident: true },
    onWrong: { score: -25, productionHealth: -8 },
    basePoints: 180,
    weight: 10,
    critical: true
  },

  TECH_DEBT: {
    type: 'TECH_DEBT',
    label: 'Tech Debt',
    icon: '\u2699', // ⚙
    color: Colors.cyan,
    lane: 'PLAN',
    sequence: ['ANALYZE'],
    altFirstActions: ['FIX'],
    onSuccess: { score: 60, techDebt: -10 },
    onIgnore: { score: -5, techDebt: 10 },
    onWrong: { score: -10, techDebt: 4 },
    basePoints: 60,
    weight: 16
  },

  APPROVAL_REQUIRED: {
    type: 'APPROVAL_REQUIRED',
    label: 'Approval Required',
    icon: '\u2713', // ✓
    color: Colors.yellow,
    lane: 'SECURITY',
    sequence: ['BLOCK'],
    altFirstActions: ['ANALYZE'],
    onSuccess: { score: 70, buildStability: 2 },
    onIgnore: { score: -12, buildStability: -8 },
    onWrong: { score: -15 },
    dangerousActions: ['DEPLOY'],
    dangerousEffect: { score: -40, productionHealth: -20, resetCombo: true, majorIncident: true },
    basePoints: 70,
    weight: 14
  },

  FLAKY_TEST: {
    type: 'FLAKY_TEST',
    label: 'Flaky Test',
    icon: '\u2685', // ⚅ die
    color: Colors.yellow,
    lane: 'TEST',
    sequence: ['ANALYZE', 'TEST'],
    onSuccess: { score: 110, buildStability: 3 },
    onIgnore: { score: -12, buildStability: -10 },
    onWrong: { score: -16, buildStability: -6 },
    basePoints: 110,
    weight: 12
  },

  DEPENDENCY_BUMP: {
    type: 'DEPENDENCY_BUMP',
    label: 'Dependency Bump',
    icon: '\u2191', // ↑
    color: Colors.cyan,
    lane: 'CODE',
    sequence: ['FIX'],
    altFirstActions: ['ANALYZE'],
    onSuccess: { score: 70, techDebt: -6 },
    onIgnore: { score: -8, techDebt: 8 },
    onWrong: { score: -12 },
    basePoints: 70,
    weight: 13
  },

  DODGY_PR: {
    type: 'DODGY_PR',
    label: 'Dodgy PR',
    icon: '\u2371', // ⍱-ish branch
    color: Colors.orange,
    lane: 'CODE',
    sequence: ['BLOCK'],
    altFirstActions: ['ANALYZE'],
    onSuccess: { score: 90, buildStability: 2 },
    onIgnore: { score: -14, buildStability: -8 },
    onWrong: { score: -16, buildStability: -6 },
    dangerousActions: ['DEPLOY'],
    dangerousEffect: { score: -35, buildStability: -18, productionHealth: -10, resetCombo: true, majorIncident: true },
    basePoints: 90,
    weight: 12
  },

  ONCALL_PAGE: {
    type: 'ONCALL_PAGE',
    label: 'On-call Page',
    icon: '\u260E', // ☎
    color: Colors.red,
    lane: 'DEPLOY',
    sequence: ['ANALYZE', 'ROLLBACK'],
    onSuccess: { score: 200, productionHealth: 12 },
    onIgnore: { score: -28, productionHealth: -25, resetCombo: true, majorIncident: true },
    onWrong: { score: -25, productionHealth: -10 },
    basePoints: 200,
    weight: 8,
    critical: true
  },

  MEGA_RELEASE: {
    type: 'MEGA_RELEASE',
    label: 'Release Train',
    icon: '\u21C9', // ⇉
    color: Colors.purple,
    lane: 'CODE',
    sequence: ['ANALYZE', 'TEST', 'BLOCK', 'DEPLOY'],
    onSuccess: { score: 400, buildStability: 6, productionHealth: 6, featureShipped: true },
    onIgnore: { score: -45, buildStability: -18, productionHealth: -18, resetCombo: true, majorIncident: true },
    onWrong: { score: -30, buildStability: -12 },
    basePoints: 400,
    weight: 0,
    critical: true,
    mega: true,
    chain: true
  },

  COFFEE_BREAK: {
    type: 'COFFEE_BREAK',
    label: 'Coffee Break',
    icon: '\u2615', // ☕
    color: Colors.purple,
    lane: 'PLAN',
    sequence: ['CONTEXT'],
    onSuccess: { score: 40 },
    onIgnore: { score: 0 },
    onWrong: { score: 0 },
    basePoints: 40,
    weight: 6,
    powerUp: 'SLOW'
  },

  HOTFIX: {
    type: 'HOTFIX',
    label: 'Hotfix',
    icon: '\u26A1', // ⚡
    color: Colors.green,
    lane: 'DEPLOY',
    sequence: ['CONTEXT'],
    onSuccess: { score: 60 },
    onIgnore: { score: 0 },
    onWrong: { score: 0 },
    basePoints: 60,
    weight: 5,
    powerUp: 'CLEAR'
  }
};

export const ALL_EVENT_TYPES = Object.keys(EVENT_DEFINITIONS) as PipelineEventType[];
