# Ball & Boujee - Project Specification

## Overview
A premium basketball culture and fashion brand platform featuring the "Infinity" brand merchandise. Production-ready website with full e-commerce functionality.

## Tech Stack

### Frontend
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS (custom config)
- Redux Toolkit + RTK Query
- Framer Motion (animations)
- React Hook Form + Zod
- next/image + next/font

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + HTTP-only cookies
- Stripe + Paystack payments
- Cloudinary (media storage)
- Nodemailer (emails)

## Design System

### Colors
- Background: #0A0A0A
- Surface: #111111
- Card: #1A1A1A
- Primary: #FFFFFF
- Accent: #C9A84C (gold)
- Accent-2: #8B8B8B
- Danger: #FF3B3B

### Typography
- Display: "Bebas Neue"
- Body: "Inter"
- Accent: "Playfair Display"

### Design Rules
- Bold oversized typography
- Minimal whitespace
- Grain texture overlays
- Metallic shimmer effects
- Editorial grid layouts
- Hover animations

## Pages

### 1. Homepage (/)
- HeroSection (full-viewport with video/image background)
- AboutTeaser (stats + mission)
- FeaturedProducts (Infinity brand drops)
- EventTeaser (next event countdown)
- GalleryTeaser (bento grid)
- NewsletterBanner

### 2. About (/about)
- PageHero
- StorySection (two-column layout)
- PillarsSection (4 cards)
- PhotoGrid (masonry)

### 3. Shop (/shop)
- ShopHero
- FilterBar (categories, sorting)
- ProductGrid (responsive)
- Product Detail (/shop/[slug])
- CartDrawer

### 4. Events (/events)
- EventsHero
- NextEventBanner
- EventList (upcoming + past)

### 5. Gallery (/gallery)
- GalleryHero
- TabFilter (Photos/Videos/Editorials)
- PhotoGallery + VideoSection

### 6. Contact (/contact)
- ContactHero
- Two-column layout (collaboration info + contact form)

## Features
- Full e-commerce with cart functionality
- Event RSVP system
- Newsletter subscription
- Contact form
- Responsive design (mobile-first)
- SEO optimized
- Performance optimized

## API Endpoints
- Products: CRUD operations
- Events: List, RSVP
- Orders: Create, checkout
- Newsletter: Subscribe
- Contact: Submit forms
- Auth: Admin panel

## Redux Store
- cartSlice: Cart management
- uiSlice: UI state (filters, modals)
- userSlice: Authentication state
- RTK Query: API services

## Requirements
- TypeScript strict mode
- Component reusability
- Error handling
- Loading states
- Form validation
- Security best practices

## Deliverable
Complete implementation with:
- All pages functional
- E-commerce workflow
- Contact/newsletter forms
- Mobile responsiveness
- Production deployment ready

This specification defines the complete Ball & Boujee website implementation.