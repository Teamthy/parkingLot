
import express from "express";
import { registerParkingRoutes } from "./routes/parkingRoutes";
import { buildParkingLotFromEnv } from "./services/parkingLotFactory";
import { ParkingLotService } from "./services/parkingLotService";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const lot = buildParkingLotFromEnv();
  const parkingService = new ParkingLotService(lot);

  registerParkingRoutes(app, parkingService);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: err.message ?? "Unexpected error" });
  });

  return app;
};
