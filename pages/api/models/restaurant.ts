import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkingHour {
  day: string;
  morningOpen?: string;
  morningClose?: string;
  afternoonOpen?: string;
  afternoonClose?: string;
  closed: boolean;
}

export interface IDish {
  name: string;
  price: number;
  ingredients: string[];
  allergens: string[];
}

export interface ICategory {
  category: string;
  dishes: IDish[];
}

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  owner: string;
  mobile: string;
  workingHours: IWorkingHour[];
  address: string;
  menu: ICategory[];
  slug: string;
  createdAt: Date;
  colorPalette: string[];
}

const WorkingHourSchema: Schema = new Schema({
  day: { type: String, required: true },
  morningOpen: {
    type: String,
    validate: {
      validator: function (this: IWorkingHour, value: string) {
        return this.closed ? true : !!value;
      },
      message: 'Morning open time is required if the restaurant is not closed.'
    }
  },
  morningClose: {
    type: String,
    validate: {
      validator: function (this: IWorkingHour, value: string) {
        return this.closed ? true : !!value;
      },
      message: 'Morning close time is required if the restaurant is not closed.'
    }
  },
  afternoonOpen: {
    type: String,
    validate: {
      validator: function (this: IWorkingHour, value: string) {
        return this.closed ? true : !!value;
      },
      message: 'Afternoon open time is required if the restaurant is not closed.'
    }
  },
  afternoonClose: {
    type: String,
    validate: {
      validator: function (this: IWorkingHour, value: string) {
        return this.closed ? true : !!value;
      },
      message: 'Afternoon close time is required if the restaurant is not closed.'
    }
  },
  closed: { type: Boolean, default: false },
});

const DishSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
});

const CategorySchema: Schema = new Schema({
  category: { type: String, required: true },
  dishes: [DishSchema],
});

const RestaurantSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  owner: { type: String, required: true },
  mobile: { type: String, required: true },
  workingHours: [WorkingHourSchema],
  address: { type: String, required: true },
  menu: [CategorySchema],
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  colorPalette: { type: [String] },
});

const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);

export default Restaurant;
