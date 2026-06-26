import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import '@/index.css';
import { queryClient } from '@/lib/queryClient.js';
import { initAnalytics } from '@/lib/analytics.js';

initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<App />
	</QueryClientProvider>
);
