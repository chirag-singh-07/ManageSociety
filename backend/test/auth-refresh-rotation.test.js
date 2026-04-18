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
describe('auth refresh rotation', () => {
    it('rotates refresh token and revokes old token', async () => {
        const app = (0, app_1.createApp)();
        const soc = await model_1.Society.create({ name: 'Soc' });
        const passwordHash = await bcryptjs_1.default.hash('Password@123', 10);
        await model_2.User.create({
            societyId: soc._id,
            role: 'user',
            status: 'active',
            name: 'User',
            email: 'u@example.com',
            passwordHash,
        });
        const loginRes = await (0, supertest_1.default)(app).post('/api/auth/login').send({
            email: 'u@example.com',
            password: 'Password@123',
        });
        expect(loginRes.status).toBe(200);
        const oldRefresh = loginRes.body.refreshToken;
        expect(oldRefresh).toBeTruthy();
        const refreshRes = await (0, supertest_1.default)(app).post('/api/auth/refresh').send({ refreshToken: oldRefresh });
        expect(refreshRes.status).toBe(200);
        const newRefresh = refreshRes.body.refreshToken;
        expect(newRefresh).toBeTruthy();
        expect(newRefresh).not.toEqual(oldRefresh);
        const refreshAgainOld = await (0, supertest_1.default)(app)
            .post('/api/auth/refresh')
            .send({ refreshToken: oldRefresh });
        expect(refreshAgainOld.status).toBe(401);
    });
});
