const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-6MWG4X8JR2';

let isInitialized = false;

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const hasMeasurementId = () => Boolean(GA_MEASUREMENT_ID);

const ensureDataLayer = () => {
  if (!isBrowser()) return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
};

export const initAnalytics = () => {
  if (!isBrowser() || !hasMeasurementId() || isInitialized) return;

  ensureDataLayer();

  if (!document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  isInitialized = true;
};

export const trackPageView = (path) => {
  if (!isBrowser() || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  });
};

export const trackEvent = (eventName, params = {}) => {
  if (!isBrowser() || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
};
