## Shilpalay – Fashion & Lifestyle E‑commerce

**Shilpalay** is a full‑featured fashion & lifestyle e‑commerce platform built with **Next.js (App Router)**.  
It is designed for high‑end brands that need a clean, fast and conversion‑focused storefront plus a powerful admin dashboard.

---

## Tech Stack

- **Framework**: Next.js (App Router, React Server Components)
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Auth**: NextAuth
- **Database / Models**: Mongoose (MongoDB) – via `src/lib/db.js` and `src/models/*`
- **Deployment**: Optimized for Vercel

---

## Core Features

### Storefront (Customer Side)

- **Modern, responsive UI**
  - Clean typography, generous white‑space, mobile‑first layout.
  - Sticky navbar with category navigation and search.

- **Home & Category Experience**
  - Dynamic home page sections driven by `PageLayout` (hero, banners, collections, trending, recommended, newsletter, etc.).
  - Category and sub‑category product listing pages with professional grid cards.

- **Product Details**
  - Large gallery image with carousel arrows and dots.
  - Compact, professional right column with:
    - Price, discount and savings
    - SKU, short description and variations
    - Quantity stepper
    - **Add to Cart**, **Wishlist**, **Share**
  - Technical details, full description and shipping info blocks.

- **Wishlist**
  - Heart icon in navbar and on product cards.
  - Items are stored in `localStorage` via `src/lib/wishlist.js`.
  - Clicking wishlist on product / card:
    - Adds item to wishlist
    - Redirects to **`/my-account/wishlist`** page
  - Wishlist page lives inside **My Account** layout with:
    - Grid of saved products
    - Remove, add‑to‑cart and share actions.

- **Cart**
  - Cart icon in navbar with live item count (listens to `cartUpdated` event).
  - Professional **`/cart`** page:
    - Compact grid layout (items + order summary)
    - Quantity controls with live totals
    - Shipping, VAT and total calculation
    - Coupon input (`Apply Points/Credits/Gift Card` style)
    - “Continue Shopping” and “Checkout” actions.

- **Checkout**
  - **`/checkout`** page aligned with modern retail patterns:
    - 1. Shipping address form (name, phone, address, region, city, zip)
    - 2. Shipping method (standard shipping with description)
    - 3. Payment method (card, bKash, cash on delivery – UI ready)
  - Order review panel:
    - Line‑items with image and quantity
    - Subtotal, shipping, VAT, total
    - Disclaimers and terms acknowledgement
    - “Place Order” CTA (currently mocked – ready to hook to API).

- **My Account**
  - `my-account`, `account-info`, `address-book`, and **wishlist** sections.
  - Left side account menu with active state; right side shows contextual content.

---

## Admin Dashboard

Accessible at **`/dashboard`** (role‑protected via NextAuth).

### Navigation & Layout

- Sidebar with structured sections:
  - **Dashboard**, **Products**, **Categories**, **Collections**
  - **Inventory**, **Orders**, **Customers**
  - **Payments**, **Shipping**, **Offers & Campaigns**
  - **Content**, **Reviews**, **Reports**
  - **Stores / Outlets**, **Admin & Roles**, **Settings**, **Support**, **Advanced**
- Topbar for quick access and user session controls.

### Product Management

- Add / edit products with:
  - Pricing (regular / sale)
  - Inventory & availability
  - Variations (color, size, stock, price override)
  - Images (thumbnail & gallery)
  - Description blocks (fabric, work type, fit, wash care, origin, full description).

### Content Management

- Banners, page content and navigation managed via API routes under `src/app/api/*`.

---

## Local Development

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

2. **Set up environment variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and fill in your actual values
   # Required variables:
   # - MONGO_URI (MongoDB connection string)
   # - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
   # - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   # - NEXT_PUBLIC_CLOUDINARY_API_KEY
   # - CLOUDINARY_API_SECRET
   # - NEXT_PUBLIC_SITE_URL
   ```

   See [ENV_SETUP.md](./ENV_SETUP.md) for detailed setup instructions.

3. **Run the dev server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open `http://localhost:3000` in your browser.

> **Important**: Make sure all required environment variables are set in `.env.local` before running the application.

---

## Project Structure (High Level)

- `src/app/(website)/(main)` – public storefront pages (home, category, product, cart, checkout etc.)
- `src/app/(website)/my-account` – account area (account info, address book, wishlist)
- `src/app/(dashboard)` – admin dashboard (products, settings, content, etc.)
- `src/app/api` – REST‑style API routes for products, categories, banners, auth, uploads and more
- `src/app/components` – shared UI components (navbar, footer, cards, layout, dashboard sidebar, etc.)
- `src/lib/cart.js` – cart utilities (add / remove / update, events)
- `src/lib/wishlist.js` – wishlist utilities
- `src/lib/db.js` – database connection helper
- `src/models` – Mongoose models (Product, Category, User, Banner, etc.)

---

## Environment Variables

Required environment variables are documented in [ENV_SETUP.md](./ENV_SETUP.md).

**Quick Setup:**
1. Copy `.env.example` to `.env.local`
2. Fill in your MongoDB, NextAuth, and Cloudinary credentials
3. Restart your development server

## Roadmap / Ideas

- Hook checkout to real order API and payment gateway
- Persist cart & wishlist to database for logged‑in users
- Product reviews & ratings UI on product page
- Advanced search & filtering on listing pages

---

## License

This project is currently private and intended for internal / client use.  
Do not distribute without permission.

