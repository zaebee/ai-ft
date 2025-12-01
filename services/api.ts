
import { API_BASE_URL } from '../constants';
import { Token, UserPublic, RoleEnum, Vehicle, VehicleStatus, Currency, PriceConversion } from '../types';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

// Mock Data for fallback when backend is unavailable
const MOCK_CURRENCIES: Currency[] = [
  { currency: "USD", symbol: "U+0024", name: "US Dollar" },
  { currency: "EUR", symbol: "U+20AC", name: "Euro" },
  { currency: "GBP", symbol: "U+00A3", name: "U.K. Pound Sterling" },
  { currency: "RUB", symbol: "U+20BD", name: "Russian Ruble" },
  { currency: "THB", symbol: "U+0E3F", name: "Thai Baht" },
  { currency: "VND", symbol: "U+20AB", name: "Vietnamese Dong" },
  { currency: "IDR", symbol: "U+20A6", name: "Indonesian Rupiah" }
];

// Helper to generate conversions for mock data
const generateMockConversions = (basePrice: number): Record<string, PriceConversion> => {
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    RUB: 92.5,
    THB: 35.5,
    VND: 24500,
    IDR: 15600
  };

  const conversions: Record<string, PriceConversion> = {};
  
  Object.keys(rates).forEach(code => {
    conversions[code] = {
      amount: Math.round(basePrice * rates[code]),
      currency: code,
      rate: rates[code],
      valid_until: new Date(Date.now() + 86400000).toISOString()
    };
  });
  
  return conversions;
};

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    name: 'Tesla Model 3 Performance',
    owner_id: 'owner-1',
    status: VehicleStatus.FREE,
    price: 120,
    currency: 'USD',
    minimal_price: 120,
    price_conversions: generateMockConversions(120),
    minimal_price_conversions: generateMockConversions(120),
    picture: { 
      cover: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      cover_previews: {
        xs: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=60',
        s: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&q=80',
        m: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80'
      },
      extra: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      extra_previews: {
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80': {
          previews: { xs: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=60' }
        },
        'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80': {
           previews: { xs: 'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=60' }
        }
      }
    },
    general_info: { brand: 'Tesla', model: 'Model 3', year: 2023, color: 'White' },
    specification_info: { transmission: 'Automatic', fuel_type: 'Electric', number_of_seats: 5 }
  },
  {
    id: 'v-2',
    name: 'Porsche 911 Carrera',
    owner_id: 'owner-1',
    status: VehicleStatus.COLLECTED,
    price: 350,
    currency: 'USD',
    minimal_price: 350,
    price_conversions: generateMockConversions(350),
    minimal_price_conversions: generateMockConversions(350),
    picture: { 
      cover: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
    },
    general_info: { brand: 'Porsche', model: '911', year: 2022, color: 'Black' },
    specification_info: { transmission: 'Automatic', fuel_type: 'Petrol', number_of_seats: 2 }
  },
  {
    id: 'v-3',
    name: 'Range Rover Sport',
    owner_id: 'owner-1',
    status: VehicleStatus.FREE,
    price: 200,
    currency: 'USD',
    minimal_price: 200,
    price_conversions: generateMockConversions(200),
    minimal_price_conversions: generateMockConversions(200),
    picture: { 
      cover: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
    },
    general_info: { brand: 'Land Rover', model: 'Range Rover', year: 2023, color: 'Grey' },
    specification_info: { transmission: 'Automatic', fuel_type: 'Hybrid', number_of_seats: 5 }
  },
  {
    id: 'v-4',
    name: 'Mercedes-Benz G-Class',
    owner_id: 'owner-2',
    status: VehicleStatus.FREE,
    price: 450,
    currency: 'USD',
    minimal_price: 450,
    price_conversions: generateMockConversions(450),
    minimal_price_conversions: generateMockConversions(450),
    picture: { 
      cover: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
    },
    general_info: { brand: 'Mercedes-Benz', model: 'G 63 AMG', year: 2022, color: 'Black' },
    specification_info: { transmission: 'Automatic', fuel_type: 'Petrol', number_of_seats: 5 }
  },
  {
    id: 'v-5',
    name: 'BMW M4 Competition',
    owner_id: 'owner-1',
    status: VehicleStatus.MAINTENANCE,
    price: 280,
    currency: 'USD',
    minimal_price: 280,
    price_conversions: generateMockConversions(280),
    minimal_price_conversions: generateMockConversions(280),
    picture: { 
      cover: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' 
    },
    general_info: { brand: 'BMW', model: 'M4', year: 2024, color: 'Green' },
    specification_info: { transmission: 'Automatic', fuel_type: 'Petrol', number_of_seats: 4 }
  }
];

class ApiService {
  private static token: string | null = localStorage.getItem('access_token');

  static setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  static getToken(): string | null {
    return this.token;
  }

  private static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, isFormData = false } = options;

    const config: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    };

    if (this.token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    if (body) {
      if (isFormData) {
        // Content-Type is set automatically by browser for FormData
        config.body = body;
      } else {
        (config.headers as Record<string, string>)['Content-Type'] = 'application/json';
        config.body = JSON.stringify(body);
      }
    }

    try {
      // Attempt real fetch
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
            this.setToken(null);
            window.location.hash = '#/login';
            throw new Error('Unauthorized');
        }
        // If it's a 404/500 from the server, we might also want to fallback to mock in this demo environment
        throw new Error(`Server returned ${response.status}`);
      }

      if (response.status === 204) {
          return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.warn(`API Error [${method} ${endpoint}]: Network request failed or server unavailable. Falling back to Mock Data.`);
      return this.getMockData<T>(endpoint, method, body);
    }
  }

  // Helper to simulate backend responses
  private static async getMockData<T>(endpoint: string, method: string, body: any): Promise<T> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // --- Auth Endpoints ---
    if (endpoint.includes('/auth/access-token')) {
        let username = 'owner';
        if (body instanceof FormData) {
            username = (body.get('username') as string) || '';
        }
        
        // Simple logic to switch roles for demo
        const isRider = username.toLowerCase().includes('rider');
        localStorage.setItem('mock_role', isRider ? RoleEnum.RIDER : RoleEnum.OWNER);

        return {
            access_token: `mock_token_${Date.now()}`,
            token_type: 'bearer',
            refresh_token: 'mock_refresh_token'
        } as unknown as T;
    }

    // --- User Endpoints ---
    if (endpoint.includes('/users/me')) {
        const role = localStorage.getItem('mock_role') || RoleEnum.OWNER;
        const isOwner = role === RoleEnum.OWNER;
        
        const mockUser: UserPublic = {
            id: isOwner ? 'owner-1' : 'rider-1',
            email: isOwner ? 'owner@ownima.com' : 'rider@ownima.com',
            full_name: isOwner ? 'John Owner' : 'Alice Rider',
            role: role as RoleEnum,
            avatar: isOwner 
                ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        };
        return mockUser as unknown as T;
    }

    // --- Currency Endpoint ---
    if (endpoint.includes('/utils/currencies/')) {
        return MOCK_CURRENCIES as unknown as T;
    }

    // --- Vehicle Search for Rider (Specific) ---
    if (endpoint.includes('/rider/vehicles/') && endpoint.includes('/search')) {
       // Filter vehicles by owner if needed, but for mock assume we return all or specific subset
       // Extract owner_id from path if necessary, e.g. /rider/vehicles/owner-1/search
       // For this demo, we just return the mock list
       return { vehicles: MOCK_VEHICLES } as unknown as T;
    }

    // --- Vehicle Endpoints ---
    if (endpoint.includes('/vehicle')) {
        // GET /vehicle/:id
        const vehicleIdMatch = endpoint.match(/\/vehicle\/([^\/?]+)/);
        if (method === 'GET' && vehicleIdMatch) {
             const vId = vehicleIdMatch[1];
             if (vId === 'archive' || vId === 'status-summary' || vId === 'delete-drafts') {
                 // handle other sub-resources if needed, for now ignore or implement specific mocks
             } else {
                 const vehicle = MOCK_VEHICLES.find(v => v.id === vId);
                 if (vehicle) {
                     return { vehicle_id: vehicle.id, vehicle: vehicle } as unknown as T;
                 }
             }
        }

        // GET /vehicle (List)
        if (method === 'GET') {
            return { vehicles: MOCK_VEHICLES } as unknown as T;
        }
        // POST /vehicle (Create)
        if (method === 'POST') {
             return { 
                 vehicle_id: 'v-new-' + Date.now(),
                 vehicle: { ...MOCK_VEHICLES[0], id: 'v-new-' + Date.now(), name: 'New Vehicle' }
             } as unknown as T;
        }
    }

    // --- Reservations ---
    if (endpoint.includes('/rider/reservations')) {
        if (method === 'POST') {
            // Mock successful reservation creation
            return {
                reservation_id: `res-${Date.now()}`,
                reservation: {
                    id: `res-${Date.now()}`,
                    vehicle_id: body.vehicle_id,
                    date_from: body.date_from,
                    date_to: body.date_to,
                    total_price: 1000, // Dummy total
                    status: 0 // Created
                }
            } as unknown as T;
        }
    }

    // Default error for unmocked endpoints
    throw new Error(`Mock data not found for endpoint: ${endpoint}`);
  }

  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`);
  }

  static async post<T>(endpoint: string, body: any, isFormData = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, isFormData });
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export default ApiService;
