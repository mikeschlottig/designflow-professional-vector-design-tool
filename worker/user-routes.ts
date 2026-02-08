import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, DesignEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Design } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'DesignFlow API' }}));
  // DESIGNS
  app.get('/api/designs', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await DesignEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/designs', async (c) => {
    const body = (await c.req.json()) as Partial<Design>;
    const id = crypto.randomUUID();
    const now = Date.now();
    const design: Design = {
      ...DesignEntity.initialState,
      id,
      name: body.name?.trim() || "Untitled Design",
      createdAt: now,
      updatedAt: now,
    };
    return ok(c, await DesignEntity.create(c.env, design));
  });
  app.get('/api/designs/:id', async (c) => {
    const design = new DesignEntity(c.env, c.req.param('id'));
    if (!await design.exists()) return notFound(c, 'design not found');
    return ok(c, await design.getState());
  });
  app.put('/api/designs/:id', async (c) => {
    const id = c.req.param('id');
    const body = (await c.req.json()) as Partial<Design>;
    const design = new DesignEntity(c.env, id);
    if (!await design.exists()) return notFound(c, 'design not found');
    const updated = await design.mutate(s => ({
      ...s,
      ...body,
      id, // protect id
      updatedAt: Date.now()
    }));
    return ok(c, updated);
  });
  app.delete('/api/designs/:id', async (c) => {
    return ok(c, { id: c.req.param('id'), deleted: await DesignEntity.delete(c.env, c.req.param('id')) });
  });
  // USERS & CHATS (Existing Boilerplate)
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const page = await UserEntity.list(c.env, c.req.query('cursor') ?? null);
    return ok(c, page);
  });
}