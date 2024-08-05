import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Data = {
  menu?: object;
  error?: string;
};

const cleanJSON = (jsonString: string) => {
  // Replace various types of quotes with standard double quotes
  jsonString = jsonString.replace(/[\u2018\u2019\u201A\u201B\u2039\u203A]/g, "'");
  jsonString = jsonString.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  jsonString = jsonString.replace(/„/g, '"');

  // Remove or replace invalid property key quotes
  jsonString = jsonString.replace(/(\$[a-zA-Z]+\$)/g, (match) => `"${match.slice(1, -1)}"`);

  return jsonString;
};

const generateMenu = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const prompt = `
      Generate a restaurant menu in JSON format based on the following description: ${description}

      First, detect the language of the description. Then generate the menu in the same language.

      The menu should be a well-formatted JSON object with the following structure, which usually includes categories like "Appetizers", "Entrees", "Desserts", etc., and each category contains a list of dishes with their names, prices, ingredients, and allergens:
      {
        "menu": [
          {
            "category": "Category Name",
            "dishes": [
              { 
                "name": "Dish Name", 
                "price": number, 
                "ingredients": ["ingredient1", "ingredient2"], 
                "allergens": ["allergen1", "allergen2"]
              },
              ...
            ]
          },
          ...
        ]
      }

      Ensure each category has at least 7 and at most 15 dishes. The JSON property keys and values should ALWAYS use double quotes. Do not use any special quotation marks like smart quotes or any other variations in any occasion. Handle special characters like à, è, ì, ò, ù properly. Ensure there are no misplaced colons or commas. Return only the full complete JSON object without any additional text or code markers. Ensure that all special characters in JSON strings are properly escaped.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates restaurant menus based on descriptions.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      top_p: 0.9,
      n: 1,
      presence_penalty: 0.5,
      frequency_penalty: 0.5,
    });

    let rawGeneratedMenu = response.choices[0]?.message?.content?.trim() || '';

    // Save the raw generated menu to a temporary file for debugging
    const rawFilePath = path.join(process.cwd(), 'public', 'rawGeneratedMenu.json');
    fs.writeFileSync(rawFilePath, rawGeneratedMenu, 'utf8');

    // Clean up the raw JSON to fix any formatting issues
    let cleanedGeneratedMenu = cleanJSON(rawGeneratedMenu);

    // Save the cleaned raw generated menu for debugging
    const cleanedFilePath = path.join(process.cwd(), 'public', 'cleanedGeneratedMenu.json');
    fs.writeFileSync(cleanedFilePath, cleanedGeneratedMenu, 'utf8');

    // Parse and validate the JSON response
    const menu = JSON.parse(cleanedGeneratedMenu);

    // Save the parsed menu to a temporary file for debugging
    const parsedFilePath = path.join(process.cwd(), 'public', 'parsedGeneratedMenu.json');
    fs.writeFileSync(parsedFilePath, JSON.stringify(menu, null, 2), 'utf8');

    return res.status(200).json({ menu });
  } catch (error) {
    console.error(error);

    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ error: 'You have exceeded your quota. Please check your plan and billing details.' });
    }

    return res.status(500).json({ error: 'Failed to generate menu' });
  }
};

export default generateMenu;
