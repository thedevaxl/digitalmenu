import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IRestaurant } from './api/models/restaurant';
import { colorPalettes, defaultPalette } from '../config/colorPalettes';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

interface RestaurantPageProps {
  initialData: IRestaurant | null;
}

const RestaurantPage = ({ initialData }: RestaurantPageProps) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(initialData);

  useEffect(() => {
    if (!initialData) {
      const fetchRestaurant = async () => {
        try {
          const res = await fetch(`/api/restaurant/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setRestaurant(data);
          } else {
            setRestaurant(null); // Set to null if not found
          }
        } catch (error) {
          console.error("Failed to fetch restaurant:", error);
          setRestaurant(null);
        }
      };
      fetchRestaurant();
    }
  }, [slug, initialData]);

  if (!restaurant) {
    return <p className="text-center text-lg">Restaurant not found.</p>;
  }

  const { name, owner, mobile, address, workingHours, menu, colorPalette } = restaurant;

  const palette = colorPalette || colorPalettes[defaultPalette];
  const [primaryColor, secondaryColor, tertiaryColor, quaternaryColor] = palette;

  return (
    <div
      className="container mx-auto p-4"
      style={{ backgroundColor: primaryColor, color: secondaryColor }}
    >
      <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: secondaryColor }}>
        {name}
      </h1>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="md:w-1/2">
          <h2 className="text-xl font-bold mb-2" style={{ color: tertiaryColor }}>
            Contact Information
          </h2>
          <p>Owner: {owner}</p>
          <p>Mobile: {mobile}</p>

          <h2 className="text-xl font-bold mt-4 mb-2" style={{ color: tertiaryColor }}>
            Working Hours
          </h2>
          <ul>
            {workingHours.map(({ day, closed, morningOpen, morningClose, afternoonOpen, afternoonClose }, index) => (
              <li key={index} className={`${closed ? 'line-through' : ''}`}>
                {day}: {closed ? 'Closed' : `${morningOpen} - ${morningClose}, ${afternoonOpen} - ${afternoonClose}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 h-64 md:h-auto">
          <Map address={address} />
        </div>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: tertiaryColor }}>
        Menu
      </h2>
      <div className="flex flex-wrap -mx-4">
        {menu?.length ? (
          menu.map(({ category, dishes }, index) => (
            <div key={index} className="w-full md:w-1/3 px-4 mb-8" style={{ borderColor: tertiaryColor }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: quaternaryColor }}>
                {category}
              </h3>
              {dishes?.length ? (
                dishes.map(({ name, price, ingredients, allergens }, dishIndex) => (
                  <div
                    key={dishIndex}
                    className="border p-4 mb-4"
                    style={{ backgroundColor: quaternaryColor }}
                  >
                    <strong>{name}</strong> - ${price}
                    <ul className="mt-2">
                      {ingredients?.length ? (
                        ingredients.map((ingredient, ingIndex) => <li key={ingIndex}>{ingredient}</li>)
                      ) : (
                        <li>No ingredients listed.</li>
                      )}
                    </ul>
                    <ul className="mt-2">
                      {allergens?.length ? (
                        allergens.map((allergen, allergenIndex) => (
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { slug } = params as { slug: string };

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/restaurant/${slug}`);
    
    if (!res.ok) {
      return {
        notFound: true, // If the API responds with a non-OK status, trigger the Next.js 404 page
      };
    }

    const data = await res.json();

    if (!data) {
      return {
        notFound: true, // If the restaurant data is empty, trigger the 404 page
      };
    }

    return {
      props: {
        initialData: data,
      },
    };
  } catch (error) {
    console.error('Error fetching restaurant data:', error);
    return {
      notFound: true, // Handle any other errors by triggering the 404 page
    };
  }
};

export default RestaurantPage;
