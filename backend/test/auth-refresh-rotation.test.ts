import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { Society } from '../src/modules/society/model';
import { User } from '../src/modules/user/model';

describe('auth refresh rotation', () => {
  it('rotates refresh token and revokes old token', async () => {
    const app = createApp();
    const soc = await Society.create({ name: 'Soc' });
    const passwordHash = await bcrypt.hash('Password@123', 10);
    await User.create({
      societyId: soc._id,
      role: 'user',
      status: 'active',
      name: 'User',
      email: 'u@example.com',
      passwordHash,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'u@example.com',
      password: 'Password@123',
    });
    expect(loginRes.status).toBe(200);
    const oldRefresh = loginRes.body.refreshToken as string;
    expect(oldRefresh).toBeTruthy();

    const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken: oldRefresh });
    expect(refreshRes.status).toBe(200);
    const newRefresh = refreshRes.body.refreshToken as string;
    expect(newRefresh).toBeTruthy();
    expect(newRefresh).not.toEqual(oldRefresh);

    const refreshAgainOld = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefresh });
    expect(refreshAgainOld.status).toBe(401);
  });
});

