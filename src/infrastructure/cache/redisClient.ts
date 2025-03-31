import { createClient, RedisClientType } from 'redis';
import { injectable } from 'tsyringe';
import { ICacheService } from '../../domain/orders/contracts/ICache';

@injectable()
export class RedisCacheService implements ICacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect().catch(console.error);

    this.client.on('connect', () => console.log('Redis'));
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setEx(key: string, ttl: number, value: string): Promise<void> {
    await this.client.setEx(key, ttl, value);
  }
}
