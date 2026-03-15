
import { env } from "../config/env";
import { Floor, ParkingLot, Spot, SpotType } from "../models/domain";

const createSpots = (floorId: string, type: SpotType, count: number, startIndex: number): Spot[] => {
  const spots: Spot[] = [];
  for (let i = 0; i < count; i += 1) {
    spots.push(new Spot(`${floorId}-${type}-${startIndex + i + 1}`, type));
  }
  return spots;
};

export const buildParkingLotFromEnv = (): ParkingLot => {
  const floors: Floor[] = [];

  for (let level = 1; level <= env.floorCount; level += 1) {
    const floorId = `F${level}`;
    const spots: Spot[] = [];

    spots.push(...createSpots(floorId, SpotType.Motorcycle, env.spotsMotorcycle, spots.length));
    spots.push(...createSpots(floorId, SpotType.Compact, env.spotsCompact, spots.length));
    spots.push(...createSpots(floorId, SpotType.Large, env.spotsLarge, spots.length));

    floors.push(new Floor(floorId, level, spots));
  }

  return new ParkingLot(env.lotId, floors, env.ratePerHour);
};
