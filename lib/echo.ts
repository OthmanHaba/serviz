import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Set Pusher instance globally
(window as any).Pusher = Pusher;

// Initialize Laravel Echo
const echo = new Echo({
  broadcaster: 'pusher',
  key: 'my-app-key', // Replace with your Laravel Reverb app key
  cluster: 'mt1', // Adding the required cluster parameter
  wsHost: 'localhost', // Replace with your Laravel server IP
  wsPort: 8080, // Default Reverb port
  forceTLS: false,
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
});

export default echo;
