import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { IRestaurant } from '../api/models/restaurant';

interface RestaurantPageProps {
  initialData: IRestaurant | null;
}

const RestaurantPage = ({ initialData }: RestaurantPageProps) => {
  const router = useRouter();
  const { slug } = router.query;
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(initialData);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!initialData) {
        const res = await fetch(`/api/restaurant/${slug}`);
        const data = await res.json();
        setRestaurant(data);
      }
    };

    fetchRestaurant();
  }, [slug, initialData]);

  if (!restaurant) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">{restaurant.name}</h1>
      <p className="text-center">Owner: {restaurant.owner}</p>
      <p className="text-center">Mobile: {restaurant.mobile}</p>
      <p className="text-center">Address: {restaurant.address}</p>
      <h2 className="text-xl font-bold mt-8">Menu</h2>
      <div className="flex flex-wrap -mx-4">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((category, index) => (
            <div key={index} className="w-full md:w-1/3 px-4 mb-8">
              <h3 className="text-lg font-bold">{category.category}</h3>
              {category.dishes && category.dishes.length > 0 ? (
                category.dishes.map((dish, dishIndex) => (
                  <div key={dishIndex} className="border p-4 mb-4">
                    <strong>{dish.name}</strong> - ${dish.price}
                    <ul>
                      {dish.ingredients && dish.ingredients.length > 0 ? (
                        dish.ingredients.map((ingredient, ingIndex) => (
                          <li key={ingIndex}>{ingredient}</li>
                        ))
                      ) : (
                        <li>No ingredients listed.</li>
                      )}
                    </ul>
                    <ul>
                      {dish.allergens && dish.allergens.length > 0 ? (
                        dish.allergens.map((allergen, allergenIndex) => (
                          <li key={allergenIndex}>Allergen: {allergen}</li>
                        ))
                      ) : (
                        <li>No allergens listed.</li>
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No dishes found in this category.</p>
              )}
            </div>
          ))
        ) : (
          <p>No menu items found.</p>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;

  const res = await fetch(`http://localhost:3000/api/restaurant/${slug}`);
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialData: data,
    },
  };
};

export default RestaurantPage;
