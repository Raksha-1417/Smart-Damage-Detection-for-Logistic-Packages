// API_URL is injected by build.sh from the Render environment variable API_URL.
// To override locally: set API_URL before running build.sh, or edit directly.
export const environment = {
  production: true,
  apiUrl: '%%API_URL%%'
};
