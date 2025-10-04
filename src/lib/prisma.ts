import { PrismaClient } from '@prisma/client';

// Prevent hot-reload instantiations in dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Helpful runtime checks: if we're running in production ensure DATABASE_URL is
// set and not pointing at a local sqlite file. This produces a clearer error
// than the generic "Unable to open the database file" if the app tries to use
// sqlite in a deployed environment.
if (process.env.NODE_ENV === 'production') {
	const dbUrl = process.env.DATABASE_URL;
	if (!dbUrl) {
		throw new Error(
			'DATABASE_URL is not set in production. Set DATABASE_URL to your Supabase Postgres connection string in your hosting provider (Vercel, etc.).'
		);
	}
	if (dbUrl.startsWith('file:')) {
		throw new Error(
			'DATABASE_URL points to a sqlite file (file:...). In production you must use a Postgres database (for example a Supabase connection string).'
		);
	}
}

// Configure Prisma Client with optimal settings for serverless environments
export const prisma = globalForPrisma.prisma || new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	// Optimize for serverless/edge environments
	datasources: {
		db: {
			url: process.env.DATABASE_URL,
		},
	},
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
