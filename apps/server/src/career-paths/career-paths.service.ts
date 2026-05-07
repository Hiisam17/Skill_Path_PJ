import { Injectable } from '@nestjs/common';
import { CareerPathDto } from '../types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * CareerPathsService quản lý các lộ trình sự nghiệp (Career Tracks).
 * Cung cấp các lựa chọn nghề nghiệp để người dùng chọn khi bắt đầu hành trình học tập.
 */
@Injectable()
export class CareerPathsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả các lộ trình sự nghiệp hiện có.
   * Danh sách bao gồm các ngành nghề như Backend Developer, Frontend Developer, v.v.
   * Đây là điểm bắt đầu để người dùng chọn lộ trình học tập phù hợp.
   *
   * @returns Mảng các đối tượng CareerPathDto được sắp xếp theo tên (A-Z).
   */
  async findAll(): Promise<CareerPathDto[]> {
    const careerPaths = await this.prisma.careerPath.findMany({
      orderBy: { name: 'asc' },
    });

    return careerPaths.map((careerPath) => ({
      id: String(careerPath.id),
      name: careerPath.name,
      description: careerPath.description ?? '',
    }));
  }
}
