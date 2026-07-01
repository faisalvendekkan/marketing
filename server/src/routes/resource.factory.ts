import { Router } from 'express';
import { ZodSchema } from 'zod';
import { makeCrud, CrudConfig } from '../services/crud.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent, parsePageParams } from '../utils/response';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { logActivity } from '../services/activity.service';

interface ResourceOptions {
  crud: CrudConfig;
  permission: string;              // permission slug required for write ops
  readPermission?: string;         // permission slug for read ops (defaults to permission)
  createSchema?: ZodSchema;
  updateSchema?: ZodSchema;
  entityName: string;              // for activity log labels
}

/** Builds a fully-wired REST router (list/get/create/update/delete) for a resource. */
export function resourceRouter(opts: ResourceOptions): Router {
  const router = Router();
  const crud = makeCrud(opts.crud);
  const readPerm = opts.readPermission ?? opts.permission;

  router.use(authenticate);

  router.get(
    '/',
    authorize(readPerm),
    asyncHandler(async (req, res) => {
      const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
      const q = req.query as Record<string, string>;
      const data = await crud.list({
        companyId: req.user!.companyId,
        page,
        pageSize,
        offset,
        search: q.search,
        sort: q.sort,
        order: q.order === 'asc' ? 'asc' : 'desc',
        filters: q.status ? { status: q.status } : undefined,
      });
      ok(res, data);
    })
  );

  router.get(
    '/:id',
    authorize(readPerm),
    asyncHandler(async (req, res) => {
      const row = await crud.getById(Number(req.params.id), req.user!.companyId);
      ok(res, row);
    })
  );

  router.post(
    '/',
    authorize(opts.permission),
    ...(opts.createSchema ? [validate(opts.createSchema)] : []),
    asyncHandler(async (req, res) => {
      const row = await crud.create(req.body, req.user!.companyId);
      await logActivity({
        companyId: req.user!.companyId,
        userId: req.user!.id,
        action: `create_${opts.entityName}`,
        entityType: opts.entityName,
        entityId: (row as { id: number }).id,
        description: `Created ${opts.entityName}`,
      });
      created(res, row);
    })
  );

  router.patch(
    '/:id',
    authorize(opts.permission),
    ...(opts.updateSchema ? [validate(opts.updateSchema)] : []),
    asyncHandler(async (req, res) => {
      const row = await crud.update(Number(req.params.id), req.body, req.user!.companyId);
      await logActivity({
        companyId: req.user!.companyId,
        userId: req.user!.id,
        action: `update_${opts.entityName}`,
        entityType: opts.entityName,
        entityId: Number(req.params.id),
        description: `Updated ${opts.entityName}`,
      });
      ok(res, row);
    })
  );

  router.delete(
    '/:id',
    authorize(opts.permission),
    asyncHandler(async (req, res) => {
      await crud.remove(Number(req.params.id), req.user!.companyId);
      await logActivity({
        companyId: req.user!.companyId,
        userId: req.user!.id,
        action: `delete_${opts.entityName}`,
        entityType: opts.entityName,
        entityId: Number(req.params.id),
        description: `Deleted ${opts.entityName}`,
      });
      noContent(res);
    })
  );

  return router;
}
