import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserSchemaClass,
  UserDocument,
  UserRole,
} from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel({
      ...createUserDto,
      subordinates: this.convertArrayToObjectIds(createUserDto.subordinates),
    });
    return await user.save();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .populate('subordinates')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel
      .find({ role, isActive: true })
      .populate('subordinates')
      .exec();
  }

  async findByDepartment(department: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ department, isActive: true })
      .populate('subordinates')
      .exec();
  }

  async findActiveUsers(): Promise<UserDocument[]> {
    return this.userModel
      .find({ isActive: true })
      .populate('subordinates')
      .exec();
  }

  async update(
    id: string,
    updateData: Partial<UserSchemaClass>,
  ): Promise<UserDocument> {
    const dataToUpdate = { ...updateData };
    if (updateData.subordinates) {
      dataToUpdate.subordinates = this.convertArrayToObjectIds(
        updateData.subordinates,
      );
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .populate('subordinates')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async delete(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('subordinates').exec();
  }
}
