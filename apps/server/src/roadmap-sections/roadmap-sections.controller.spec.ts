import { RoadmapSectionsController } from './roadmap-sections.controller';
import { RoadmapSectionsService } from './roadmap-sections.service';

describe('RoadmapSectionsController', () => {
  it('should return section detail from the service', async () => {
    const service = {
      getDetail: jest.fn().mockResolvedValue({
        title: 'Basics',
        content: 'Start here',
        resources: [],
      }),
    };
    const controller = new RoadmapSectionsController(
      service as unknown as RoadmapSectionsService,
    );

    await expect(controller.getDetail(1)).resolves.toEqual({
      title: 'Basics',
      content: 'Start here',
      resources: [],
    });
    expect(service.getDetail).toHaveBeenCalledWith(1);
  });
});
