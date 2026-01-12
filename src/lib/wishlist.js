// Wishlist utility functions for managing wishlist in localStorage

export const addToWishlist = (product) => {
  try {
    const wishlistData = localStorage.getItem('wishlist');
    let wishlist = wishlistData ? JSON.parse(wishlistData) : [];
    
    if (!Array.isArray(wishlist)) {
      wishlist = [];
    }

    // Check if product already exists in wishlist
    const existingItemIndex = wishlist.findIndex(item => item._id === product._id);

    if (existingItemIndex > -1) {
      // Product already in wishlist, remove it (toggle)
      wishlist.splice(existingItemIndex, 1);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      }

      return { success: true, wishlist, added: false };
    } else {
      // Add new item to wishlist
      const wishlistItem = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        inventory: product.inventory
      };
      wishlist.push(wishlistItem);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      }

      return { success: true, wishlist, added: true };
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error };
  }
};

export const removeFromWishlist = (productId) => {
  try {
    const wishlistData = localStorage.getItem('wishlist');
    if (!wishlistData) return { success: false };

    let wishlist = JSON.parse(wishlistData);
    
    if (!Array.isArray(wishlist)) {
      wishlist = [];
    }

    wishlist = wishlist.filter(item => item._id !== productId);

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    return { success: true, wishlist };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false, error };
  }
};

export const getWishlist = () => {
  try {
    const wishlistData = localStorage.getItem('wishlist');
    if (!wishlistData) return [];
    
    const wishlist = JSON.parse(wishlistData);
    return Array.isArray(wishlist) ? wishlist : [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
};

export const isInWishlist = (productId) => {
  try {
    const wishlist = getWishlist();
    return wishlist.some(item => item._id === productId);
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

export const clearWishlist = () => {
  try {
    localStorage.removeItem('wishlist');
    
    // Dispatch custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return { success: false, error };
  }
};
