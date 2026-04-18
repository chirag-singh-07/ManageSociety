"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = require("../src/app");
const model_1 = require("../src/modules/society/model");
const model_2 = require("../src/modules/user/model");
describe('RBAC admin', () => {
    it('blocks user role from admin routes and allows admin role', async () => {
        const app = (0, app_1.createApp)();
        const soc = await model_1.Society.create({ name: 'S' });
        const passwordHash = await bcryptjs_1.default.hash('Password@123', 10);
        await model_2.User.create({
            societyId: soc._id,
            role: 'user',
            status: 'active',
            name: 'Resident',
            email: 'resident@example.com',
            passwordHash,
        });
        await model_2.User.create({
            societyId: soc._id,
            role: 'admin',
            status: 'active',
            name: 'Admin',
            email: 'admin@example.com',
            passwordHash,
        });
        const residentLogin = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            email: 'resident@example.com',
            password: 'Password@123',
        });
        const adminLogin = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            email: 'admin@example.com',
            password: 'Password@123',
        });
        expect(residentLogin.status).toBe(200);
        expect(adminLogin.status).toBe(200);
        const residentDash = await (0, supertest_1.default)(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${residentLogin.body.accessToken}`);
        expect(residentDash.status).toBe(403);
        const adminDash = await (0, supertest_1.default)(app)
            .get('/api/admin/dashboard')
            .set('Authorization', `Bearer ${adminLogin.body.accessToken}`);
        expect(adminDash.status).toBe(200);
    });
});
