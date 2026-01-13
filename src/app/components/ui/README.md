# UI Components Documentation

This directory contains reusable UI components for better UX and accessibility.

## Components

### 1. Loading Component

A consistent loading spinner component.

```jsx
import Loading from '@/app/components/ui/Loading';

// Basic usage
<Loading />

// With custom text
<Loading text="Loading products..." />

// Different sizes
<Loading size="sm" />  // small
<Loading size="md" />  // medium (default)
<Loading size="lg" />  // large
<Loading size="xl" />  // extra large

// Full screen
<Loading fullScreen text="Loading..." />
```

### 2. Skeleton Loaders

Skeleton loaders for better perceived performance.

```jsx
import { 
  Skeleton, 
  ProductCardSkeleton, 
  ProductListSkeleton,
  OrderCardSkeleton,
  OrderListSkeleton,
  TableSkeleton,
  PageSkeleton
} from '@/app/components/ui/Skeleton';

// Basic skeleton
<Skeleton className="h-4 w-full" />

// Product card skeleton
<ProductCardSkeleton />

// Product list (8 items by default)
<ProductListSkeleton count={12} />

// Order card skeleton
<OrderCardSkeleton />

// Order list (5 items by default)
<OrderListSkeleton count={10} />

// Table skeleton
<TableSkeleton rows={10} cols={5} />

// Page skeleton
<PageSkeleton />
```

**Usage Example:**
```jsx
if (loading) {
  return <ProductListSkeleton count={8} />;
}
```

### 3. Toast Notifications

Modern toast notification system (replaces SweetAlert2 for simple notifications).

```jsx
import { useToast } from '@/app/components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  // Success
  toast.success('Product added to cart!');
  
  // Error
  toast.error('Failed to load data');
  
  // Info
  toast.info('Your order is being processed');
  
  // Warning
  toast.warning('Low stock available');

  // With title
  toast.success('Order Placed', {
    title: 'Success!',
    duration: 5000
  });

  // Persistent (no auto-dismiss)
  toast.info('Processing...', {
    duration: 0
  });
}
```

**Note:** ToastProvider is already added to the app in `providers.js`.

### 4. Accessible Components

Components with built-in accessibility features.

```jsx
import { 
  AccessibleButton, 
  AccessibleLink, 
  AccessibleInput 
} from '@/app/components/ui/AccessibleButton';

// Button with accessibility
<AccessibleButton
  onClick={handleClick}
  ariaLabel="Add to cart"
  variant="primary"
>
  Add to Cart
</AccessibleButton>

// Variants: default, primary, secondary, danger, outline, ghost

// Accessible link
<AccessibleLink
  href="/products"
  ariaLabel="View all products"
>
  View Products
</AccessibleLink>

// Accessible input
<AccessibleInput
  label="Email Address"
  type="email"
  required
  error={errors.email}
  ariaLabel="Enter your email address"
/>
```

## Migration Guide

### Replacing Loading States

**Before:**
```jsx
if (loading) {
  return <div>Loading...</div>;
}
```

**After:**
```jsx
import Loading from '@/app/components/ui/Loading';

if (loading) {
  return <Loading text="Loading products..." />;
}
```

### Replacing SweetAlert2 with Toast

**Before:**
```jsx
Swal.fire({
  icon: 'success',
  title: 'Success',
  text: 'Product added!',
  timer: 2000
});
```

**After:**
```jsx
import { useToast } from '@/app/components/ui/Toast';

const toast = useToast();
toast.success('Product added!');
```

**Keep SweetAlert2 for:**
- Confirmation dialogs (yes/no)
- Complex forms
- Important warnings that need user action

### Adding Skeleton Loaders

**Before:**
```jsx
if (loading) {
  return <Loading />;
}
```

**After:**
```jsx
import { ProductListSkeleton } from '@/app/components/ui/Skeleton';

if (loading) {
  return <ProductListSkeleton count={8} />;
}
```

## Accessibility Best Practices

1. **Always use AccessibleButton** for interactive elements
2. **Provide aria-label** for icon-only buttons
3. **Use AccessibleInput** for form fields
4. **Add focus states** - already included in accessible components
5. **Keyboard navigation** - all accessible components support Tab/Enter/Space

## Examples

See the updated pages for examples:
- `src/app/(website)/(main)/pages/[slug]/page.js` - Loading component
- `src/app/(dashboard)/layout.js` - Loading component
- `src/app/(website)/(main)/cart/page.js` - Loading component
