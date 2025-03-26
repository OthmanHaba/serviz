# Laravel Echo with Pusher Integration for Serviz App

This guide explains how to set up Laravel Echo with Pusher on your Laravel backend to work with the Serviz Expo app.

## Prerequisites

- A Pusher account (sign up at [pusher.com](https://pusher.com))
- Laravel backend with Laravel Broadcast support
- Expo mobile app (already set up)

## Step 1: Set up Pusher on Laravel Backend

### 1. Install required packages

```bash
composer require pusher/pusher-php-server
```

### 2. Configure your `.env` file

Add the following to your Laravel backend's `.env` file:

```
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=eu
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_ENCRYPTED=true
```

Replace `your-app-id`, `your-app-key`, `your-app-secret`, and `eu` with your actual Pusher credentials.

### 3. Update your `config/broadcasting.php`

Make sure your Pusher configuration is set up correctly:

```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'cluster' => env('PUSHER_APP_CLUSTER'),
        'encrypted' => true,
        'host' => env('PUSHER_HOST') ?: 'api-'.env('PUSHER_APP_CLUSTER', 'mt1').'.pusher.com',
        'port' => env('PUSHER_PORT', 443),
        'scheme' => env('PUSHER_SCHEME', 'https'),
        'useTLS' => true,
    ],
],
```

### 4. Enable broadcasting in your Laravel app

Make sure to uncomment the `App\Providers\BroadcastServiceProvider::class` in your `config/app.php` file:

```php
'providers' => [
    // ...
    App\Providers\BroadcastServiceProvider::class,
    // ...
],
```

### 5. Set up authentication for private channels

In your `routes/channels.php` file, define authorization rules for private channels:

```php
<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

// User private channel
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Service request channel
Broadcast::channel('service.request.{requestId}', function ($user, $requestId) {
    // Customize based on your authorization logic
    return true; 
});
```

### 6. Create an authentication endpoint

Laravel automatically creates a broadcasting authentication endpoint at `/broadcasting/auth`. Make sure your API routes are properly set up to handle this authentication.

In your `routes/api.php` file, you might want to add:

```php
Broadcast::routes(['middleware' => ['auth:sanctum']]);
```

Or if you're using a custom authentication system:

```php
Route::post('/broadcasting/auth', function (Request $request) {
    // Your custom authentication logic
    return Broadcast::auth($request);
})->middleware('auth:api');
```

### 7. Create event classes for broadcasting

Create events for the different real-time notifications:

```bash
php artisan make:event ServiceRequestUpdated
php artisan make:event ServicesUpdated
```

Then implement these events:

**ServiceRequestUpdated.php**
```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ServiceRequest;

class ServiceRequestUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $serviceRequest;

    public function __construct(ServiceRequest $serviceRequest)
    {
        $this->serviceRequest = $serviceRequest;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->serviceRequest->user_id);
    }

    public function broadcastAs()
    {
        return 'service.request.updated';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->serviceRequest->id,
            'status' => $this->serviceRequest->status,
            // Add other relevant fields
        ];
    }
}
```

**ServicesUpdated.php**
```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ServicesUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        // No specific data needed
    }

    public function broadcastOn()
    {
        return new Channel('services');
    }

    public function broadcastAs()
    {
        return 'services.updated';
    }
}
```

### 8. Dispatch events in your controllers

When a service request is updated:

```php
use App\Events\ServiceRequestUpdated;

// In your controller method
$serviceRequest->update(['status' => 'active']);
event(new ServiceRequestUpdated($serviceRequest));
```

When services are updated:

```php
use App\Events\ServicesUpdated;

// In your controller method
$service->update($request->validated());
event(new ServicesUpdated());
```

## Step 2: Configure your Expo app

### 1. Create a `.env` file in your Expo app

Create a `.env` file in the root of your Expo project with your Pusher credentials:

```
EXPO_PUBLIC_PUSHER_APP_KEY=your-app-key
EXPO_PUBLIC_PUSHER_CLUSTER=eu
```

### 2. Install the necessary packages

You already have the required packages installed:
- `laravel-echo`
- `pusher-js`

### 3. Configure environment variables

To properly load environment variables in your Expo app, you might want to use a package like `expo-constants` and `dotenv`:

```bash
npm install expo-constants dotenv
```

Then create an `env.js` file to load these variables:

```javascript
import Constants from 'expo-constants';

const ENV = {
  dev: {
    PUSHER_APP_KEY: process.env.EXPO_PUBLIC_PUSHER_APP_KEY,
    PUSHER_CLUSTER: process.env.EXPO_PUBLIC_PUSHER_CLUSTER,
  },
  prod: {
    PUSHER_APP_KEY: process.env.EXPO_PUBLIC_PUSHER_APP_KEY,
    PUSHER_CLUSTER: process.env.EXPO_PUBLIC_PUSHER_CLUSTER,
  }
};

const getEnvVars = (env = Constants.expoConfig.releaseChannel) => {
  if (__DEV__) {
    return ENV.dev;
  } else if (env === 'prod') {
    return ENV.prod;
  }
  return ENV.dev;
};

export default getEnvVars;
```

## Testing the Integration

1. Start your Laravel backend
2. Launch your Expo app
3. Create or update a service request
4. Verify that the app receives real-time updates without polling

## Troubleshooting

- Check that your Pusher credentials are correct
- Verify that authentication is working correctly for private channels
- Check Laravel logs for any broadcasting-related errors
- Use the Pusher debug console to see if events are being sent

## Additional Resources

- [Laravel Echo Documentation](https://laravel.com/docs/10.x/broadcasting#client-side-installation)
- [Pusher Documentation](https://pusher.com/docs)
- [Laravel Broadcasting](https://laravel.com/docs/10.x/broadcasting)
- [Laravel Pusher Integration](https://laravel.com/docs/10.x/broadcasting#pusher-channels)
