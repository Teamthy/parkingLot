import { Express } from "express";
import { createParkingController } from "../controllers/parkingController";
import { ParkingLotService } from "../services/parkingLotService";

export const registerParkingRoutes = (app: Express, service: ParkingLotService): void => {
  const controller = createParkingController(service);

  app.get("/api/lot", controller.getLot);
  app.get("/api/availability", controller.getAvailability);
  app.post("/api/park", controller.park);
  app.post("/api/exit", controller.exit);
  app.get("/api/tickets/:ticketId", controller.getTicket);
  app.get("/api/vehicles/:vehicleId", controller.getVehicle);
};
