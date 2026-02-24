/**
 * Environment configuration utilities.
 * Reads from Vite env vars (VITE_APP_ENV, VITE_APP_VERSION).
 */

const ENV = (import.meta.env.VITE_APP_ENV || 'dev').toLowerCase();

export const environment = {
  name: ENV,
  isDev: ENV === 'dev',
  isQA: ENV === 'qa',
  isProd: ENV === 'prod',
  version: import.meta.env.VITE_APP_VERSION || '0.0.0',
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',

  /** Label shown in the UI */
  get label() {
    const labels = { dev: 'Development', qa: 'QA', prod: 'Production' };
    return labels[ENV] || ENV.toUpperCase();
  },

  /** Short badge label */
  get badge() {
    return ENV.toUpperCase();
  },
};

export default environment;

