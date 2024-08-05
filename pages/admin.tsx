import { useState, useEffect, Key } from "react";
import { useRouter } from "next/router";
import { slugify } from "../utils/slugify";
import Modal from "../components/Modal";
import QRCode from "qrcode.react";
import { colorPalettes } from '../config/colorPalettes';

import {
  IRestaurant,
  IWorkingHour,
  ICategory,
  IDish,
} from "./api/models/restaurant";

import AddressInput from "../components/AddressInput";

interface IForm {
  id: string;
  name: string;
  owner: string;
  mobile: string;
  workingHours: IWorkingHour[];
  address: string;
  menu: ICategory[];
  colorPalette: string[];
}

const daysOfWeek: IWorkingHour[] = [
  {
    day: "Monday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Tuesday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Wednesday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Thursday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Friday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Saturday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
  {
    day: "Sunday",
    morningOpen: "09:30",
    morningClose: "13:30",
    afternoonOpen: "15:30",
    afternoonClose: "19:30",
    closed: false,
  },
];

const Admin = () => {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [form, setForm] = useState<IForm>({
    id: "",
    name: "",
    owner: "",
    mobile: "",
    workingHours: daysOfWeek,
    address: "",
    menu: [] as ICategory[],
    colorPalette: ["#00FF00", "#FF0000", "#FFFFFF", "#000000"],
  });
  const [error, setError] = useState<string | null>(null);
  const [userVerified, setUserVerified] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("Empty");
  const [selectedPalette, setSelectedPalette] =
    useState<string>("Pizza Restaurant");
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [currentRestaurant, setCurrentRestaurant] =
    useState<IRestaurant | null>(null);
  const [menuVisibility, setMenuVisibility] = useState<Record<string, boolean>>(
    {}
  );

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchUserDetails(token);
      fetchRestaurants(token);
    }

    // Check for verification query parameters
    if (router.query.verify && router.query.token) {
      verifyUser(router.query.token as string);
    }
  }, [router.query]);

  const fetchUserDetails = async (token: string) => {
    try {
      const res = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch user details");
      }
      const data = await res.json();
      setUserVerified(data.isVerified);
      if (!data.isVerified) {
        setIsModalOpen(true);
      }
    } catch (err) {
      setError((err as Error).message);
      router.push("/login");
    }
  };

  const verifyUser = async (token: string) => {
    try {
      const res = await fetch(`/api/user?action=verify&token=${token}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to verify email");
      }

      alert("Email verified successfully");
      setUserVerified(true);
      setIsModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const fetchRestaurants = async (token: string) => {
    try {
      const res = await fetch("/api/restaurant", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await res.json();
      setRestaurants(data);

      // Check if no restaurants and set form visibility accordingly
      if (data.length === 0) {
        setIsModalOpen(true);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSuggestionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = e.target.value;

    if (selectedType === "Empty") {
      setForm((prevForm) => ({
        ...prevForm,
        menu: [],
      }));
    } else {
      try {
        const res = await fetch(
          `/api/suggestions?type=${selectedType
            .toLowerCase()
            .replace(" ", "%20")}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch suggestions");
        }
        const data = await res.json();
        setForm((prevForm) => ({
          ...prevForm,
          menu: data.menu,
        }));
      } catch (err) {
        alert((err as Error).message);
      }
    }

    setSelectedSuggestion(selectedType);
  };

  // const handleGenerateAI = async (description: string) => {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("/api/generateMenu", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ description }),
  //     });

  //     if (!res.ok) {
  //       throw new Error("Failed to generate menu");
  //     }

  //     const data = await res.json();

  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       menu: data.menu,
  //     }));
  //     setIsModalOpen(false);
  //     setIsFormVisible(true);
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handlePaletteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const palette = colorPalettes[selectedType];

    setForm((prevForm) => ({
      ...prevForm,
      colorPalette: palette,
    }));

    setSelectedPalette(selectedType);
  };

  const handleWorkingHoursChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    const newWorkingHours = [...form.workingHours];
    newWorkingHours[index] = {
      ...newWorkingHours[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setForm({ ...form, workingHours: newWorkingHours });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const endpoint = form.id
      ? `/api/restaurant?id=${form.id}`
      : "/api/restaurant";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to save restaurant");
      }

      alert("Restaurant saved successfully");
      fetchRestaurants(token);
      setDefaultFormValues(); // Reset to default empty form values
      setSelectedPalette("Pizza Restaurant"); // Reset the selected palette
      setSelectedSuggestion("Empty"); // Reset the selected suggestion
      setIsFormVisible(false); // Hide the form
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleEdit = (restaurant: IRestaurant) => {
    const paletteName =
      Object.keys(colorPalettes).find(
        (name) =>
          JSON.stringify(colorPalettes[name]) ===
          JSON.stringify(restaurant.colorPalette)
      ) || "Pizza Restaurant"; // Default to 'Pizza Restaurant' if not found

    setForm({
      id: restaurant._id.toString(),
      name: restaurant.name,
      owner: restaurant.owner,
      mobile: restaurant.mobile,
      workingHours: restaurant.workingHours,
      address: restaurant.address,
      menu: restaurant.menu,
      colorPalette: restaurant.colorPalette, // Retain the actual color palette
    });

    setSelectedPalette(paletteName); // Update the selected palette name
    setIsFormVisible(true); // Show the form
    setCurrentRestaurant(restaurant); // Set the current restaurant
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/restaurant", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete restaurant");
      }

      alert("Restaurant deleted successfully");
      fetchRestaurants(token);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleMenuCategoryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newMenu = [...form.menu];
    newMenu[index] = { ...newMenu[index], [name]: value };
    setForm({ ...form, menu: newMenu });
  };

  const handleAddMenuCategory = () => {
    setForm({ ...form, menu: [...form.menu, { category: "", dishes: [] }] });
  };

  const handleRemoveMenuCategory = (index: number) => {
    const newMenu = [...form.menu];
    newMenu.splice(index, 1);
    setForm({ ...form, menu: newMenu });
  };

  const handleAddressChange = (address: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      address,
    }));
  };

  const handleAddDish = (menuIndex: number) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes.push({
      name: "",
      price: 0,
      ingredients: [],
      allergens: [],
    });
    setForm({ ...form, menu: newMenu });
  };

  const handleRemoveDish = (menuIndex: number, dishIndex: number) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes.splice(dishIndex, 1);
    setForm({ ...form, menu: newMenu });
  };

  const handleDishChange = (
    menuIndex: number,
    dishIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex] = {
      ...newMenu[menuIndex].dishes[dishIndex],
      [name]: value,
    };
    setForm({ ...form, menu: newMenu });
  };

  const handleIngredientChange = (
    menuIndex: number,
    dishIndex: number,
    ingredientIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].ingredients[ingredientIndex] = value;
    setForm({ ...form, menu: newMenu });
  };

  const handleAddIngredient = (menuIndex: number, dishIndex: number) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].ingredients.push("");
    setForm({ ...form, menu: newMenu });
  };

  const handleRemoveIngredient = (
    menuIndex: number,
    dishIndex: number,
    ingredientIndex: number
  ) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].ingredients.splice(ingredientIndex, 1);
    setForm({ ...form, menu: newMenu });
  };

  const handleAllergenChange = (
    menuIndex: number,
    dishIndex: number,
    allergenIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].allergens[allergenIndex] = value;
    setForm({ ...form, menu: newMenu });
  };

  const handleAddAllergen = (menuIndex: number, dishIndex: number) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].allergens.push("");
    setForm({ ...form, menu: newMenu });
  };

  const handleRemoveAllergen = (
    menuIndex: number,
    dishIndex: number,
    allergenIndex: number
  ) => {
    const newMenu = [...form.menu];
    newMenu[menuIndex].dishes[dishIndex].allergens.splice(allergenIndex, 1);
    setForm({ ...form, menu: newMenu });
  };

  const handleView = (restaurant: IRestaurant) => {
    const slug = slugify(restaurant.name);
    const url = `/${slug}`;
    window.location.href = url;
  };

  const handleResendVerificationEmail = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/user?action=resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to resend verification email");
      }

      alert("Verification email sent successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    try {
      const response = await fetch("/api/user?action=logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Failed to logout");
    }
  };

  const toggleMenuVisibility = (restaurantId: string) => {
    setMenuVisibility((prevState) => ({
      ...prevState,
      [restaurantId]: !prevState[restaurantId],
    }));
  };

  const setDefaultFormValues = () => {
    setForm({
      id: "",
      name: "",
      owner: "",
      mobile: "",
      workingHours: daysOfWeek,
      address: "",
      menu: [],
      colorPalette: colorPalettes["Pizza Restaurant"],
    });
  };

  const modalContent = (
    <div>
      <p className="mb-4">
        Please select a restaurant type to start or start empty:
      </p>
      <label className="label">Suggestion Menu</label>
      <select
        className="select select-bordered w-full mb-4 bg-gray-200"
        value={selectedSuggestion}
        onChange={handleSuggestionChange}
      >
        <option value="Empty">Empty</option>
        <option value="Pizza Restaurant">Pizza Restaurant</option>
        <option value="Burger/Brewery">Burger/Brewery</option>
        <option value="Sushi Restaurant">Sushi Restaurant</option>
        <option value="Coffee Shop">Coffee Shop</option>
        <option value="Ice Cream Parlor">Ice Cream Parlor</option>
      </select>

      <label className="label">Color Palette</label>
      <select
        className="select select-bordered w-full mb-4 bg-gray-200"
        value={selectedPalette}
        onChange={handlePaletteChange}
      >
        {Object.keys(colorPalettes).map((template, index) => (
          <option key={index} value={template}>
            {template}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary w-full mt-4"
        onClick={() => {
          setIsModalOpen(false);
          setIsFormVisible(true);
        }}
      >
        Accept
      </button>
      {/* <button
        className="btn btn-secondary w-full mt-4"
        onClick={() => {
          setIsModalOpen(false);
          setIsAIModalOpen(true);
        }}
      >
        Use AI to Generate Menu
      </button> */}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {restaurants.length > 0 && (
        <button
          onClick={() => {
            setIsModalOpen(true);
            setForm({
              id: "",
              name: "",
              owner: "",
              mobile: "",
              workingHours: daysOfWeek,
              address: "",
              menu: [],
              colorPalette: colorPalettes["Pizza Restaurant"], // Default palette
            });
            setSelectedPalette("Pizza Restaurant"); // Default palette
            setCurrentRestaurant(null); // No current restaurant
          }}
          className="btn btn-primary mb-4"
        >
          Add New Restaurant
        </button>
      )}

      <button onClick={handleLogout} className="btn btn-secondary mb-4">
        Logout
      </button>

      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {!userVerified && (
        <Modal
          title="Verify Your Email"
          content={
            <>
              <p className="mb-4">
                Please verify your email address to access all features.
              </p>
              <button
                onClick={handleResendVerificationEmail}
                className="btn btn-primary"
              >
                Resend Verification Email
              </button>
              <button onClick={handleLogout} className="btn btn-secondary mb-4">
                Logout
              </button>
            </>
          }
          isOpen={!userVerified}
          onClose={() => setIsModalOpen(false)}
          type="warning" // Set modal type to warning
        />
      )}

      {isFormVisible ? (
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
            <label className="label">Color Palette</label>
            <select
              className="select select-bordered"
              value={selectedPalette}
              onChange={(e) => {
                handlePaletteChange(e);
                setSelectedPalette(e.target.value);
              }}
            >
              {Object.keys(colorPalettes).map((template, index) => (
                <option key={index} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">Owner</label>
            <input
              type="text"
              name="owner"
              className="input input-bordered"
              value={form.owner}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Mobile</label>
            <input
              type="text"
              name="mobile"
              className="input input-bordered"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Address</label>
            <AddressInput value={form.address} onChange={handleAddressChange} />
          </div>
          <div className="form-control">
            <label className="label">Working Hours</label>
            {form.workingHours.map((wh, index) => (
              <div
                key={index}
                className={`space-y-2 ${wh.closed ? "text-gray-500" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <label className="label">{wh.day}</label>
                  <input
                    type="checkbox"
                    name="closed"
                    checked={wh.closed}
                    onChange={(e) => handleWorkingHoursChange(index, e)}
                  />
                  <label className="label">Closed</label>
                </div>
                {!wh.closed && (
                  <>
                    <div className="flex space-x-2">
                      <input type="hidden" name="day" value={wh.day} />
                      <input
                        type="time"
                        name="morningOpen"
                        placeholder="Morning Open Time"
                        className="input input-bordered"
                        value={wh.morningOpen}
                        onChange={(e) => handleWorkingHoursChange(index, e)}
                      />
                      <input
                        type="time"
                        name="morningClose"
                        placeholder="Morning Close Time"
                        className="input input-bordered"
                        value={wh.morningClose}
                        onChange={(e) => handleWorkingHoursChange(index, e)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="time"
                        name="afternoonOpen"
                        placeholder="Afternoon Open Time"
                        className="input input-bordered"
                        value={wh.afternoonOpen}
                        onChange={(e) => handleWorkingHoursChange(index, e)}
                      />
                      <input
                        type="time"
                        name="afternoonClose"
                        placeholder="Afternoon Close Time"
                        className="input input-bordered"
                        value={wh.afternoonClose}
                        onChange={(e) => handleWorkingHoursChange(index, e)}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="form-control">
            <label className="label">Menu Categories</label>
            {form.menu.map((category, index) => (
              <div key={index} className="space-y-2 border-b-2 pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    className="input input-bordered"
                    value={category.category}
                    onChange={(e) => handleMenuCategoryChange(index, e)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveMenuCategory(index)}
                  >
                    Remove Category
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={() => handleAddDish(index)}
                >
                  Add Dish
                </button>
                {category.dishes.map((dish, dishIndex) => (
                  <div key={dishIndex} className="space-y-2 border p-2">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        name="name"
                        placeholder="Dish Name"
                        className="input input-bordered"
                        value={dish.name}
                        onChange={(e) => handleDishChange(index, dishIndex, e)}
                        required
                      />
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        className="input input-bordered"
                        value={dish.price}
                        onChange={(e) => handleDishChange(index, dishIndex, e)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleRemoveDish(index, dishIndex)}
                      >
                        Remove Dish
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="label">Ingredients</label>
                      {dish.ingredients.map((ingredient, ingIndex) => (
                        <div
                          key={ingIndex}
                          className="flex space-x-2 items-center"
                        >
                          <input
                            type="text"
                            name="ingredient"
                            placeholder="Ingredient"
                            className="input input-bordered flex-1"
                            value={ingredient}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                dishIndex,
                                ingIndex,
                                e
                              )
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              handleRemoveIngredient(index, dishIndex, ingIndex)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={() => handleAddIngredient(index, dishIndex)}
                      >
                        Add Ingredient
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="label">Allergens</label>
                      {dish.allergens.map((allergen, allergenIndex) => (
                        <div
                          key={allergenIndex}
                          className="flex space-x-2 items-center"
                        >
                          <input
                            type="text"
                            name="allergen"
                            placeholder="Allergen"
                            className="input input-bordered flex-1"
                            value={allergen}
                            onChange={(e) =>
                              handleAllergenChange(
                                index,
                                dishIndex,
                                allergenIndex,
                                e
                              )
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() =>
                              handleRemoveAllergen(
                                index,
                                dishIndex,
                                allergenIndex
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={() => handleAddAllergen(index, dishIndex)}
                      >
                        Add Allergen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleAddMenuCategory}
            >
              Add Menu Category
            </button>
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Save Restaurant
          </button>
          <button
            type="button"
            className="btn btn-secondary w-full mt-4"
            onClick={() => setIsFormVisible(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Existing Restaurants</h2>
          {error && <p className="text-red-500">{error}</p>}
          <ul className="space-y-2">
            {Array.isArray(restaurants) && restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <li key={restaurant._id.toString()} className="border p-4 rounded">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{restaurant.name}</h3>
                    <QRCode
                      value={`${baseUrl}/restaurant/${slugify(
                        restaurant.name
                      )}`}
                      size={128}
                    />
                  </div>
                  <p>colorPalette: {restaurant.colorPalette}</p>
                  <p>Slug: {restaurant.slug}</p>
                  <p>Owner: {restaurant.owner}</p>
                  <p>Mobile: {restaurant.mobile}</p>
                  <p>Address: {restaurant.address}</p>
                  <div>
                    <h4 className="font-bold">Working Hours</h4>
                    {restaurant.workingHours.map((wh, index) => (
                      <div
                        key={index}
                        className={`${wh.closed ? "line-through" : ""}`}
                      >
                        <p>{wh.day}</p>
                        {!wh.closed && (
                          <>
                            <p>
                              Morning: {wh.morningOpen} - {wh.morningClose}
                            </p>
                            <p>
                              Afternoon: {wh.afternoonOpen} -{" "}
                              {wh.afternoonClose}
                            </p>
                          </>
                        )}
                        {wh.closed && <p>Closed</p>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold">
                      Menu
                      <button
                        onClick={() => toggleMenuVisibility(restaurant._id.toString())}
                        className="ml-2 text-blue-500 underline"
                      >
                        {menuVisibility[restaurant._id.toString()] ? "Hide" : "Show"}
                      </button>
                    </h4>
                    {menuVisibility[restaurant._id.toString()] &&
                      restaurant.menu.map((category, index) => (
                        <div key={index}>
                          <h5 className="font-bold">{category.category}</h5>
                          {category.dishes.map((dish, dishIndex) => (
                            <div key={dishIndex} className="border p-2 mb-2">
                              <strong>{dish.name}</strong> - ${dish.price}
                              <ul>
                                {dish.ingredients.map(
                                  (ingredient, ingIndex) => (
                                    <li key={ingIndex}>{ingredient}</li>
                                  )
                                )}
                              </ul>
                              <ul>
                                {dish.allergens.map(
                                  (allergen, allergenIndex) => (
                                    <li key={allergenIndex}>
                                      Allergen: {allergen}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="btn btn-secondary mt-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant._id.toString())}
                    className="btn btn-danger mt-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleView(restaurant)}
                    className="btn btn-primary mt-2"
                  >
                    View
                  </button>
                </li>
              ))
            ) : (
              <p>No restaurants found.</p>
            )}
          </ul>
        </div>
      )}

      {userVerified && (
        <>
          <Modal
            title="Create Your Restaurant"
            content={modalContent}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            type="default"
          />

          {/* <Modal
            title="Describe Your Restaurant"
            content={<p>Please describe your restaurant to generate a menu.</p>}
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            type="default"
            showAIInput={true}
            onGenerateAI={handleGenerateAI}
          /> */}
        </>
      )}
    </div>
  );
};

export default Admin;
