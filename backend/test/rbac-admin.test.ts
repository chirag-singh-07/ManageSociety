import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { Society } from '../src/modules/society/model';
import { User } from '../src/modules/user/model';

describe('RBAC admin', () => {
  it('blocks user role from admin routes and allows admin role', async () => {
    const app = createApp();
    const soc = await Society.create({ name: 'S' });
    const passwordHash = await bcrypt.hash('Password@123', 10);
    await User.create({
      societyId: soc._id,
      role: 'user',
      status: 'active',
      name: 'Resident',
      email: 'resident@example.com',
      passwordHash,
    });
    await User.create({
      societyId: soc._id,
      role: 'admin',
      status: 'active',
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash,
    });

    const residentLogin = await request(app).post('/api/auth/login').send({
      email: 'resident@example.com',
      password: 'Password@123',
    });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'Password@123',
    });
    expect(residentLogin.status).toBe(200);
    expect(adminLogin.status).toBe(200);

    const residentDash = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${residentLogin.body.accessToken}`);
    expect(residentDash.status).toBe(403);

    const adminDash = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`);
    expect(adminDash.status).toBe(200);
  });
});

