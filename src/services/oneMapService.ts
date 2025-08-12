// OneMap API service for Singapore transport routing
// OneMap is Singapore's national map platform - free to use!

interface OneMapRouteResponse {
  status_message: string;
  route_geometry: string;
  route_instructions: Array<{
    instruction: string;
    distance: number;
    time: number;
  }>;
  route_summary: {
    total_distance: number;
    total_time: number;
  };
}

interface OneMapGeocodingResponse {
  found: number;
  results: Array<{
    LATITUDE: string;
    LONGITUDE: string;
    SEARCHVAL: string;
    BLK_NO: string;
    ROAD_NAME: string;
    BUILDING: string;
    ADDRESS: string;
  }>;
}

interface RouteOptions {
  route: 'walk' | 'drive' | 'pt' | 'cycle';
  start: string; // lat,lng format
  end: string; // lat,lng format;
}

class OneMapService {
  private readonly baseUrl = 'https://www.onemap.gov.sg/api';
  
  /**
   * Get routing information between two points
   */
  async getRoute(options: RouteOptions): Promise<OneMapRouteResponse | null> {
    try {
      const { route, start, end } = options;
      const url = `${this.baseUrl}/${route}/route?start=${start}&end=${end}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('OneMap routing error:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching route from OneMap:', error);
      return null;
    }
  }

  /**
   * Get public transport routing (most useful for Singapore)
   */
  async getPublicTransportRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<OneMapRouteResponse | null> {
    return this.getRoute({
      route: 'pt',
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`
    });
  }

  /**
   * Get walking route
   */
  async getWalkingRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<OneMapRouteResponse | null> {
    return this.getRoute({
      route: 'walk',
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`
    });
  }

  /**
   * Get driving route (for taxi/Grab estimates)
   */
  async getDrivingRoute(startLat: number, startLng: number, endLat: number, endLng: number): Promise<OneMapRouteResponse | null> {
    return this.getRoute({
      route: 'drive',
      start: `${startLat},${startLng}`,
      end: `${endLat},${endLng}`
    });
  }

  /**
   * Search for places/addresses (geocoding)
   */
  async searchLocation(query: string): Promise<OneMapGeocodingResponse | null> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseUrl}/common/elastic/search?searchVal=${encodedQuery}&returnGeom=Y&getAddrDetails=Y`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('OneMap search error:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching location with OneMap:', error);
      return null;
    }
  }

  /**
   * Convert time from seconds to readable format
   */
  formatTime(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Convert distance from meters to readable format
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Estimate ComfortDelGro taxi cost (most accurate Singapore taxi rates)
   */
  estimateComfortDelGroCost(distanceKm: number): { min: number; max: number } {
    // Updated 2024 ComfortDelGro taxi rates
    const flagDown = 3.90; // Base fare for first 1km
    const subsequentKm = 0.25; // Per 400m after first km
    const bookingFee = 0; // No booking fee for street hail, S$3.50 for advance booking
    
    let cost = flagDown;
    if (distanceKm > 1) {
      const remainingKm = distanceKm - 1;
      cost += (remainingKm * 2.5) * subsequentKm; // 2.5 segments per km
    }
    
    return {
      min: Math.round(cost * 100) / 100,
      max: Math.round((cost * 1.5) * 100) / 100 // Peak hour surcharge (25-50%)
    };
  }

  /**
   * Estimate Grab cost (dynamic pricing)
   */
  estimateGrabCost(distanceKm: number): { min: number; max: number } {
    // Grab typically 10-20% cheaper than taxi during normal times
    const baseCost = 3.50 + (distanceKm * 0.65); // Base fare + distance
    const bookingFee = 0.30; // Small booking fee
    
    const totalCost = baseCost + bookingFee;
    
    return {
      min: Math.round((totalCost * 0.85) * 100) / 100, // Off-peak
      max: Math.round((totalCost * 2.2) * 100) / 100  // Surge pricing can go high
    };
  }

  /**
   * Estimate Tada cost (competitive rates)
   */
  estimateTadaCost(distanceKm: number): { min: number; max: number } {
    // Tada often has promotional rates
    const baseCost = 3.00 + (distanceKm * 0.60);
    
    return {
      min: Math.round((baseCost * 0.8) * 100) / 100, // Promo rates
      max: Math.round((baseCost * 1.3) * 100) / 100  // Regular rates
    };
  }

  /**
   * Estimate Gojek cost
   */
  estimateGojekCost(distanceKm: number): { min: number; max: number } {
    const baseCost = 3.20 + (distanceKm * 0.62);
    
    return {
      min: Math.round((baseCost * 0.9) * 100) / 100,
      max: Math.round((baseCost * 1.8) * 100) / 100
    };
  }

  /**
   * Estimate private hire car cost (premium services)
   */
  estimatePrivateHireCost(distanceKm: number): { min: number; max: number } {
    const baseCost = 8.00 + (distanceKm * 1.20); // Premium rates
    
    return {
      min: Math.round(baseCost * 100) / 100,
      max: Math.round((baseCost * 1.5) * 100) / 100
    };
  }

  /**
   * Legacy taxi cost function (keeping for backward compatibility)
   */
  estimateTaxiCost(distanceKm: number): { min: number; max: number } {
    return this.estimateComfortDelGroCost(distanceKm);
  }
}

export const oneMapService = new OneMapService();