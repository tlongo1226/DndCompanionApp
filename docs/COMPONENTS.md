# UI Components Documentation

This document provides an overview of the key UI components used in the D&D Companion application.

## Layout Components

### Header (`components/ui/header.tsx`)
The main navigation header component that shows:
- Welcome message with username
- Settings button (links to account settings)
- Logout button
- Displays differently based on authentication state

Usage:
```tsx
<Header />
```

### Protected Route (`lib/protected-route.tsx`)
Wrapper component that handles authentication protection for routes:
- Redirects to /auth if user is not authenticated
- Shows loading state while checking auth status
- Renders protected content when authenticated

Usage:
```tsx
<ProtectedRoute 
  path="/protected-path" 
  component={ProtectedComponent} 
/>
```

## Form Components

### AutocompleteInput (`pages/EntityPage.tsx`)
Custom input component with suggestion functionality:
- Shows dropdown of suggestions while typing
- Filters suggestions based on input
- Allows selecting from suggestions or custom input

Usage:
```tsx
<AutocompleteInput
  value={value}
  onChange={handleChange}
  suggestions={suggestions}
  placeholder="Enter value..."
/>
```

## Page Components

### AuthPage (`pages/auth-page.tsx`)
Authentication page component that provides:
- Login form
- Registration form
- Feature description
- Tabs to switch between login/register
- Form validation with password requirements

### EntityPage (`pages/EntityPage.tsx`)
Complex form component for entity management:
- Dynamic fields based on entity type
- Autocomplete for certain fields
- Relationship management
- File uploads
- Form validation

### AccountSettings (`pages/account-settings.tsx`)
User settings page that includes:
- Profile information display
- Theme customization
- Account deletion
- Navigation back to main app

## Utility Components

### Form Components (from shadcn/ui)
- `Form`: Main form wrapper component
- `FormField`: Field wrapper with validation
- `FormItem`: Individual form item container
- `FormLabel`: Styled form labels
- `FormControl`: Input wrapper with consistent styling
- `FormMessage`: Validation message display

### Dialog Components
- `AlertDialog`: Confirmation dialogs
- `Dialog`: Modal dialogs for forms/content

### Selection Components
- `Select`: Dropdown selection
- `SelectTrigger`: Clickable trigger
- `SelectContent`: Dropdown content
- `SelectItem`: Individual option

## Theme and Styling

All components use Tailwind CSS for styling with a consistent theme defined in `theme.json`. Key style classes:

- Container: `container mx-auto`
- Spacing: `space-y-4`, `gap-4`
- Flexbox: `flex items-center justify-between`
- Grid: `grid grid-cols-{n}`
- Typography: `text-{size}`, `font-{weight}`

## Common Patterns

### Form Pattern
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Label</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Error Handling Pattern
```tsx
{error && (
  <div className="text-destructive">
    Error: {error.message}
  </div>
)}
```

### Loading State Pattern
```tsx
{isLoading ? (
  <Skeleton className="h-12 w-64" />
) : (
  <ActualContent />
)}
```
