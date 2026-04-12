import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createApp } from '../src/app';
import { Society } from '../src/modules/society/model';
import { User } from '../src/modules/user/model';
import { Notice } from '../src/modules/notice/model';
import { Complaint } from '../src/modules/complaint/model';

describe('tenant isolation', () => {
  it('prevents cross-society access for notices and complaints', async () => {
    const app = createApp();

    const [socA, socB] = await Society.create([{ name: 'A' }, { name: 'B' }]);

    const passwordHash = await bcrypt.hash('Password@123', 10);
    await User.create({
      societyId: socA._id,
      role: 'user',
      status: 'active',
      name: 'User A',
      email: 'a@example.com',
      passwordHash,
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'a@example.com',
      password: 'Password@123',
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken as string;
    expect(accessToken).toBeTruthy();

    const noticeB = await Notice.create({
      societyId: socB._id,
      title: 'Notice B',
      body: 'B body',
      createdBy: new mongoose.Types.ObjectId(),
      publishedAt: new Date(),
      attachments: [],
      audience: 'all',
    });

    const complaintB = await Complaint.create({
      societyId: socB._id,
      title: 'Complaint B',
      description: 'B desc',
      category: 'general',
      priority: 'medium',
      status: 'open',
      createdBy: new mongoose.Types.ObjectId(),
      attachments: [],
      timeline: [],
    });

    const noticeCross = await request(app)
      .get(`/api/notices/${noticeB._id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(noticeCross.status).toBe(404);

    const complaintCross = await request(app)
      .get(`/api/complaints/${complaintB._id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(complaintCross.status).toBe(404);
  });
});

