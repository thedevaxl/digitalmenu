import mongoose, { Schema, Document, Model } from 'mongoose';

interface Ingredient {
  name: string;
  allergens: string[];
}

interface MenuItem {
  name: string;
  category: string;
  price: number;
  ingredients: Ingredient[];
}

interface Restaurant extends Document {
  name: string;
  address: string;
  openingHours: string[];
  menu: MenuItem[];
}

const IngredientSchema: Schema = new Schema({
  name: { type: String, required: true },
  allergens: { type: [String], required: true },
});

const MenuItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  ingredients: { type: [IngredientSchema], required: true },
});

const RestaurantSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  openingHours: { type: [String], required: true },
  menu: { type: [MenuItemSchema], required: true },
});

const RestaurantModel: Model<Restaurant> = mongoose.models.Restaurant || mongoose.model<Restaurant>('Restaurant', RestaurantSchema);

export default RestaurantModel;
