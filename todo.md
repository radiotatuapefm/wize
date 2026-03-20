# WIZE Marketplace - TODO

## Phase 1: Database Schema
- [x] Users table with OTP fields and email verification
- [x] Products table with all fields (name, desc, price, category, images, stock, status)
- [x] Categories table
- [x] Orders table for Stripe payments
- [x] Chat conversations and messages tables
- [x] OTP tokens table

## Phase 2: Backend (tRPC Routers)
- [x] Auth router: me, logout (Manus OAuth-based authentication)
- [x] Products router: create, update, delete, list, getById, toggleStatus
- [x] Marketplace router: featured, search, filter by category/price/popularity
- [x] Upload router: S3 image upload for products (getUploadUrl + uploadImage)
- [x] Orders router: create checkout session, webhook handler
- [x] Chat router: createConversation, sendMessage, listMessages, LLM moderation

## Phase 3: Stripe Integration
- [x] Add Stripe feature via webdev_add_feature
- [x] Create checkout session procedure
- [x] Stripe webhook for order confirmation
- [x] Order status updates

## Phase 4: Frontend - Design System & Marketplace
- [x] Dark mode CSS variables (black, dark gray, neon purple, electric blue, neon green)
- [x] Google Fonts (Inter + Poppins)
- [x] Global layout with top navigation bar (Navbar.tsx)
- [x] Home page with hero section and featured products
- [x] Search bar with live results
- [x] Category/price/popularity filters (MarketplacePage)
- [x] Product card component with hover animations (ProductCard.tsx)
- [x] Individual product page with image gallery and purchase button (ProductPage.tsx)
- [x] Smooth animations (fade, slide) with framer-motion

## Phase 5: Seller Dashboard
- [x] Seller dashboard layout (DashboardPage.tsx)
- [x] Product list with status indicators
- [x] Create product form with S3 image upload (CreateProductPage.tsx)
- [x] Edit product form (EditProductPage.tsx)
- [x] Delete product with confirmation dialog
- [x] Toggle active/inactive status
- [x] Dashboard stats (total products, active, sales, views)

## Phase 6: Chat System
- [x] Real-time chat UI between buyer and seller (ChatPage.tsx)
- [x] LLM-powered message moderation
- [x] LLM response suggestions for sellers
- [x] Conversation list sidebar
- [x] Message bubbles with timestamps

## Phase 7: Final Polish
- [x] Owner email notifications for new products and key events
- [x] Role-based access control (admin vs user via schema)
- [x] Mobile responsiveness (mobile-first design throughout)
- [x] Vitest unit tests (23 tests passing)
- [x] Final checkpoint and delivery
