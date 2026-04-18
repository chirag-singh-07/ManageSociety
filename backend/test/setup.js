"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Default: use a real MongoDB (docker/local). In some Windows setups, spawning mongod for
// mongodb-memory-server is blocked (EPERM).
let mongod = null;
beforeAll(async () => {
    const fallbackUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/managesociety_test';
    if (process.env.MONGODB_MEMORY_SERVER === '1') {
        const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
        return;
    }
    mongod = null;
    try {
        await mongoose_1.default.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
    }
    catch (err) {
        throw new Error(`Cannot connect to MongoDB for tests at ${fallbackUri}. Start MongoDB locally (or set MONGODB_URI_TEST).\nOriginal error: ${String(err?.message ?? err)}`);
    }
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    if (mongod)
        await mongod.stop();
});
afterEach(async () => {
    if (!mongoose_1.default.connection.db)
        return;
    const collections = await mongoose_1.default.connection.db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});
