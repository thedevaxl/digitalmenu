import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { IRestaurant } from './api/models/restaurant';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

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

  const [primaryColor, secondaryColor, tertiaryColor, quaternaryColor] = restaurant.colorPalette;

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
      <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: secondaryColor }}>{restaurant.name}</h1>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="md:w-1/2">
          <h2 className="text-xl font-bold" style={{ color: tertiaryColor }}>Contact Information</h2>
          <p>Owner: {restaurant.owner}</p>
          <p>Mobile: {restaurant.mobile}</p>
          <h2 className="text-xl font-bold mt-4" style={{ color: tertiaryColor }}>Working Hours</h2>
          <ul>
            {restaurant.workingHours.map((wh, index) => (
              <li key={index} className={`${wh.closed ? 'line-through' : ''}`}>
                <p>{wh.day}: {wh.closed ? 'Closed' : `${wh.morningOpen} - ${wh.morningClose}, ${wh.afternoonOpen} - ${wh.afternoonClose}`}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 h-64 md:h-auto">
          <Map address={restaurant.address} />
        </div>
      </div>
      <h2 className="text-xl font-bold mt-8" style={{ color: tertiaryColor }}>Menu</h2>
      <div className="flex flex-wrap -mx-4">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((category, index) => (
            <div key={index} className="w-full md:w-1/3 px-4 mb-8" style={{ borderColor: tertiaryColor }}>
              <h3 className="text-lg font-bold" style={{ color: quaternaryColor }}>{category.category}</h3>
              {category.dishes && category.dishes.length > 0 ? (
                category.dishes.map((dish, dishIndex) => (
                  <div key={dishIndex} className="border p-4 mb-4" style={{ backgroundColor: quaternaryColor }}>
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/restaurant/${slug}`);
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
