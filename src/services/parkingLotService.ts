
import { v4 as uuid } from "uuid";
import {
  Floor,
  ParkingLot,
  Spot,
  SpotType,
  Ticket,
  TicketStatus,
  Vehicle,
  VehicleType,
} from "../models/domain";

export type ParkResult = {
  ticket: Ticket;
  vehicle: Vehicle;
  floor: Floor;
  spot: Spot;
};

export type ExitResult = {
  ticket: Ticket;
  floor: Floor | null;
  spot: Spot | null;
  amount: number;
};

export class ParkingLotService {
  private readonly lot: ParkingLot;
  private readonly vehicles = new Map<string, Vehicle>();
  private readonly tickets = new Map<string, Ticket>();

  constructor(lot: ParkingLot) {
    this.lot = lot;
  }

  getLot(): ParkingLot {
    return this.lot;
  }

  getAvailability(): Array<{ floorId: string; level: number; availability: Record<SpotType, number> }> {
    return this.lot.floors.map((floor) => ({
      floorId: floor.id,
      level: floor.level,
      availability: floor.availableCountByType(),
    }));
  }

  createVehicle(type: VehicleType, plate: string): Vehicle {
    const vehicle = new Vehicle(uuid(), type, plate);
    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  getVehicle(vehicleId: string): Vehicle | null {
    return this.vehicles.get(vehicleId) ?? null;
  }

  getTicket(ticketId: string): Ticket | null {
    return this.tickets.get(ticketId) ?? null;
  }

  parkVehicle(type: VehicleType, plate: string, entryTime: Date = new Date()): ParkResult | null {
    const vehicle = this.createVehicle(type, plate);
    const match = this.lot.findSpotFor(vehicle);

    if (!match) return null;

    match.spot.occupy(vehicle);
    const ticket = new Ticket(uuid(), vehicle.id, match.spot.id, entryTime);
    this.tickets.set(ticket.id, ticket);

    return { ticket, vehicle, floor: match.floor, spot: match.spot };
  }

  exitTicket(ticketId: string, atTime: Date = new Date()): ExitResult | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    if (ticket.status !== TicketStatus.Closed) {
      ticket.markPaid();
      ticket.close(atTime);
    }
    const { floor, spot } = this.findSpotById(ticket.spotId);
    if (spot) spot.release();

    const amount = this.lot.calculateFee(ticket, atTime);

    return { ticket, floor, spot, amount };
  }

  private findSpotById(spotId: string): { floor: Floor | null; spot: Spot | null } {
    for (const floor of this.lot.floors) {
      const spot = floor.spots.find((candidate) => candidate.id === spotId) ?? null;
      if (spot) return { floor, spot };
    }
    return { floor: null, spot: null };
  }
}
