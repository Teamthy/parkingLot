import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: parseNumber(process.env.PORT, 3000),
  lotId: process.env.LOT_ID ?? "lot-1",
  floorCount: parseNumber(process.env.FLOOR_COUNT, 3),
  spotsMotorcycle: parseNumber(process.env.SPOTS_MOTORCYCLE, 5),
  spotsCompact: parseNumber(process.env.SPOTS_COMPACT, 30),
  spotsLarge: parseNumber(process.env.SPOTS_LARGE, 10),
  ratePerHour: parseNumber(process.env.RATE_PER_HOUR, 3),
};
