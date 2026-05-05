import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  name: string;
  description?: string;
  cost: number;
  category: 'Basic' | 'Upgraded' | 'Neutral';
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true, 
      minlength: 1, 
      maxlength: 100 
    },
    description: { 
      type: String, 
      maxlength: 500 
    },
    cost: { 
      type: Number, 
      required: true, 
      min: 0,
      validate: {
        validator: function(v: number) {
          return v % 5 === 0;
        },
        message: (props: {value:number}) => `${props.value} не є кратною 5!`
      }
    },
    category: { 
      type: String, 
      required: true, 
      enum: ['Basic', 'Upgraded', 'Neutral'] 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

itemSchema.virtual('isPremium').get(function() {
  return this.cost > 4000;
});

export const ItemModel = mongoose.model<IItem>('Item', itemSchema);