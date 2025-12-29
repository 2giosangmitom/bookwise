import StaffLocationService from '@/modules/staff/location/services';
import { Prisma } from '@/generated/prisma/client';
import { buildMockFastify } from '../../../helpers/mockFastify';

describe('StaffLocationService', async () => {
  const app = await buildMockFastify();
  const staffLocationService = new StaffLocationService({ prisma: app.prisma });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor injection', () => {
    it('should create an instance with injected prisma', () => {
      const service = new StaffLocationService({ prisma: app.prisma });
      expect(service).toBeInstanceOf(StaffLocationService);
    });
  });

  describe('addLocation', () => {
    it.each([
      { room: 'B', floor: 1, shelf: 2, row: 3, expected: 'B-1-2-3' },
      { room: 'C', floor: 0, shelf: 0, row: 0, expected: 'C-0-0-0' },
      { room: 'D', floor: 5, shelf: 10, row: 15, expected: 'D-5-10-15' }
    ])(
      'calculate location id correctly for { room: $room, floor: $floor, shelf: $shelf, row: $row }',
      async ({ room, floor, shelf, row, expected }) => {
        await staffLocationService.addLocation({
          room,
          floor,
          shelf,
          row
        });

        expect(app.prisma.location.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              location_id: expected,
              room,
              floor,
              shelf,
              row
            }
          })
        );
      }
    );

    it('should throw conflict error when location with same ID exists', async () => {
      vi.mocked(app.prisma.location.create).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Error creating location', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        staffLocationService.addLocation({
          room: 'A',
          floor: 1,
          shelf: 2,
          row: 3
        })
      ).rejects.toThrowError('Location with the same ID already exists.');
    });

    it('should rethrow unknown errors', async () => {
      vi.mocked(app.prisma.location.create).mockRejectedValueOnce(new Error('Unknown error'));

      await expect(
        staffLocationService.addLocation({
          room: 'A',
          floor: 1,
          shelf: 2,
          row: 3
        })
      ).rejects.toThrowError('Unknown error');
    });
  });

  describe('deleteLocation', () => {
    it('should call prisma.location.delete with correct location_id', async () => {
      const locationId = 'A-1-2-3';

      await staffLocationService.deleteLocation(locationId);

      expect(app.prisma.location.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            location_id: locationId
          }
        })
      );
    });

    it('should return the deleted location', async () => {
      const locationId = 'A-1-2-3';
      const deletedLocation = {
        location_id: locationId,
        room: 'A',
        floor: 1,
        shelf: 2,
        row: 3
      } as unknown as Awaited<ReturnType<typeof app.prisma.location.delete>>;

      vi.mocked(app.prisma.location.delete).mockResolvedValueOnce(deletedLocation);

      const result = await staffLocationService.deleteLocation(locationId);

      expect(result).toEqual(deletedLocation);
    });

    it("should throw 404 error if location doesn't exist", async () => {
      const locationId = 'NON-EXISTING';

      vi.mocked(app.prisma.location.delete).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(staffLocationService.deleteLocation(locationId)).rejects.toThrowErrorMatchingInlineSnapshot(
        `[NotFoundError: Location with the given ID does not exist.]`
      );
    });

    it('should rethrow other errors from prisma', async () => {
      const locationId = 'A-1-2-3';

      vi.mocked(app.prisma.location.delete).mockRejectedValueOnce(new Error('Some other error'));

      await expect(staffLocationService.deleteLocation(locationId)).rejects.toThrowError('Some other error');
    });
  });

  describe('updateLocation', () => {
    it('should call prisma.location.update with correct location_id and data', async () => {
      const locationId = 'A-1-2-3';
      const updateData = { room: 'B', floor: 2, shelf: 3, row: 4 };

      await staffLocationService.updateLocation(locationId, updateData);

      expect(app.prisma.location.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { location_id: locationId },
          data: {
            location_id: 'B-2-3-4',
            room: 'B',
            floor: 2,
            shelf: 3,
            row: 4
          }
        })
      );
    });

    it('should return the updated location', async () => {
      const locationId = 'A-1-2-3';
      const updateData = { room: 'B', floor: 2, shelf: 3, row: 4 };
      const updatedLocation = {
        location_id: 'B-2-3-4',
        room: 'B',
        floor: 2,
        shelf: 3,
        row: 4,
        created_at: new Date(),
        updated_at: new Date()
      } as unknown as Awaited<ReturnType<typeof app.prisma.location.update>>;

      vi.mocked(app.prisma.location.update).mockResolvedValueOnce(updatedLocation);

      const result = await staffLocationService.updateLocation(locationId, updateData);

      expect(result).toEqual(updatedLocation);
    });

    it('should throw 404 error if location to update does not exist', async () => {
      const locationId = 'NON-EXISTING';
      const updateData = { room: 'B', floor: 2, shelf: 3, row: 4 };

      vi.mocked(app.prisma.location.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        staffLocationService.updateLocation(locationId, updateData)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[NotFoundError: Location with the given ID does not exist.]`);
    });

    it('should throw 409 error if new location_id conflicts with existing location', async () => {
      const locationId = 'A-1-2-3';
      const updateData = { room: 'B', floor: 2, shelf: 3, row: 4 };

      vi.mocked(app.prisma.location.update).mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: Prisma.prismaVersion.client
        })
      );

      await expect(
        staffLocationService.updateLocation(locationId, updateData)
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[ConflictError: Location with the same ID already exists.]`);
    });

    it('should rethrow other errors from prisma', async () => {
      const locationId = 'A-1-2-3';
      const updateData = { room: 'B', floor: 2, shelf: 3, row: 4 };

      vi.mocked(app.prisma.location.update).mockRejectedValueOnce(new Error('Some other error'));

      await expect(staffLocationService.updateLocation(locationId, updateData)).rejects.toThrowError(
        'Some other error'
      );
    });
  });

  describe('getLocations', () => {
    it('should call prisma.location.findMany with correct pagination parameters', async () => {
      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: undefined, row: undefined };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: {}
        })
      );
    });

    it('should apply room filter correctly', async () => {
      const query = { page: 1, limit: 10, room: 'Archive', floor: undefined, shelf: undefined, row: undefined };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { room: { contains: 'Archive', mode: 'insensitive' } }
        })
      );
    });

    it('should apply floor filter correctly', async () => {
      const query = { page: 1, limit: 10, room: undefined, floor: 2, shelf: undefined, row: undefined };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { floor: 2 }
        })
      );
    });

    it('should apply shelf filter correctly', async () => {
      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: 5, row: undefined };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { shelf: 5 }
        })
      );
    });

    it('should apply row filter correctly', async () => {
      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: undefined, row: 3 };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { row: 3 }
        })
      );
    });

    it('should combine multiple filters', async () => {
      const query = { page: 2, limit: 20, room: 'Main Hall', floor: 1, shelf: 5, row: 2 };

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
          where: {
            room: { contains: 'Main Hall', mode: 'insensitive' },
            floor: 1,
            shelf: 5,
            row: 2
          }
        })
      );
    });

    it('should fetch locations and count', async () => {
      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: undefined, row: undefined };

      vi.mocked(app.prisma.location.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.location.count).mockResolvedValueOnce(0);

      await staffLocationService.getLocations(query);

      expect(app.prisma.location.findMany).toHaveBeenCalled();
      expect(app.prisma.location.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should return locations and total count', async () => {
      const mockLocations = [
        {
          location_id: 'A-1-2-3',
          room: 'Main Hall',
          floor: 1,
          shelf: 2,
          row: 3,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      vi.mocked(app.prisma.location.findMany).mockResolvedValueOnce(mockLocations);
      vi.mocked(app.prisma.location.count).mockResolvedValueOnce(1);

      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: undefined, row: undefined };
      const result = await staffLocationService.getLocations(query);

      expect(result).toEqual({
        locations: mockLocations,
        total: 1
      });
    });

    it('should handle empty results', async () => {
      vi.mocked(app.prisma.location.findMany).mockResolvedValueOnce([]);
      vi.mocked(app.prisma.location.count).mockResolvedValueOnce(0);

      const query = { page: 1, limit: 10, room: undefined, floor: undefined, shelf: undefined, row: undefined };
      const result = await staffLocationService.getLocations(query);

      expect(result).toEqual({
        locations: [],
        total: 0
      });
    });
  });
});
