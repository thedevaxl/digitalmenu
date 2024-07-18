import { useState, useEffect } from 'react';

const Admin = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    openingHours: '',
    menu: [{ name: '', category: '', price: 0, ingredients: [{ name: '', allergens: '' }] }],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      if (!res.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRestaurants(data);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleMenuChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newMenu = [...form.menu];
    newMenu[index] = { ...newMenu[index], [name]: value };
    setForm({ ...form, menu: newMenu });
  };

  const handleIngredientChange = (menuIndex: number, ingredientIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newMenu = [...form.menu];
    const newIngredients = [...newMenu[menuIndex].ingredients];
    newIngredients[ingredientIndex] = { ...newIngredients[ingredientIndex], [name]: value };
    newMenu[menuIndex] = { ...newMenu[menuIndex], ingredients: newIngredients };
    setForm({ ...form, menu: newMenu });
  };

  const handleAddMenuItem = () => {
    setForm({ ...form, menu: [...form.menu, { name: '', category: '', price: 0, ingredients: [{ name: '', allergens: '' }] }] });
  };

  const handleAddIngredient = (menuIndex: number) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].ingredients.push({ name: '', allergens: '' });
    setForm({ ...form, menu: newMenu });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/restaurants/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Failed to add restaurant');
      }

      alert('Restaurant added successfully');
      fetchRestaurants();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">Restaurant Name</label>
          <input
            type="text"
            name="name"
            className="input input-bordered"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">Address</label>
          <textarea
            name="address"
            className="textarea textarea-bordered"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">Opening Hours</label>
          <input
            type="text"
            name="openingHours"
            className="input input-bordered"
            value={form.openingHours}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">Menu</label>
          {form.menu.map((item, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                name="name"
                placeholder="Menu Item Name"
                className="input input-bordered"
                value={item.name}
                onChange={(e) => handleMenuChange(index, e)}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                className="input input-bordered"
                value={item.category}
                onChange={(e) => handleMenuChange(index, e)}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                className="input input-bordered"
                value={item.price}
                onChange={(e) => handleMenuChange(index, e)}
                required
              />
              <div className="space-y-1">
                {item.ingredients.map((ingredient, ingIndex) => (
                  <div key={ingIndex} className="flex space-x-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="Ingredient"
                      className="input input-bordered flex-1"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, ingIndex, e)}
                    />
                    <input
                      type="text"
                      name="allergens"
                      placeholder="Allergens"
                      className="input input-bordered flex-1"
                      value={ingredient.allergens}
                      onChange={(e) => handleIngredientChange(index, ingIndex, e)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={() => handleAddIngredient(index)}
                >
                  Add Ingredient
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary mt-2" onClick={handleAddMenuItem}>
            Add Menu Item
          </button>
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Save Restaurant
        </button>
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Restaurants</h2>
        {error && <p className="text-red-500">{error}</p>}
        <ul className="space-y-2">
          {Array.isArray(restaurants) && restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <li key={restaurant._id} className="border p-4 rounded">
                <h3 className="text-lg font-bold">{restaurant.name}</h3>
                <p>{restaurant.address}</p>
                <p>{restaurant.openingHours.join(', ')}</p>
                <ul>
                  {restaurant.menu.map((item) => (
                    <li key={item.name}>
                      <strong>{item.name}</strong> - {item.category} - ${item.price}
                      <ul>
                        {item.ingredients.map((ingredient) => (
                          <li key={ingredient.name}>
                            {ingredient.name} (Allergens: {ingredient.allergens.join(', ')})
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <p>No restaurants found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Admin;
