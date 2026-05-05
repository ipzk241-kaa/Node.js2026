import { Router } from 'express';
import { itemStorage } from '../storage/item.storage';
import { createSchema, updateSchema } from '../schemas/item.schema';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, maxCost, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const filters: { category?: string; maxCost?: number } = {};

    if (typeof category === 'string') {
      filters.category = category;
    }

    if (typeof maxCost === 'string') {
      filters.maxCost = Number(maxCost);
    }

    const result = await itemStorage.getAll(
      filters,
      Number(page),
      Number(limit),
      sort as string
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/expensive', async (req, res, next) => {
  try {
    const items = await itemStorage.getExpensive();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const item = await itemStorage.getById(id);

    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const item = await itemStorage.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const updated = await itemStorage.update(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const deleted = await itemStorage.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;