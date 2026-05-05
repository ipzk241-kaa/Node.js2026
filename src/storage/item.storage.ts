import { ItemModel } from '../models/item.model';
import { ItemInput } from '../schemas/item.schema';

class ItemStorage {
  async getAll(filters: any, page: number = 1, limit: number = 10, sort: string = '-createdAt') {
    const query: any = {};

    if (filters.category) query.category = filters.category;
    if (filters.maxCost) query.cost = { $lte: filters.maxCost };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ItemModel.find(query).sort(sort).skip(skip).limit(limit),
      ItemModel.countDocuments(query)
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id: string) {
    return ItemModel.findById(id);
  }

  async create(data: ItemInput) {
    const { description, ...rest } = data;
    return ItemModel.create({
      ...rest,
      ...(description !== undefined && { description })
    });
  }

  async update(id: string, data: Partial<ItemInput>) {
    return ItemModel.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
  }

  async delete(id: string) {
    return ItemModel.findByIdAndDelete(id);
  }

  async getExpensive() {
    return ItemModel.find({ cost: { $gt: 4000 } });
  }
}

export const itemStorage = new ItemStorage();