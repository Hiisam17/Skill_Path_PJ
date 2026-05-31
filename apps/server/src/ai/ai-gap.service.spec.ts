import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiGapService } from './ai-gap.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('AiGapService', () => {
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
    const serviceWithGroq = service as unknown as {
      groq: { chat: { completions: { create: jest.Mock } } };
    };
    groqChatCreateMock = serviceWithGroq.groq.chat.completions.create;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze a saved job JD and return sanitized must-have and nice-to-have skills', async () => {
    (prismaService.job.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      title: 'Frontend Engineer',
      company: 'Tech Corp',
      description: 'We need a React dev.',
      requirements: 'Experience with TS and React.',
      skills: ['React', 'TypeScript', 'Node.js'],
      roadmapPath: null,
    });
    groqChatCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              seniority: 'Mid',
              must_have: ['React', 'TypeScript', 'HallucinatedSkill'],
              nice_to_have: ['Node.js'],
              experience_years: '2',
              ai_advice: 'Tập trung ôn luyện React hooks và TS types.',
            }),
          },
        },
      ],
    });

    const result = await service.analyzeJobJD(1);

    expect(result).toEqual({
      seniority: 'Mid',
      must_have: ['React', 'TypeScript'],
      nice_to_have: ['Node.js'],
      experience_years: '2',
      ai_advice: 'Tập trung ôn luyện React hooks và TS types.',
    });
    expect(groqChatCreateMock).toHaveBeenCalledTimes(1);
  });

  it('should return safe fallback when saved job JD analysis fails', async () => {
    (prismaService.job.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      title: 'Backend Engineer',
      company: 'Data Inc',
      description: 'Java dev needed.',
      requirements: 'Spring boot.',
      skills: ['Java', 'Spring'],
      roadmapPath: null,
    });
    groqChatCreateMock.mockRejectedValue(new Error('Groq timeout'));

    const result = await service.analyzeJobJD(2);

    expect(result).toEqual({
      seniority: 'Junior',
      must_have: ['Java', 'Spring'],
      nice_to_have: [],
      experience_years: 'N/A',
      ai_advice: 'Không thể phân tích JD lúc này. Vui lòng thử lại sau.',
    });
  });

  it('should extract required skills and filter hallucinated skill IDs against the Skill table', async () => {
    (prismaService.skill.findMany as jest.Mock).mockResolvedValue([
      { nodeId: 'react', name: 'React', description: 'UI library' },
      {
        nodeId: 'typescript',
        name: 'TypeScript',
        description: 'Typed JavaScript',
      },
      { nodeId: 'rest-api', name: 'REST API', description: 'HTTP API design' },
      { nodeId: 'git', name: 'Git', description: 'Version control' },
      {
        nodeId: 'javascript',
        name: 'JavaScript',
        description: 'Language fundamentals',
      },
    ]);
    groqChatCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              requiredSkillIds: [
                'react',
                'typescript',
                'rest-api',
                'git',
                'javascript',
                'hallucinated-skill',
              ],
              gapSkillIds: [
                'typescript',
                'rest-api',
                'git',
                'hallucinated-skill',
              ],
              matchScore: 40,
              summary:
                'Bạn đã có React và JavaScript, còn thiếu TypeScript, REST API và Git.',
            }),
          },
        },
      ],
    });

    const result = await service.analyzeGap(
      {
        title: 'React Developer',
        company: 'Product Co',
        description:
          'We are looking for React, TypeScript, REST API, Git, and modern JavaScript.',
        requirements: null,
      },
      [
        { nodeId: 'react', name: 'React', description: null },
        { nodeId: 'javascript', name: 'JavaScript', description: null },
      ],
    );

    expect(result).toEqual({
      requiredSkillIds: [
        'react',
        'typescript',
        'rest-api',
        'git',
        'javascript',
      ],
      gapSkillIds: ['typescript', 'rest-api', 'git'],
      matchScore: 40,
      summary:
        'Bạn đã có React và JavaScript, còn thiếu TypeScript, REST API và Git.',
    });
  });

  it('should parse arbitrary JD text and keep roadmapType from the AI response', async () => {
    (prismaService.skill.findMany as jest.Mock).mockResolvedValue([
      { nodeId: 'react', name: 'React', description: null },
      { nodeId: 'typescript', name: 'TypeScript', description: null },
      { nodeId: 'javascript', name: 'JavaScript', description: null },
    ]);
    groqChatCreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              requiredSkillIds: ['react', 'typescript', 'javascript'],
              gapSkillIds: ['typescript'],
              matchScore: 67,
              summary: 'JD phù hợp Frontend, cần bổ sung TypeScript.',
              roadmapType: 'frontend',
            }),
          },
        },
      ],
    });

    const result = await service.parseJd(
      'We are looking for a Frontend Developer with ReactJS, TS and modern JS.',
      [
        { nodeId: 'react', name: 'React', description: null },
        { nodeId: 'javascript', name: 'JavaScript', description: null },
      ],
    );

    expect(result).toEqual({
      requiredSkillIds: ['react', 'typescript', 'javascript'],
      gapSkillIds: ['typescript'],
      matchScore: 67,
      summary: 'JD phù hợp Frontend, cần bổ sung TypeScript.',
      roadmapType: 'frontend',
    });
  });
});
