import { revalidatePath } from 'next/cache';
import { clearCache } from '@/lib/cache';

/**
 * Bust cached storefront pages after CMS mutations.
 * Local `next dev` always shows fresh data; Vercel prerenders/caches without this.
 */
export function revalidateStorefront() {
  clearCache();
  revalidatePath('/');
  revalidatePath('/whats-new');
  revalidatePath('/trending');
  revalidatePath('/recommended');
}
