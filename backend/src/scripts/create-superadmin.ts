import { connectDb, disconnectDb } from '../config/db';
import { bootstrapSuperadmin } from '../modules/auth/service';
import { logger } from '../config/logger';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    logger.error('Usage: tsx src/scripts/create-superadmin.ts <email> <password>');
    process.exit(1);
  }

  try {
    await connectDb();
    logger.info('Creating super admin...');
    
    const result = await bootstrapSuperadmin({ email, password });
    
    logger.info(`Super admin created successfully! ID: ${result.id}, Email: ${result.email}`);
  } catch (error: any) {
    if (error.message === 'Superadmin already exists') {
      logger.error('Error: A superadmin already exists in the database.');
    } else {
      logger.error(`Error creating super admin: ${error.message}`);
    }
  } finally {
    await disconnectDb();
    process.exit(0);
  }
}

main();
