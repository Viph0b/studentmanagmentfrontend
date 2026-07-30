// Matches the ASP.NET Core backend's default "http" launch profile
// (Properties/launchSettings.json -> applicationUrl: http://localhost:5073)
// and the CORS policy "AllowAngular" which only allows http://localhost:4200.
// If you run the API on a different port/host, update this one constant.
export const API_BASE_URL = 'http://localhost:5073/api';
