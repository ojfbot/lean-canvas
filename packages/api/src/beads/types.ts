/**
 * LeanBeadLike — FrameBeadLike shape for Lean Canvas threads.
 *
 * Satisfies the FrameBeadLike contract defined in ADR-0016 (core repo).
 * Deliberately not imported from @core/workflows to avoid cross-repo coupling.
 *
 * Prefix: "lean-"
 * sourceApp: "lean-canvas"
 *
 * Note: canvas state is currently in-memory placeholder.
 * This route returns an empty array until persistent storage is added.
 */

export type LeanBeadStatus = 'created' | 'live' | 'closed' | 'archived';

export interface LeanBead {
  id: string;
  type: 'task';
  status: LeanBeadStatus;
  sourceApp: 'lean-canvas';
  created_at: string;
  updated_at: string;
  payload: {
    section: string;
    threadId: string;
    messageCount: number;
  };
}
