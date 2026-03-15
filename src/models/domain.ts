
export enum VehicleType {
  Motorcycle = "MOTORCYCLE",
  Compact = "COMPACT",
  Large = "LARGE",
}

export enum SpotType {
  Motorcycle = "MOTORCYCLE",
  Compact = "COMPACT",
  Large = "LARGE",
}

export enum TicketStatus {
  Active = "ACTIVE",
  Paid = "PAID",
  Closed = "CLOSED",
}

export class Vehicle {
  constructor(
    public readonly id: string,
    public readonly type: VehicleType,
    public readonly plate: string,
  ) {}
}

export class Spot {
  public currentVehicle: Vehicle | null = null;

  constructor(
    public readonly id: string,
    public readonly type: SpotType,
  ) {}

  isOccupied(): boolean {
    return this.currentVehicle !== null;
  }

  canFit(vehicle: Vehicle): boolean {
    if (this.isOccupied()) return false;

    if (vehicle.type === VehicleType.Motorcycle) return true;
    if (vehicle.type === VehicleType.Compact) {
      return this.type === SpotType.Compact || this.type === SpotType.Large;
    }
    return this.type === SpotType.Large;
  }

  occupy(vehicle: Vehicle): void {
    if (!this.canFit(vehicle)) {
      throw new Error("Spot cannot fit vehicle");
    }
    this.currentVehicle = vehicle;
  }

  release(): void {
    this.currentVehicle = null;
  }
}

export class Floor {
  constructor(
    public readonly id: string,
    public readonly level: number,
    public readonly spots: Spot[],
  ) {}

  findSpotFor(vehicle: Vehicle): Spot | null {
    return this.spots.find((spot) => spot.canFit(vehicle)) ?? null;
  }

  availableCountByType(): Record<SpotType, number> {
    return this.spots.reduce(
      (acc, spot) => {
        if (!spot.isOccupied()) acc[spot.type] += 1;
        return acc;
      },
      {
        [SpotType.Motorcycle]: 0,
        [SpotType.Compact]: 0,
        [SpotType.Large]: 0,
      } as Record<SpotType, number>,
    );
  }
}

export class Ticket {
  public exitTime: Date | null = null;
  public status: TicketStatus = TicketStatus.Active;

  constructor(
    public readonly id: string,
    public readonly vehicleId: string,
    public readonly spotId: string,
    public readonly entryTime: Date,
  ) {}

  markPaid(): void {
    if (this.status !== TicketStatus.Active) return;
    this.status = TicketStatus.Paid;
  }

  close(exitTime: Date): void {
    if (this.status === TicketStatus.Closed) return;
    this.exitTime = exitTime;
    this.status = TicketStatus.Closed;
  }
}

export class ParkingLot {
  constructor(
    public readonly id: string,
    public readonly floors: Floor[],
    public readonly ratePerHour: number,
  ) {}

  findSpotFor(vehicle: Vehicle): { floor: Floor; spot: Spot } | null {
    for (const floor of this.floors) {
      const spot = floor.findSpotFor(vehicle);
      if (spot) return { floor, spot };
    }
    return null;
  }

  park(vehicle: Vehicle, entryTime: Date = new Date()): Ticket | null {
    const match = this.findSpotFor(vehicle);
    if (!match) return null;

    match.spot.occupy(vehicle);
    return new Ticket(
      this.id + "-" + entryTime.getTime(),
      vehicle.id,
      match.spot.id,
      entryTime,
    );
  }

  calculateFee(ticket: Ticket, atTime: Date = new Date()): number {
    const end = ticket.exitTime ?? atTime;
    const durationMs = Math.max(0, end.getTime() - ticket.entryTime.getTime());
    const hours = Math.ceil(durationMs / (1000 * 60 * 60));
    return hours * this.ratePerHour;
  }

  exit(ticket: Ticket, atTime: Date = new Date()): void {
    ticket.markPaid();
    ticket.close(atTime);

    for (const floor of this.floors) {
      const spot = floor.spots.find((s) => s.id === ticket.spotId);
      if (spot) {
        spot.release();
        break;
      }
    }
  }
}
