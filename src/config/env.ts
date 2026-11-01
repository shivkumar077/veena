const appName = import.meta.env.VITE_APP_NAME?.trim();

export const appConfig = Object.freeze({
  appName: appName || 'VEENA',
  isProduction: import.meta.env.PROD,
});
