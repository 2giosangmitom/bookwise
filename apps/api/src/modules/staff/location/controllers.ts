import { AddLocationSchema, DeleteLocationSchema, UpdateLocationSchema, GetLocationsSchema } from './schemas';
import type StaffLocationService from './services';

export default class StaffLocationController {
  private staffLocationService: StaffLocationService;

  public constructor({ staffLocationService }: { staffLocationService: StaffLocationService }) {
    this.staffLocationService = staffLocationService;
  }

  public async addLocation(
    req: FastifyRequestTypeBox<typeof AddLocationSchema>,
    res: FastifyReplyTypeBox<typeof AddLocationSchema>
  ) {
    const addedLocation = await this.staffLocationService.addLocation(req.body);

    return res.status(201).send({
      ...addedLocation,
      created_at: addedLocation.created_at.toISOString(),
      updated_at: addedLocation.updated_at.toISOString()
    });
  }

  public async deleteLocation(
    req: FastifyRequestTypeBox<typeof DeleteLocationSchema>,
    res: FastifyReplyTypeBox<typeof DeleteLocationSchema>
  ) {
    const { location_id } = req.params;

    const deletedLocation = await this.staffLocationService.deleteLocation(location_id);

    return res.status(200).send({
      message: 'Location deleted successfully',
      data: deletedLocation
    });
  }

  public async updateLocation(
    req: FastifyRequestTypeBox<typeof UpdateLocationSchema>,
    res: FastifyReplyTypeBox<typeof UpdateLocationSchema>
  ) {
    const { location_id } = req.params;
    const { room, floor, shelf, row } = req.body;

    const updatedLocation = await this.staffLocationService.updateLocation(location_id, {
      room,
      floor,
      shelf,
      row
    });

    return res.status(200).send({
      message: 'Location updated successfully',
      data: {
        ...updatedLocation,
        created_at: updatedLocation.created_at.toISOString(),
        updated_at: updatedLocation.updated_at.toISOString()
      }
    });
  }

  public async getLocations(
    req: FastifyRequestTypeBox<typeof GetLocationsSchema>,
    reply: FastifyReplyTypeBox<typeof GetLocationsSchema>
  ) {
    const { locations, total } = await this.staffLocationService.getLocations({
      ...req.query,
      page: req.query.page ?? 1,
      limit: req.query.limit ?? 100
    });
    const totalPages = Math.ceil(total / (req.query.limit ?? 100));

    return reply.status(200).send({
      message: 'Locations retrieved successfully',
      meta: {
        totalPages
      },
      data: locations.map((location) => ({
        ...location,
        created_at: location.created_at.toISOString(),
        updated_at: location.updated_at.toISOString()
      }))
    });
  }
}
