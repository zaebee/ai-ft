export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SEARCH: '/search',
  VEHICLE_DETAILS: '/vehicle/:id',
};

export const MOCK_IMAGES = {
  CAR_PLACEHOLDER: 'https://picsum.photos/800/600',
  AVATAR_PLACEHOLDER: 'https://picsum.photos/200/200',
};