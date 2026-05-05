import request from 'supertest';
import { app } from '../src/app';
import {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
} from './setup';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe('Item API with MongoDB', () => {
  const validItem = {
    name: 'Blink Dagger',
    description: 'Teleport short distance',
    cost: 2250,
    category: 'Basic',
  };

  it('should create item', async () => {
    const res = await request(app).post('/api/items').send(validItem);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('should fail validation', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should get all items', async () => {
    await request(app).post('/api/items').send(validItem);

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should get item by id', async () => {
    const create = await request(app)
      .post('/api/items')
      .send(validItem);

    const res = await request(app).get(
      `/api/items/${create.body.id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(create.body.id);
  });

  it('should return 400 for invalid mongo ID', async () => {
    const res = await request(app).get('/api/items/invalid123');

    expect(res.status).toBe(400);
  });

  it('should return 404 for missing item', async () => {
    const res = await request(app).get(
      '/api/items/69d79b54722186eb408dcdc8'
    );

    expect(res.status).toBe(404);
  });

  it('should update item', async () => {
    const create = await request(app)
      .post('/api/items')
      .send(validItem);

    const res = await request(app)
      .put(`/api/items/${create.body.id}`)
      .send({ cost: 3000 });

    expect(res.status).toBe(200);
    expect(res.body.cost).toBe(3000);
  });

  it('should return 404 on update missing item', async () => {
    const res = await request(app)
      .put('/api/items/69d79b54722186eb408dcdc8')
      .send({ cost: 1 });
    expect(res.status).toBe(404);
  });

  it('should delete item', async () => {
    const create = await request(app)
      .post('/api/items')
      .send(validItem);

    const res = await request(app).delete(
      `/api/items/${create.body.id}`
    );

    expect(res.status).toBe(204);
  });

  it('should return 404 on delete missing item', async () => {
    const res = await request(app).delete(
      '/api/items/69d79b54722186eb408dcdc8'
    );

    expect(res.status).toBe(404);
  });

  it('should filter by category', async () => {
    await request(app).post('/api/items').send(validItem);

    await request(app).post('/api/items').send({
      ...validItem,
      category: 'Neutral',
    });

    const res = await request(app).get(
      '/api/items?category=Neutral'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('should filter by maxCost', async () => {
    await request(app).post('/api/items').send(validItem);

    await request(app).post('/api/items').send({
      ...validItem,
      cost: 5000,
    });

    const res = await request(app).get(
      '/api/items?maxCost=3000'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('should combine filters', async () => {
    await request(app).post('/api/items').send(validItem);

    await request(app).post('/api/items').send({
      ...validItem,
      cost: 5000,
      category: 'Neutral',
    });

    const res = await request(app).get(
      '/api/items?category=Neutral&maxCost=6000'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('should return expensive items', async () => {
    await request(app).post('/api/items').send(validItem);

    await request(app).post('/api/items').send({
      ...validItem,
      cost: 5000,
    });

    const res = await request(app).get(
      '/api/items/expensive'
    );

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
  
  it('should return 404 for valid but missing item (GET /:id)', async () => {
    const res = await request(app).get(`/api/items/69d79b54722186eb408dcdc8`);
    expect(res.status).toBe(404);
  });

  it('should return 404 on update missing item (PUT /:id)', async () => {
    const res = await request(app).put(`/api/items/69d79b54722186eb408dcdc8`).send({ cost: 1000 });
    expect(res.status).toBe(404);
  });

  it('should return 404 on delete missing item (DELETE /:id)', async () => {
    const res = await request(app).delete(`/api/items/69d79b54722186eb408dcdc8`);
    expect(res.status).toBe(404);
  });

  it('should return 500 for unexpected error', async () => {
    const spy = jest
      .spyOn(require('../src/models/item.model'), 'ItemModel')
      .mockImplementation(() => {
        throw new Error('Unexpected failure');
      });

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty(
      'error',
      'Internal Server Error'
    );
    spy.mockRestore();
  });

  it('should return 500 when database fails on creation (POST)', async () => {
    const spy = jest
      .spyOn(require('../src/models/item.model').ItemModel, 'create')
      .mockImplementationOnce(() => {
        throw new Error('Simulated Database Error');
      });

    const res = await request(app).post('/api/items').send({
      name: 'Test Item',
      cost: 100,
      category: 'Basic'
    });

    expect(res.status).toBe(500);
    
    spy.mockRestore();
  });

  it('should return 409 for duplicate key error', async () => {
    const spy = jest
      .spyOn(require('../src/models/item.model').ItemModel, 'create')
      .mockImplementationOnce(() => {
        const error: any = new Error('MongoServerError: E11000 duplicate key error collection');
        error.code = 11000;
        throw error;
      });

    const res = await request(app).post('/api/items').send({
      name: 'Duplicate Item',
      cost: 50,
      category: 'Basic'
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Duplicate key error');

    spy.mockRestore();
  });
});