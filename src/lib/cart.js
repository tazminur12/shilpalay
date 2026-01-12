// Cart utility functions for managing cart in localStorage

export const addToCart = (product, quantity = 1, selectedVariation = null) => {
  try {
    const cartData = localStorage.getItem('cart');
    let cart = cartData ? JSON.parse(cartData) : { items: [] };
    
    if (!cart.items) {
      cart.items = [];
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item._id === product._id && 
      JSON.stringify(item.selectedVariation) === JSON.stringify(selectedVariation)
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const cartItem = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        inventory: product.inventory,
        selectedVariation: selectedVariation,
        quantity: quantity
      };
      cart.items.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch custom event to update cart count
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    return { success: true, cart };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error };
  }
};

export const removeFromCart = (productId, selectedVariation = null) => {
  try {
    const cartData = localStorage.getItem('cart');
    if (!cartData) return { success: false };

    let cart = JSON.parse(cartData);
    
    if (!cart.items) {
      cart.items = [];
    }

    cart.items = cart.items.filter(item => {
      if (selectedVariation) {
        return !(item._id === productId && 
                JSON.stringify(item.selectedVariation) === JSON.stringify(selectedVariation));
      }
      return item._id !== productId;
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    return { success: true, cart };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, error };
  }
};

export const updateCartQuantity = (productId, quantity, selectedVariation = null) => {
  try {
    const cartData = localStorage.getItem('cart');
    if (!cartData) return { success: false };

    let cart = JSON.parse(cartData);
    
    if (!cart.items) {
      cart.items = [];
    }

    const itemIndex = cart.items.findIndex(item => {
      if (selectedVariation) {
        return item._id === productId && 
               JSON.stringify(item.selectedVariation) === JSON.stringify(selectedVariation);
      }
      return item._id === productId;
    });

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    return { success: true, cart };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, error };
  }
};

export const getCart = () => {
  try {
    const cartData = localStorage.getItem('cart');
    if (!cartData) return { items: [] };
    
    const cart = JSON.parse(cartData);
    return cart.items ? cart : { items: cart };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { items: [] };
  }
};

export const getCartCount = () => {
  try {
    const cart = getCart();
    return cart.items.reduce((total, item) => total + (item.quantity || 1), 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error };
  }
};
