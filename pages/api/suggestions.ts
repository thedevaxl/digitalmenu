import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { pizzaRestaurantSuggestions } from './suggestions/pizzaRestaurant';
import { burgerBrewerySuggestions } from './suggestions/burgerBrewery';
import { sushiRestaurantSuggestions } from './suggestions/sushiRestaurant';
import { coffeeShopSuggestions } from './suggestions/coffeeShop';
import { iceCreamParlorSuggestions } from './suggestions/iceCreamParlor';

const handler = createRouter<NextApiRequest, NextApiResponse>();

// Define the type for the keys of the suggestionsData object
type RestaurantType = 'pizza restaurant' | 'burger/brewery' | 'sushi restaurant' | 'coffee shop' | 'ice cream parlor';

const suggestionsData: Record<RestaurantType, { menu: { category: string; dishes: { name: string; price: number; ingredients: string[]; allergens: string[]; }[]; }[]; }> = {
  "pizza restaurant": pizzaRestaurantSuggestions,
  "burger/brewery": burgerBrewerySuggestions,
  "sushi restaurant": sushiRestaurantSuggestions,
  "coffee shop": coffeeShopSuggestions,
  "ice cream parlor": iceCreamParlorSuggestions,
};

handler.get(async (req, res) => {
  const { type } = req.query;

  if (!type || typeof type !== 'string') {
    return res.status(400).json({ message: 'Restaurant type is required' });
  }

  const restaurantType = type.toLowerCase() as RestaurantType;

  const suggestion = suggestionsData[restaurantType];
  if (!suggestion) {
    return res.status(404).json({ message: 'No suggestions found for this type' });
  }

  return res.status(200).json(suggestion);
});

export default handler.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end((err as Error).toString());
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Page is not found');
  },
});
