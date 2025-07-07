import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async create(dto: CreateUserDto) {
    return this.userRepo.create(dto);
  }

  async findById(id: string) {
    return this.userRepo.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  async findByRole(role: UserRole) {
    return this.userRepo.findByRole(role);
  }

  async findByDepartment(department: string) {
    return this.userRepo.findByDepartment(department);
  }

  async findActiveUsers() {
    return this.userRepo.findActiveUsers();
  }

  async findAll() {
    return this.userRepo.findAll();
  }

  async update(id: string, dto: UpdateUserDto) {
    // Convert string IDs to ObjectId where needed
    const updateData: any = { ...dto };
    if (dto.subordinates) {
      updateData.subordinates = dto.subordinates;
    }
    return this.userRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.userRepo.delete(id);
  }
}
