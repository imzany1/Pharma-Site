/**
 * Prisma implementation of IUserRepository
 */

import { prisma } from "@/lib/prisma"
import type { IUserRepository } from "../interfaces"
import type { User, UserPublic, CreateUserData } from "../types"

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  async findByIdPublic(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true
      }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        isAdmin: data.isAdmin ?? false
      }
    })
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return user !== null
  }
}
