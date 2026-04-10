import { Router, type Request, type Response } from 'express';

const router: Router = Router();

/**
 * GET /api/beads
 *
 * FrameBeadLike projection endpoint (ADR-0016).
 * Read-only — Mayor/frame-agent aggregation endpoint.
 *
 * Currently returns empty: canvas state is in-memory placeholder.
 * Once persistent thread storage is added, this will return
 * canvas threads as beads with lean- prefix.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({ beads: [], count: 0 });
});

export default router;
