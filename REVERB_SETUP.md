# Laravel Reverb Integration for Serviz App

This guide explains how to set up Laravel Reverb on your Laravel backend to work with the Serviz Expo app.

## What is Laravel Reverb?

Laravel Reverb is Laravel's official WebSocket server for real-time applications. It's a modern alternative to Laravel Echo and Laravel Websockets, providing a more efficient and scalable solution for real-time communication.

## Backend Setup (Laravel)

### 1. Install Laravel Reverb

In your Laravel backend project, run:

```bash
composer require laravel/reverb
```

### 2. Publish the Reverb configuration

```bash
php artisan reverb:install
```

This will create a `config/reverb.php` configuration file.

### 3. Configure Reverb

Update your `.env` file with the following settings:

```
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
REVERB_APP_ID=serviz
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
```

Make sure to generate secure values for `REVERB_APP_KEY` and `REVERB_APP_SECRET`.

### 4. Set up authentication for private channels

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
    return true; // Customize based on your authorization logic
});
```

### 5. Create event classes for broadcasting

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
        return [
            new PrivateChannel('user.' . $this->serviceRequest->user_id),
            new PrivateChannel('service.request.' . $this->serviceRequest->id)
        ];
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

### 6. Dispatch events in your controllers

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

### 7. Start the Reverb server

```bash
php artisan reverb:start
```

For production, you should run Reverb as a service using Supervisor or a similar process manager.

## Testing the Integration

1. Start your Laravel backend with Reverb running
2. Launch your Expo app
3. Create or update a service request
4. Verify that the app receives real-time updates without polling

## Troubleshooting

- Check that your WebSocket server is accessible from your device
- Verify that authentication is working correctly for private channels
- Check Laravel logs for any Reverb-related errors
- Use browser developer tools to debug WebSocket connections

## Additional Resources

- [Laravel Reverb Documentation](https://laravel.com/docs/11.x/reverb)
- [Laravel Broadcasting](https://laravel.com/docs/11.x/broadcasting)
