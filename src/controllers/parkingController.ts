
import { Request, Response } from "express";
import { z } from "zod";
import { VehicleType } from "../models/domain";
import { ParkingLotService } from "../services/parkingLotService";

const vehicleTypeSchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .pipe(z.enum([VehicleType.Motorcycle, VehicleType.Compact, VehicleType.Large]));

const parkSchema = z.object({
  vehicleType: vehicleTypeSchema,
  plate: z.string().trim().min(1),
});

const exitSchema = z.object({
  ticketId: z.string().trim().min(1),
});

export const createParkingController = (service: ParkingLotService) => {
  return {
    getLot: (_req: Request, res: Response) => {
      const lot = service.getLot();
      res.json({
        id: lot.id,
        ratePerHour: lot.ratePerHour,
        floors: lot.floors.map((floor) => ({
          id: floor.id,
          level: floor.level,
          totalSpots: floor.spots.length,
        })),
      });
    },

    getAvailability: (_req: Request, res: Response) => {
      res.json({
        floors: service.getAvailability(),
      });
    },

    park: (req: Request, res: Response) => {
      const parsed = parkSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
        return;
      }

      const { vehicleType, plate } = parsed.data;

      const result = service.parkVehicle(vehicleType, plate);
      if (!result) {
        res.status(409).json({ error: "No available spot" });
        return;
      }

      res.status(201).json({
        ticketId: result.ticket.id,
        vehicleId: result.vehicle.id,
        spotId: result.spot.id,
        floorId: result.floor.id,
        entryTime: result.ticket.entryTime.toISOString(),
        status: result.ticket.status,
      });
    },

    exit: (req: Request, res: Response) => {
      const parsed = exitSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
        return;
      }

      const { ticketId } = parsed.data;

      const result = service.exitTicket(ticketId);
      if (!result) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      res.json({
        ticketId: result.ticket.id,
        amount: result.amount,
        status: result.ticket.status,
        exitTime: result.ticket.exitTime?.toISOString() ?? null,
        spotId: result.spot?.id ?? null,
        floorId: result.floor?.id ?? null,
      });
    },

    getTicket: (req: Request, res: Response) => {
      const ticket = service.getTicket(req.params.ticketId);
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      res.json({
        ticketId: ticket.id,
        vehicleId: ticket.vehicleId,
        spotId: ticket.spotId,
        entryTime: ticket.entryTime.toISOString(),
        exitTime: ticket.exitTime?.toISOString() ?? null,
        status: ticket.status,
      });
    },

    getVehicle: (req: Request, res: Response) => {
      const vehicle = service.getVehicle(req.params.vehicleId);
      if (!vehicle) {
        res.status(404).json({ error: "Vehicle not found" });
        return;
      }

      res.json({
        vehicleId: vehicle.id,
        type: vehicle.type,
        plate: vehicle.plate,
      });
    },
  };
};
