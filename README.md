This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

Before running the application, copy `.env.example` to `.env` and configure the required environment variables:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL database connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js authentication
- `NEXTAUTH_URL`: Your application URL

Optional environment variables:
- `RESEND_API_KEY`: API key for email notifications (emails will be disabled if not provided)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deployment Checklist

Before deploying to production:

1. **Environment Variables**: Set all required environment variables in your hosting platform
2. **Database**: Ensure PostgreSQL database is set up and `DATABASE_URL` is configured
3. **Security**: 
   - Update `NEXTAUTH_SECRET` with a secure random string
   - Verify `next.config.ts` image remote patterns match your needs
4. **Build**: Run `npm run build` to verify the build succeeds
5. **Database Migration**: Run `npx prisma migrate deploy` in production
6. **Optional Features**: Configure `RESEND_API_KEY` if email notifications are needed

