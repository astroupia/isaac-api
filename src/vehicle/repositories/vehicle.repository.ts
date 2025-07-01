import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VehicleSchemaClass,
  VehicleDocument,
} from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectModel('Vehicle')
    private readonly vehicleModel: Model<VehicleDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<VehicleDocument> {
    const vehicle = new this.vehicleModel({
      ...createVehicleDto,
      driver: createVehicleDto.driver
        ? this.convertToObjectId(createVehicleDto.driver)
        : undefined,
      passengers: this.convertArrayToObjectIds(createVehicleDto.passengers),
    });
    return await vehicle.save();
  }

  async findById(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel
      .findById(id)
      .populate('driver')
      .populate('passengers')
      .exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async update(
    id: string,
    updateData: Partial<VehicleSchemaClass>,
  ): Promise<VehicleDocument> {
    const dataToUpdate = { ...updateData };
    if (updateData.driver) {
      dataToUpdate.driver = this.convertToObjectId(updateData.driver);
    }
    if (updateData.passengers) {
      dataToUpdate.passengers = this.convertArrayToObjectIds(
        updateData.passengers,
      );
    }
    const vehicle = await this.vehicleModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .populate('driver')
      .populate('passengers')
      .exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async delete(id: string): Promise<VehicleDocument> {
    const vehicle = await this.vehicleModel.findByIdAndDelete(id).exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async findAll(): Promise<VehicleDocument[]> {
    return this.vehicleModel
      .find()
      .populate('driver')
      .populate('passengers')
      .exec();
  }

  async findByIds(ids: string[]): Promise<VehicleDocument[]> {
    const objectIds = ids.map((id) => this.convertToObjectId(id));
    return this.vehicleModel
      .find({ _id: { $in: objectIds } })
      .populate('driver')
      .populate('passengers')
      .exec();
  }
}
