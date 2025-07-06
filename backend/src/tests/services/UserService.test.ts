import { UserService } from '../../services/UserService';

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  stake: {
    findMany: jest.fn(),
  },
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockPrisma as any);
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      provePoints: 100,
    });

    const user = await userService.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed',
    });

    expect(user).toHaveProperty('username', 'testuser');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should get a user by id', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      provePoints: 100,
    });

    const user = await userService.getUser(1);
    expect(user).toHaveProperty('id', 1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: expect.anything() });
  });
});
