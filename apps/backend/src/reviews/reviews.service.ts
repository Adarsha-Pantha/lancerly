import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    const { contractId, rating, comment } = dto;

    // 1. Fetch contract with necessary relations
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        reviews: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status !== 'COMPLETED') {
      throw new BadRequestException('Reviews can only be submitted for completed contracts');
    }

    // 2. Identify the reviewee
    let revieweeId: string;
    if (reviewerId === contract.clientId) {
      revieweeId = contract.freelancerId;
    } else if (reviewerId === contract.freelancerId) {
      revieweeId = contract.clientId;
    } else {
      throw new ForbiddenException('You are not a party to this contract');
    }

    // 3. Check if this reviewer has already reviewed this contract
    const existingReview = contract.reviews.find(r => r.reviewerId === reviewerId);
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this contract');
    }

    // 4. Create the review
    const review = await this.prisma.review.create({
      data: {
        contractId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      },
    });

    // 5. Update user rating and reviewCount (denormalization)
    const allReviews = await this.prisma.review.findMany({
      where: { revieweeId },
    });

    const reviewCount = allReviews.length;
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    await this.prisma.profile.update({
      where: { userId: revieweeId },
      data: {
        rating: averageRating,
        reviewCount: reviewCount,
      },
    });

    return review;
  }

  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
