import orchestrator from "../../orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations");
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o usuário possui a feature: read:migration",
        message: "Você não possui permissão para realizar esta ação.",
        status_code: 403,
      });
    });
  });
  describe("Default  user", () => {
    test("Retrieving pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const activateUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activateUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o usuário possui a feature: read:migration",
        message: "Você não possui permissão para realizar esta ação.",
        status_code: 403,
      });
    });
  });
  describe("Privileged  user", () => {
    test("With `read:migration `", async () => {
      const createdUser = await orchestrator.createUser();
      const activateUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeatureToUser(createdUser, ["read:migration"]);
      const sessionObject = await orchestrator.createSession(activateUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
