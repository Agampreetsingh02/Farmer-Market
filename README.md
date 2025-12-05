# Krishi Connect - Farmer's Marketplace Platform

A full-stack agricultural marketplace platform connecting farmers and buyers with government MSP assurance.

## Features

### Farmer Dashboard
- List crops for sale with pricing
- View and manage buyer bids
- Track bids by status (Accepted, Pending, Rejected)
- Monitor MSP prices and alerts
- Access government procurement options

### Buyer Dashboard
- Browse available crop listings
- Place bids on crops with real-time price comparison
- Manage your bids with payment integration
- Track bid status and history

### Admin Dashboard
- Platform analytics (users, listings, transactions, revenue)
- User management with role tracking
- MSP price management and updates
- Transaction monitoring

### MSP Assurance
- Real-time government MSP price tracking
- Automatic price alerts when listings fall below MSP
- Government procurement information
- Price comparison tools

### Payment Integration
- Stripe checkout integration
- Secure payment processing
- Transaction tracking
- Order history

## Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email/password
- **Payments**: Stripe
- **UI Components**: shadcn/ui

## Database Schema

### Tables
- `profiles` - User accounts (farmers, buyers, admins)
- `crops` - Available crop types
- `crop_listings` - Farmer's active listings
- `bids` - Buyer offers on listings
- `msp_prices` - Government Minimum Support Prices
- `transactions` - Payment records
- `user_alerts` - Price alerts for farmers

## Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase project
- Stripe account

### Environment Variables

Add these to your Vercel project environment variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=your_production_url
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run database migrations from scripts folder
4. Start development server: `npm run dev`
5. Open http://localhost:3000

## Database Setup

Run the SQL scripts in order:
1. `scripts/001_create_schema.sql` - Creates all tables and RLS policies
2. `scripts/002_seed_crops_and_msp.sql` - Seeds initial crop and MSP data

## Authentication Roles

- **Farmer**: Can list crops and receive bids
- **Buyer**: Can browse crops and place bids
- **Admin**: Can manage users, MSP prices, and platform analytics

## Testing

1. Sign up as a Farmer and list a crop
2. Sign up as a Buyer and browse crops
3. Place a bid on a crop
4. Accept the bid as a Farmer
5. Complete payment as a Buyer with Stripe

## Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Run database migrations in Supabase
5. Deploy with `vercel deploy`

## Support

For issues and support, contact: support@krishiconnect.in

## License

MIT License
