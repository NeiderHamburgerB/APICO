import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

export async function validateAddress(address: string, expectedCity: string, country: string = 'CO'): Promise<boolean> {
  if (!address || address.trim() === '') {
    console.log('Dirección inválida: Cadena vacía o nula.');
    return false;
  }

  try {
    const query = `${address}, ${expectedCity}`;

    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        country: country,
        types: 'address,place',
        limit: 10
      }
    });

    const data = response.data;

    if (!data || !data.features || data.features.length === 0) {
      console.log('No se encontraron resultados en la API para:', query);
      return false;
    }

    const result = data.features[0];
    const placeName = result.place_name.toLowerCase();

    if (!placeName.includes(expectedCity.toLowerCase())) {
      console.log(`La dirección no parece estar en la ciudad esperada: ${expectedCity}`);
      return false;
    }

    console.log('Dirección válida.');
    return true;
  } catch (error) {
    console.error('Error al validar la dirección:', error);
    return false;
  }
}
