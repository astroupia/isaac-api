import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  VehicleSchemaClass,
  VehicleDocument,
} from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { IncidentDocument } from '../../incident/entities/incident.entity';

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectModel('Vehicle')
    private readonly vehicleModel: Model<VehicleDocument>,
    @InjectModel('Incident')
    private readonly incidentModel: Model<IncidentDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ObjectId format: ${id}`);
      }
      return new Types.ObjectId(id);
    }
    return id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<VehicleDocument> {
    try {
      const vehicle = new this.vehicleModel({
        ...createVehicleDto,
        driver: createVehicleDto.driver
          ? convertToObjectId(createVehicleDto.driver)
          : undefined,
        passengers: this.convertArrayToObjectIds(createVehicleDto.passengers),
        incidentIds: this.convertArrayToObjectIds(createVehicleDto.incidentIds),
      });
      return await vehicle.save();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<VehicleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    const vehicle = await this.vehicleModel
      .findById(id)
      .populate('driver')
      .populate('passengers')
      .populate('incidentIds')
      .exec();
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async update(
    id: string,
    updateData: UpdateVehicleDto,
  ): Promise<VehicleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    try {
      const dataToUpdate: any = { ...updateData };
      if (updateData.driver) {
        dataToUpdate.driver = convertToObjectId(updateData.driver);
      }
      if (updateData.passengers) {
        dataToUpdate.passengers = convertArrayToObjectIds(
          updateData.passengers,
        );
      }
      if (updateData.incidentIds) {
        dataToUpdate.incidentIds = this.convertArrayToObjectIds(
          updateData.incidentIds,
        );
      }
      const vehicle = await this.vehicleModel
        .findByIdAndUpdate(id, dataToUpdate, { new: true })
        .populate('driver')
        .populate('passengers')
        .populate('incidentIds')
        .exec();
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${id} not found`);
      }
      return vehicle;
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<VehicleDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

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
      .populate('incidentIds')
      .exec();
  }

  async findByIds(ids: string[]): Promise<VehicleDocument[]> {
    const objectIds = ids.map((id) => convertToObjectId(id));
    return this.vehicleModel
      .find({ _id: { $in: objectIds } })
      .populate('driver')
      .populate('passengers')
      .populate('incidentIds')
      .exec();
  }

  async findByIncidentId(incidentId: string): Promise<VehicleDocument[]> {
    if (!Types.ObjectId.isValid(incidentId)) {
      throw new BadRequestException(`Invalid ObjectId format: ${incidentId}`);
    }

    const objectId = this.convertToObjectId(incidentId);

    // First, try to find vehicles that have this incident in their incidentIds
    const vehiclesFromVehicleSide = await this.vehicleModel
      .find({ incidentIds: objectId })
      .populate('driver')
      .populate('passengers')
      .populate('incidentIds')
      .exec();

    // If we found vehicles, return them
    if (vehiclesFromVehicleSide.length > 0) {
      return vehiclesFromVehicleSide;
    }

    // If no vehicles found from vehicle side, try to find the incident and get vehicleIds from there
    try {
      const incident = await this.incidentModel
        .findById(objectId)
        .populate('vehicleIds')
        .exec();

      if (incident && incident.vehicleIds && incident.vehicleIds.length > 0) {
        // Get the vehicle IDs from the incident
        const vehicleIds = incident.vehicleIds.map(
          (vehicle: any) => vehicle._id || vehicle,
        );

        // Find all vehicles with those IDs
        const vehiclesFromIncidentSide = await this.vehicleModel
          .find({ _id: { $in: vehicleIds } })
          .populate('driver')
          .populate('passengers')
          .populate('incidentIds')
          .exec();

        return vehiclesFromIncidentSide;
      }
    } catch (error: any) {
      // If incident model is not available or other error, just return empty array
      console.warn('Could not query incident model:', error.message);
    }

    // Return empty array if no vehicles found in either direction
    return [];
  }
}
