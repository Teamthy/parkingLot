
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  process.env.LOT_ID = "test-lot";
  process.env.FLOOR_COUNT = "1";
  process.env.SPOTS_MOTORCYCLE = "0";
  process.env.SPOTS_COMPACT = "1";
  process.env.SPOTS_LARGE = "0";
  process.env.RATE_PER_HOUR = "3";

  const { createApp } = await import("../src/app");
  app = createApp();
});

describe("parking lot api", () => {
  it("returns health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("validates park request", async () => {
    const res = await request(app).post("/api/park").send({});
    expect(res.status).toBe(400);
  });

  it("parks, fetches ticket, and exits", async () => {
    const parkRes = await request(app)
      .post("/api/park")
      .send({ vehicleType: "compact", plate: "ABC-123" });

    expect(parkRes.status).toBe(201);
    expect(parkRes.body.ticketId).toBeTruthy();

    const ticketId = parkRes.body.ticketId as string;

    const ticketRes = await request(app).get(`/api/tickets/${ticketId}`);
    expect(ticketRes.status).toBe(200);
    expect(ticketRes.body.status).toBe("ACTIVE");

    const exitRes = await request(app).post("/api/exit").send({ ticketId });
    expect(exitRes.status).toBe(200);
    expect(exitRes.body.status).toBe("CLOSED");
    expect(exitRes.body.amount).toBe(3);
  });
});
