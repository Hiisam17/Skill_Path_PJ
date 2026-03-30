import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;

  const mockPrisma = {
    userSkillProgress: {
      upsert: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    skill: { count: jest.fn() },
    roadmap: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('completeSkill', () => {
    it('should call upsert and return COMPLETED status', async () => {
      // Giả lập kết quả trả về từ DB
      const mockResult = { status: 'COMPLETED' };
      mockPrisma.userSkillProgress.upsert.mockResolvedValue(mockResult);

      const userId = 'user-1';
      const skillId = 1;

      // Gọi hàm cần test
      const result = await service.completeSkill(userId, skillId);

      // Kiểm tra xem Prisma có được gọi đúng tham số không
      expect(mockPrisma.userSkillProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_skillId: { userId, skillId } },
          update: expect.any(Object),
          create: expect.any(Object),
        }),
      );

      // Kiểm tra kết quả trả về
      expect(result).toEqual({ status: 'COMPLETED' });
    });
  });

  describe('getUserProgress', () => {
    it('should calculate correct percentage', async () => {
      // Giả lập: User đã hoàn thành 3 skills
      mockPrisma.userSkillProgress.count.mockResolvedValue(3);

      // Giả lập: Tìm thấy roadmap mà user đang học
      mockPrisma.userSkillProgress.findFirst.mockResolvedValue({
        skill: { roadmapId: 'roadmap-1' }
      });

      // Giả lập: Roadmap đó có tổng cộng 6 skills
      mockPrisma.skill.count.mockResolvedValue(6);

      const result = await service.getUserProgress('user-1');

      // 3 / 6 = 50% (0.5)
      expect(result).toEqual({
        completedSkills: 3,
        totalSkills: 6,
        percentage: 0.5,
      });
    });
  });
});
