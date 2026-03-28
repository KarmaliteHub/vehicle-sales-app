// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://vehicle-sales-backend.onrender.com/api'
};
