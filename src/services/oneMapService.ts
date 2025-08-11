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
   * Estimate taxi/Grab cost based on distance
   */
  estimateTaxiCost(distanceKm: number): { min: number; max: number } {
    // Singapore taxi pricing (approximate)
    const flagDown = 4.20; // Base fare
    const perKm = 0.56; // Per 400m or part thereof
    const bookingFee = 0; // No booking fee for street hail
    
    const baseCost = flagDown + (distanceKm * perKm * 2.5); // 2.5 for 400m segments per km
    
    return {
      min: Math.round(baseCost),
      max: Math.round(baseCost * 1.3) // Peak hour surcharge
    };
  }

  /**
   * Estimate Grab cost (usually slightly different from taxi)
   */
  estimateGrabCost(distanceKm: number): { min: number; max: number } {
    const taxiCost = this.estimateTaxiCost(distanceKm);
    return {
      min: Math.round(taxiCost.min * 0.9), // Usually slightly cheaper
      max: Math.round(taxiCost.max * 1.1)  // But can surge higher
    };
  }
}

export const oneMapService = new OneMapService();