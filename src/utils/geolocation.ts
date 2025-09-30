// Simple OpenStreetMap Nominatim geocoding utility
export async function geocodeAddress(address: string, postalCode: string, city: string, country: string): Promise<string | null> {
  try {
    const fullAddress = `${address}, ${postalCode} ${city}, ${country}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.length > 0) {
      const result = data[0];
      return `${parseFloat(result.lat).toFixed(6)}, ${parseFloat(result.lon).toFixed(6)}`;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}