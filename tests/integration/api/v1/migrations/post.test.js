import orchestrator from "../../orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("Running pending migrations", async () => {
        const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response1.status).toBe(403);

        const response1Body = await response1.json();

        expect(response1Body).toEqual({
          action: "Verifique se o usuário possui a feature: create:migration",
          message: "Você não possui permissão para realizar esta ação.",
          name: "ForbiddenError",
          status_code: 403,
        });
      });
    });
  });

  describe("Default user", () => {
    describe("Running pending migrations", () => {
      test("Running pending migrations", async () => {
        const createdUser = await orchestrator.createUser();
        const activateUser = await orchestrator.activateUser(createdUser);
        const sessionObject = await orchestrator.createSession(activateUser);

        const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(response1.status).toBe(403);

        const response1Body = await response1.json();

        expect(response1Body).toEqual({
          action: "Verifique se o usuário possui a feature: create:migration",
          message: "Você não possui permissão para realizar esta ação.",
          name: "ForbiddenError",
          status_code: 403,
        });
      });
    });
  });

  describe("Privileged user", () => {
    describe("Running pending migrations", () => {
      test("With `create:migration`", async () => {
        const createdUser = await orchestrator.createUser();
        const activateUser = await orchestrator.activateUser(createdUser);
        await orchestrator.addFeatureToUser(createdUser, ["create:migration"]);
        const sessionObject = await orchestrator.createSession(activateUser);
        const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
        });
        expect(response1.status).toBe(200);

        const response1Body = await response1.json();

        expect(Array.isArray(response1Body)).toBe(true);
      });
    });
  });
});
