"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.create({
                data: Object.assign(Object.assign({}, data), { provePoints: 100 }),
                select: {
                    id: true,
                    username: true,
                    email: true,
                    provePoints: true,
                    resetToken: true,
                    resetTokenExpiry: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return user;
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    provePoints: true,
                    resetToken: true,
                    resetTokenExpiry: true,
                    createdAt: true,
                    updatedAt: true,
                    stakes: {
                        include: {
                            market: {
                                include: {
                                    article: true
                                }
                            }
                        }
                    }
                }
            });
            return user;
        });
    }
    getUserWithoutStakes(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    provePoints: true,
                    resetToken: true,
                    resetTokenExpiry: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return user;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.user.delete({
                where: { id }
            });
        });
    }
    updateProvePoints(id, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.prisma.user.update({
                where: { id },
                data: {
                    provePoints: {
                        increment: amount
                    }
                }
            });
        });
    }
    getUserStakeStats(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const stakes = yield this.prisma.stake.findMany({
                where: {
                    userId: id
                },
                include: {
                    market: true
                }
            });
            const totalStakes = stakes.length;
            const totalAmountStaked = stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);
            const winningStakes = stakes.filter((stake) => stake.prediction === stake.market.outcome).length;
            return {
                totalStakes,
                totalAmountStaked,
                winningStakes
            };
        });
    }
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.prisma.user.update({
                where: { id },
                data,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    provePoints: true,
                    resetToken: true,
                    resetTokenExpiry: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return user;
        });
    }
}
exports.UserService = UserService;
