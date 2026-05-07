import { Injectable, NotFoundException } from '@nestjs/common';
import { RoadmapDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * RoadmapsService quản lý các lộ trình học tập ở các mức độ khác nhau.
 * Mỗi lộ trình chứa một chuỗi các kỹ năng được biên soạn cho một định hướng nghề nghiệp cụ thể.
 */
@Injectable()
export class RoadmapsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Chuyển đổi tên lộ trình thành cấp độ số tương ứng.
   * Cấp độ 1: Cơ bản, 2: Trung cấp, 3: Nâng cao.
   */
  private toLevel(title: string): string {
    const normalized = title.toLowerCase();
    if (normalized.includes('advanced')) return '3';
    if (normalized.includes('intermediate')) return '2';
    return '1';
  }

  /**
   * Chuyển đổi dữ liệu từ Database sang định dạng DTO gửi cho Frontend.
   */
  private toDto(roadmap: { id: number; careerPathId: number | null; title: string }): RoadmapDto {
    return {
      id: String(roadmap.id),
      careerPathId: roadmap.careerPathId === null ? '' : String(roadmap.careerPathId),
      level: this.toLevel(roadmap.title),
    };
  }

  /**
   * Lấy danh sách tất cả các lộ trình có trong hệ thống.
   */
  async findAll(): Promise<RoadmapDto[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      orderBy: [{ careerPathId: 'asc' }, { id: 'asc' }],
    });

    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  /**
   * Tìm một lộ trình học tập dựa trên ID duy nhất.
   * Trả về thông tin cơ bản của lộ trình bao gồm các kỹ năng liên quan và định hướng nghề nghiệp.
   *
   * @param roadmapId - ID của lộ trình cần tìm (dạng chuỗi số).
   * @returns RoadmapDto chứa thông tin của lộ trình.
   * @throws NotFoundException nếu không tìm thấy ID tương ứng.
   */
  async findById(roadmapId: string): Promise<RoadmapDto> {
    const roadmapIdNumber = Number(roadmapId);
    if (!Number.isInteger(roadmapIdNumber) || roadmapIdNumber <= 0) {
      throw new NotFoundException(`Lộ trình ${roadmapId} không tồn tại`);
    }

    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapIdNumber },
    });

    if (!roadmap) {
      throw new NotFoundException(`Lộ trình ${roadmapId} không tồn tại`);
    }

    return this.toDto(roadmap);
  }

  /**
   * Tìm tất cả các lộ trình cho một định hướng nghề nghiệp cụ thể (Career Path).
   * Thường trả về danh sách các cấp độ khác nhau (Cơ bản, Trung cấp, Nâng cao).
   *
   * @param careerPathId - ID của định hướng nghề nghiệp.
   * @returns Mảng các đối tượng RoadmapDto thuộc định hướng này.
   */
  async findByCareerPath(careerPathId: string): Promise<RoadmapDto[]> {
    const careerPathIdNumber = Number(careerPathId);
    if (!Number.isInteger(careerPathIdNumber) || careerPathIdNumber <= 0) {
      return [];
    }

    const roadmaps = await this.prisma.roadmap.findMany({
      where: { careerPathId: careerPathIdNumber },
      orderBy: { id: 'asc' },
    });

    return roadmaps.map((roadmap) => this.toDto(roadmap));
  }

  /**
   * Lấy danh sách tất cả các ngành nghề/định hướng (id và tên) cho trang danh sách công khai.
   */
  async findAllCareerPaths(): Promise<{ id: number; name: string }[]> {
    const careerPaths = await this.prisma.careerPath.findMany({ select: { id: true, name: true } });
    return careerPaths.map((c) => ({ id: c.id, name: c.name }));
  }

  /**
   * Lấy các lộ trình do hệ thống cung cấp (System Roadmaps) cho một định hướng nghề nghiệp.
   * Lộ trình hệ thống được xác định bởi `userId == null` và `isPublished == true`.
   */
  async getSystemRoadmapsByCareerPath(careerPathId: number): Promise<{ id: number; title: string; description: string | null }[]> {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: {
        careerPathId: careerPathId,
        userId: null,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      orderBy: { id: 'asc' },
    });

    if (!roadmaps || roadmaps.length === 0) {
      throw new NotFoundException('Không tìm thấy lộ trình hệ thống nào cho ngành nghề này');
    }

    return roadmaps.map((r) => ({ id: r.id, title: r.title, description: r.description }));
  }
}
