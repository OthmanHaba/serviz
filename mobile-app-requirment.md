# Serviz Mobile App Requirements Document

## Overview
Serviz is a React Native mobile application that connects users with roadside assistance services. The app will provide a native mobile experience for both users seeking assistance and service providers.

## Tech Stack
- Expo (Latest SDK)
  - Expo Location
  - Expo Notifications
  - Expo Updates
  - Expo MapView
  - Expo SecureStore
  - Expo Device
  - Expo Linking
- Zustand for state management
  - Persist middleware for offline data
  - Devtools for debugging
- React Query (TanStack Query)
  - Offline support
  - Optimistic updates
  - Infinite queries for lists
- Expo Router for file-based routing
- React Native Paper for UI components
- Socket.io-client for real-time features
- Axios for API calls
- React Hook Form for form handling
- Zod for schema validation

## Authentication & Authorization
All authenticated screens should check for valid token and redirect to login if invalid.

### Public Screens
1. **Onboarding Screens**
   - App introduction slides
   - Role selection (User/Service Provider)
   - API: None

2. **Login Screen**
   - Clean, minimalist design
   - Fields:
     - Email
     - Password
   - Biometric login option
   - "Forgot Password" link
   - API: `POST /api/login`

3. **Registration Screen**
   - Step-by-step registration flow
   - Progress indicator
   - Fields:
     - Email
     - Phone
     - Password
     - Vehicle Information (for users)
   - API: `POST /api/register`

## Navigation Structure

### User App Navigation
1. **Bottom Tab Navigator**
   - Home
   - Active Requests
   - History
   - Profile

2. **Stack Navigators** for each tab
   - Nested navigation for detailed views
   - Modal screens for actions

### Service Provider App Navigation
1. **Bottom Tab Navigator**
   - Dashboard
   - Requests
   - Earnings
   - Profile

## Screen Specifications

### User Screens

1. **Home Screen**
   - Location permission request
   - Current location display with map
   - Service type selection cards:
     - Towing Service
     - Gas Delivery
     - Mechanic
   - Quick action buttons
   - APIs:
     - `GET /api/providers/nearby`

2. **Request Service Flow**
   - Step 1: Service Type Selection
     - Large, clear icons
     - Service description
   - Step 2: Location Confirmation
     - Map view with draggable pin
     - Current location auto-fill
     - Search location option
   - Step 3: Service Details
     - Dynamic form based on service type:
       - Towing: Vehicle type
       - Gas: Fuel type, quantity
       - Mechanic: Issue description, complexity
   - Step 4: Confirmation
     - Price estimate
     - Provider matching
   - APIs:
     - `POST /api/requests`
     - `GET /api/providers/nearby`

3. **Active Request Screen**
   - Real-time status updates
   - Provider location tracking
   - ETA display
   - Provider details card
   - Emergency contact button
   - Chat interface
   - Payment interface
   - APIs:
     - `GET /api/requests/{serviceRequest}`
     - `PATCH /api/requests/{serviceRequest}/status`
     - `POST /api/payments/requests/{serviceRequest}`

4. **History Screen**
   - List of past requests
   - Pull-to-refresh
   - Filter options
   - Search functionality
   - API: `GET /api/requests/user`

5. **Profile Screen**
   - User information
   - Saved vehicles
   - Payment methods
   - Notification settings
   - Dark mode toggle
   - Language selection

### Service Provider Screens

1. **Provider Dashboard**
   - Online/Offline toggle
   - Current location tracking
   - Active request card
   - Today's earnings
   - APIs:
     - `PATCH /api/providers/{provider}/availability`
     - `POST /api/providers/{provider}/location`

2. **Request Management**
   - Nearby requests map
   - Request list with details
   - Accept/Reject swipe actions
   - Navigation integration
   - APIs:
     - `GET /api/requests/provider`
     - `POST /api/requests/{serviceRequest}/accept`

3. **Earnings Screen**
   - Daily/Weekly/Monthly views
   - Earnings breakdown
   - Transaction history
   - Payout information

## UI/UX Requirements

### Design System
- Native platform design guidelines
- Consistent branding:
  - Primary: #2563EB
  - Secondary: #059669
  - Accent: #DC2626
  - Background: System background
  - Text: System text colors

### Native Components
1. **Core Components**
   - Custom Button styles
   - Form inputs with validation
   - Cards and Lists
   - Loading indicators
   - Toast messages
   - Modal sheets

2. **Custom Components**
   - Service type selector
   - Location picker map
   - Progress stepper
   - Rating input
   - Chat bubble
   - Payment method selector

### Mobile-Specific Features
- Gesture controls
- Pull-to-refresh
- Swipe actions
- Haptic feedback
- Share functionality
- Deep linking

## Features & Interactions

### Real-time Features
- Push notifications for:
  - Request updates
  - Provider assignment
  - Chat messages
  - Payment status
- Socket.IO for live tracking

### Maps & Location
- Background location tracking
- Geofencing for service areas
- Route optimization
- Offline map support
- Address autocomplete

### Payment Integration
- Multiple payment methods
- Secure card storage
- Digital wallet support
- Receipt generation
- Offline payment handling

### Offline Support
- Data persistence
- Queue system for actions
- Automatic retry
- Sync management
- Conflict resolution

## Performance Requirements
- Cold start under 2 seconds
- Smooth animations (60 fps)
- Efficient battery usage
- Minimal data usage
- Optimized image loading

## Security Requirements
- Biometric authentication
- Secure token storage
- Certificate pinning
- App transport security
- Jailbreak detection

## Testing Requirements
- Unit tests
- Integration tests
- E2E testing with Detox
- Device testing matrix
- Beta testing program

## Platform Support
- iOS 13+
- Android 8+
- Tablet layout support
- Split-screen support
- Landscape mode (optional)

## Deployment
- CI/CD pipeline
- App Store optimization
- Play Store listing
- Beta distribution
- Crash reporting 