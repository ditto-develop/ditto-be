import { UpdateMyProfileUseCase } from '@module/profile/application/usecases/update-my-profile.usecase';
import { UserProfile } from '@module/profile/domain/entities/user-profile.entity';
import { User, Gender } from '@module/user/domain/entities/user.entity';
import { Role, RoleCode } from '@module/role/domain/entities/role.entity';
import { BusinessRuleException, EntityNotFoundException } from '@common/exceptions/domain.exception';

describe('UpdateMyProfileUseCase', () => {
    let useCase: UpdateMyProfileUseCase;
    let mockProfileRepo: any;
    let mockUserRepo: any;
    let mockLogger: any;

    const mockRole = new Role(1, 'User', RoleCode.USER, new Date(), new Date());

    const activeUser = User.create(
        'user-1', 'Test', 'tester', '010-0000-0000', null,
        null, null, Gender.MALE, 25, null,
        new Date(), 1, mockRole,
    );

    const inactiveUser = User.create(
        'user-2', 'Left', 'leftuser', '010-1111-1111', null,
        null, null, Gender.FEMALE, 30, null,
        new Date(), 1, mockRole, [], new Date(), // leftAt set
    );

    beforeEach(() => {
        mockProfileRepo = {
            findByUserId: jest.fn(),
            upsert: jest.fn(),
        };
        mockUserRepo = {
            findById: jest.fn(),
        };
        mockLogger = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        useCase = new UpdateMyProfileUseCase(mockProfileRepo, mockUserRepo, mockLogger);
    });

    it('should update introduction successfully', async () => {
        mockUserRepo.findById.mockResolvedValue(activeUser);
        mockProfileRepo.findByUserId.mockResolvedValue(null);
        const updatedProfile = UserProfile.create('p-1', 'user-1', '새로운 자기소개', null, null);
        mockProfileRepo.upsert.mockResolvedValue(updatedProfile);

        const result = await useCase.execute('user-1', { introduction: '새로운 자기소개' });

        expect(result.introduction).toBe('새로운 자기소개');
        expect(mockProfileRepo.upsert).toHaveBeenCalledWith('user-1', expect.objectContaining({
            introduction: '새로운 자기소개',
        }));
    });

    it('should update age preferences successfully', async () => {
        mockUserRepo.findById.mockResolvedValue(activeUser);
        mockProfileRepo.findByUserId.mockResolvedValue(null);
        const updatedProfile = UserProfile.create('p-1', 'user-1', null, 20, 30);
        mockProfileRepo.upsert.mockResolvedValue(updatedProfile);

        const result = await useCase.execute('user-1', { preferredMinAge: 20, preferredMaxAge: 30 });

        expect(result.preferredMinAge).toBe(20);
        expect(result.preferredMaxAge).toBe(30);
    });

    it('should throw when minAge > maxAge', async () => {
        mockUserRepo.findById.mockResolvedValue(activeUser);
        mockProfileRepo.findByUserId.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { preferredMinAge: 35, preferredMaxAge: 20 }),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should throw when user not found', async () => {
        mockUserRepo.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('nonexistent', { introduction: 'hi' }),
        ).rejects.toThrow(EntityNotFoundException);
    });

    it('should throw when user is inactive (탈퇴)', async () => {
        mockUserRepo.findById.mockResolvedValue(inactiveUser);

        await expect(
            useCase.execute('user-2', { introduction: 'hi' }),
        ).rejects.toThrow(BusinessRuleException);
    });

    it('should validate cross-field minAge > existing maxAge', async () => {
        mockUserRepo.findById.mockResolvedValue(activeUser);
        const existingProfile = UserProfile.create('p-1', 'user-1', null, 20, 25);
        mockProfileRepo.findByUserId.mockResolvedValue(existingProfile);

        // Only updating minAge to 30 while existing maxAge is 25 -> should fail
        await expect(
            useCase.execute('user-1', { preferredMinAge: 30 }),
        ).rejects.toThrow(BusinessRuleException);
    });
});
