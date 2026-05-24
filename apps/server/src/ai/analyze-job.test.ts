import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiGapService } from './ai-gap.service';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

// Mock the groq-sdk module completely
jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
  });
});

describe('AiGapService - analyzeJobJD', () => {
  let service: AiGapService;
  let prismaService: PrismaService;
  let groqChatCreateMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiGapService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('fake-key') },
        },
        {
          provide: PrismaService,
          useValue: {
            job: { findUnique: jest.fn() },
            skill: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<AiGapService>(AiGapService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Access the mocked create method from the groq instance inside the service
    groqChatCreateMock = (service as any).groq.chat.completions.create as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Case 1: Should analyze JD successfully and return proper valid JSON object', async () => {
    // 1. Mock DB Job
    (prismaService.job.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Frontend Engineer',
      company: 'Tech Corp',
      description: 'We need a React dev.',
      requirements: 'Experience with TS and React.',
      skills: ['React', 'TypeScript', 'Node.js'],
      roadmapPath: null,
    });

    // 2. Mock Groq API response
    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              seniority: 'Mid',
              must_have: ['React', 'TypeScript'],
              nice_to_have: ['Node.js'],
              experience_years: '2',
              ai_advice: 'Tập trung ôn luyện React hooks và TS types.',
            }),
          },
        },
      ],
    };
    groqChatCreateMock.mockResolvedValue(mockGroqResponse);

    // 3. Call method
    const result = await service.analyzeJobJD(1);

    // 4. Assertions
    expect(prismaService.job.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.any(Object),
    });
    
    expect(groqChatCreateMock).toHaveBeenCalled();
    expect(result).toEqual({
      seniority: 'Mid',
      must_have: ['React', 'TypeScript'],
      nice_to_have: ['Node.js'],
      experience_years: '2',
      ai_advice: 'Tập trung ôn luyện React hooks và TS types.',
    });
  });

  it('Case 2: Should return safe fallback when Groq API times out or JSON parsing fails', async () => {
    // 1. Mock DB Job
    const dbJob = {
      id: 2,
      title: 'Backend Engineer',
      company: 'Data Inc',
      description: 'Java dev needed.',
      requirements: 'Spring boot.',
      skills: ['Java', 'Spring'],
      roadmapPath: null,
    };
    (prismaService.job.findUnique as jest.Mock).mockResolvedValue(dbJob);

    // 2. Mock Groq API throwing error (Timeout/Network)
    groqChatCreateMock.mockRejectedValue(new Error('Groq timeout'));

    // 3. Call method
    const result = await service.analyzeJobJD(2);

    // 4. Assertions for Fallback
    expect(groqChatCreateMock).toHaveBeenCalled();
    expect(result).toEqual({
      seniority: 'Junior',
      must_have: ['Java', 'Spring'], // Falls back to taking first 5 skills
      nice_to_have: [],
      experience_years: 'N/A',
      ai_advice: 'Không thể phân tích JD lúc này. Vui lòng thử lại sau.',
    });
  });
});
