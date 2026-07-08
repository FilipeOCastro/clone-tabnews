import orchestrator from "tests/integration/api/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  test("Create user account", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "registrationflow@gmail.com",
        password: "senha123",
      }),
    });

    expect(response1.status).toBe(201);

    const responseBody = await response1.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "RegistrationFlow",
      email: "registrationflow@gmail.com",
      password: responseBody.password,
      features: ["read:activation_token"],
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {});

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
