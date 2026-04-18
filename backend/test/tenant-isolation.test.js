"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../src/app");
const model_1 = require("../src/modules/society/model");
const model_2 = require("../src/modules/user/model");
const model_3 = require("../src/modules/notice/model");
const model_4 = require("../src/modules/complaint/model");
describe('tenant isolation', () => {
    it('prevents cross-society access for notices and complaints', async () => {
        const app = (0, app_1.createApp)();
        const [socA, socB] = await model_1.Society.create([{ name: 'A' }, { name: 'B' }]);
        const passwordHash = await bcryptjs_1.default.hash('Password@123', 10);
        await model_2.User.create({
            societyId: socA._id,
            role: 'user',
            status: 'active',
            name: 'User A',
            email: 'a@example.com',
            passwordHash,
        });
        const loginRes = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            email: 'a@example.com',
            password: 'Password@123',
        });
        expect(loginRes.status).toBe(200);
        const accessToken = loginRes.body.accessToken;
        expect(accessToken).toBeTruthy();
        const noticeB = await model_3.Notice.create({
            societyId: socB._id,
            title: 'Notice B',
            body: 'B body',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            publishedAt: new Date(),
            attachments: [],
            audience: 'all',
        });
        const complaintB = await model_4.Complaint.create({
            societyId: socB._id,
            title: 'Complaint B',
            description: 'B desc',
            category: 'general',
            priority: 'medium',
            status: 'open',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            attachments: [],
            timeline: [],
        });
        const noticeCross = await (0, supertest_1.default)(app)
            .get(`/api/notices/${noticeB._id}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(noticeCross.status).toBe(404);
        const complaintCross = await (0, supertest_1.default)(app)
            .get(`/api/complaints/${complaintB._id}`)
            .set('Authorization', `Bearer ${accessToken}`);
        expect(complaintCross.status).toBe(404);
    });
});
