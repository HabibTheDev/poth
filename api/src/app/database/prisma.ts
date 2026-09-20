import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

prisma.$on('query' as never, (_e: any) => {
  // if (process.env.NODE_ENV === 'development') {
  //   logger.debug('Query: ' + e.query);
  //   logger.debug('Duration: ' + e.duration + 'ms');
  // }
});

export default prisma;
