import { UserService } from '../services/user.service.js';
import { getDataSource } from '../database/index.js';
import { User } from '../entities/user.js';
import { DataSource } from 'typeorm';

export class Composer {
  constructor(private readonly dataSource: DataSource) {}

  createUserService(): UserService {
    return new UserService(this.dataSource.getRepository(User));
  }
}

export async function createLiveComposer(): Promise<Composer> {
  const dataSource = await getDataSource();
  return new Composer(dataSource);
}
