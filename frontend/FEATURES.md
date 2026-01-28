# Todo Application - Feature Overview

## Application Screenshots & Features

### 1. Server Badge (Top-Right Corner)
- **Always Visible**: Displays on every screen
- **Shows**: "Server #X" where X is the configured server number
- **Purpose**: Helps identify which server instance is serving the application
- **Styling**: Purple badge with white text, fixed position

### 2. Authentication Pages

#### Login Screen
- Clean, centered form with:
  - Username input field
  - Password input field
  - Login button
  - Tab to switch to Register
- Modern card-based design with shadow
- Responsive for mobile devices

#### Register Screen
- Similar design to login with:
  - Username input
  - Password input
  - Confirm Password input
  - Register button
  - Tab to switch to Login
- Client-side password matching validation

### 3. Main Todo Dashboard

#### Header Section
- App title: "My Todos"
- Current username display
- Logout button
- Clean, professional design

#### Controls Bar
- **Filter Dropdown**: Filter by All/Pending/Completed
- **Sort Dropdown**: Sort by Newest/Oldest First
- **Add Todo Button**: Large, prominent "+ Add Todo" button

#### Todo List
Each todo card displays:
- **Title**: Bold, prominent text
- **Creation Date**: Small, gray text showing when created
- **Description**: (if provided) Multi-line text display
- **Status Badge**: Color-coded (Green for Completed, Yellow for Pending)
- **Action Buttons**:
  - ✓ Toggle completion (green background)
  - ✏️ Edit (blue background)
  - 🗑️ Delete (red background)

**Visual States**:
- Completed todos: Slightly transparent with strikethrough text
- Hover effect: Card lifts up with shadow
- Color-coded border based on status

### 4. Add/Edit Todo Modal

#### Modal Features
- Centered overlay with dark background
- Clean white card design
- Close button (X) in top-right

#### Form Fields
- **Title**: Required text input
- **Description**: Optional multi-line textarea
- **Completed Checkbox**: Only shown when editing

#### Buttons
- **Cancel**: Gray button to close without saving
- **Save**: Blue button to submit

### 5. Delete Confirmation Modal
- Small, centered modal
- Clear warning message
- Two buttons:
  - Cancel (gray)
  - Delete (red)

## Color Scheme

### Primary Colors
- **Primary**: Indigo (#4f46e5) - Buttons, headers, accents
- **Success**: Green (#10b981) - Completed status
- **Warning**: Yellow (#f59e0b) - Pending status
- **Danger**: Red (#ef4444) - Delete actions
- **Secondary**: Gray (#6b7280) - Secondary buttons

### Background Colors
- **Page Background**: Light gray (#f9fafb)
- **Card Background**: White (#ffffff)
- **Text**: Dark gray (#111827)

## Responsive Design

### Desktop (>768px)
- Multi-column layout where appropriate
- Larger cards and spacing
- Side-by-side filters and controls

### Tablet (768px - 480px)
- Adjusted spacing
- Stacked controls in some areas
- Optimized touch targets

### Mobile (<480px)
- Full-width cards
- Stacked layout
- Larger touch targets for buttons
- Simplified header
- Mobile-optimized modals

## User Experience Features

### Loading States
- Loading message when fetching todos
- Smooth transitions between states

### Empty States
- Friendly message when no todos exist
- Encourages user to create first todo

### Error Handling
- Clear error messages in red boxes
- Field-specific validation errors
- Network error detection
- Auto-logout on session expiration

### Notifications
- Success messages for actions
- Error alerts for failures
- User-friendly error descriptions

### Data Persistence
- JWT tokens stored in localStorage
- Session maintained across page refreshes
- Automatic token validation

## Accessibility

- Semantic HTML structure
- Proper form labels
- Keyboard navigation support
- Focus states on interactive elements
- Clear visual hierarchy
- Adequate color contrast

## Performance

- Lightweight vanilla JavaScript (no frameworks)
- Minimal CSS and HTML
- Optimized for fast loading
- Gzip compression enabled in nginx
- Static asset caching
- No external dependencies

## Security Features

- JWT token authentication
- XSS protection headers
- Content type nosniff
- Frame options protection
- HTML escaping for user content
- HTTPS ready (configure reverse proxy)

## Browser Compatibility

- Chrome/Edge (Chromium): Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized and tested
- IE11: Not supported (uses modern JavaScript)
