# Gadai Sakti - Frontend Application

PT Gadai Sakti Nusantara's modern web application for fast, secure, and transparent gadai (collateral) services with instant valuation simulation.

## Project Overview

A comprehensive Next.js 16 application built with React 19, featuring:
- **Landing Page**: 12 optimized sections showcasing services, trust factors, process, and testimonials
- **Simulation System**: Cascading dropdown selector for instant item valuation
- **Booking Management**: Multi-step booking process with confirmation and status tracking
- **Content Management**: Articles, FAQ, testimonials, and branch listings
- **Service Layer**: Abstracted data access layer enabling seamless migration from dummy data to REST APIs

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19.2 with shadcn/ui components
- **Styling**: Tailwind CSS 4.2
- **Animation**: Framer Motion
- **State Management**: SWR for data fetching and client-side caching
- **Carousel**: Embla Carousel
- **Font**: Google Poppins

## Project Structure

```
app/
├── layout.tsx                 # Root layout with metadata
├── page.tsx                   # Landing page
├── globals.css                # Design tokens and global styles
├── simulasi/
│   └── page.tsx              # Simulation page
├── booking/
│   └── page.tsx              # Booking confirmation page
├── booking-success/
│   └── [bookingNumber]/
│       └── page.tsx          # Booking success page
├── cek-pemesanan/
│   └── page.tsx              # Check booking status page
├── artikel/
│   ├── page.tsx              # Articles listing
│   └── [slug]/
│       └── page.tsx          # Article detail page
├── cabang/
│   └── page.tsx              # Branches listing
└── arsip/
    └── page.tsx              # Customer booking history

components/
├── header.tsx                 # Navigation header
├── footer.tsx                 # Footer
├── sections/
│   ├── hero.tsx              # Hero section
│   ├── trust.tsx             # Trust & stats sections
│   ├── categories.tsx        # Categories & CTA sections
│   ├── process-testimonials.tsx  # Process & testimonials
│   └── faq-articles.tsx      # FAQ & articles preview
└── pages/
    ├── simulation-form.tsx   # Simulation form component
    ├── booking-form.tsx      # Booking form component
    └── ...

lib/
├── types.ts                   # TypeScript interfaces
├── dummy-data.ts              # Mock data
└── services/
    ├── simulation.service.ts  # Simulation logic
    ├── booking.service.ts     # Booking logic
    ├── article.service.ts     # Article management
    ├── branch.service.ts      # Branch management
    └── misc.service.ts        # FAQ, testimonials, archive
```

## Design System

### Colors
- **Primary**: #13374d (Dark Blue) - Brand color for headings and primary actions
- **Accent**: #eb3a40 (Red) - Highlights and calls-to-action
- **Background**: #f8f9fa (Light Gray) - Page backgrounds
- **Text Main**: #1f2937 (Dark Gray) - Primary text
- **Text Muted**: #4b5563 (Medium Gray) - Secondary text
- **Border**: #cbd5e1 (Light Border)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Headings**: Bold (700 weight), using text-primary color
- **Body**: 400-500 weight, using text-main and text-muted colors

## Landing Page Sections (12 Total)

1. **Hero** - Eye-catching headline with value propositions
2. **Trust** - Why choose Gadai Sakti section
3. **Stats** - Key metrics and social proof
4. **Categories** - Item categories available for gadai
5. **Process** - 6-step process visualization
6. **Testimonials** - Customer reviews with ratings
7. **FAQ** - Common questions and answers
8. **Articles** - Featured blog posts
9. **CTA** - Call-to-action for quick engagement
10. **Footer** - Navigation and company info

## Key Features

### Simulation Flow
- Select branch → Category → Brand → Series → Variant → Storage → Year → Color → Quantity
- Real-time valuation calculation
- Item detail summary with booking option

### Booking System
- Form validation for customer data
- Booking number generation (GS-YYYYTIMESTAMP)
- Status tracking with timeline visualization
- Automatic data persistence via localStorage

### Service Layer Architecture
- **Purpose**: Easy migration from dummy data to REST APIs
- **Pattern**: All pages use services, never fetch directly
- **Scalability**: Change only service implementations, UI components remain unchanged

## Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```
Visit http://localhost:3000

### Build
```bash
pnpm build
pnpm start
```

## Future Enhancements

### Phase 2 - Backend Integration
- Connect to actual REST APIs
- Replace dummy data with real database
- Implement real booking system
- Add payment processing

### Phase 3 - Advanced Features
- User authentication and accounts
- Real-time booking status updates
- Customer dashboard
- Admin panel
- Notification system (SMS/Email)

### Phase 4 - Mobile & Progressive
- Mobile app optimization
- PWA capabilities
- Offline support
- Native mobile apps

## Environment Variables

```env
# Add any future API endpoints here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading of components with Framer Motion
- SWR for efficient data fetching and caching
- Tailwind CSS for minimal bundle size
- CSS minification and tree-shaking

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

Proprietary - PT Gadai Sakti Nusantara

## Contact

- Email: info@gadaisakti.id
- Phone: +62 21 5555-0001
- Website: www.gadaisakti.id

---

**Last Updated**: 2024
**Version**: 1.0.0
