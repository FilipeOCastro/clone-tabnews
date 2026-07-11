import orchestrator from "tests/integration/api/orchestrator.js";
import activation from "models/activation.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration flow (all successful)", () => {
  let createdUserResponseBody;
  let extractToken;

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

    createdUserResponseBody = await response1.json();

    expect(createdUserResponseBody).toEqual({
      id: createdUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registrationflow@gmail.com",
      password: createdUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createdUserResponseBody.created_at,
      updated_at: createdUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    extractToken = orchestrator.extractUUID(lastEmail.text);

    expect(lastEmail.sender).toBe("<contato@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<registrationflow@gmail.com>");
    expect(lastEmail.subject).toBe("Ative seu cadastro.");
    expect(lastEmail.subject).toBe("Ative seu cadastro.");
    expect(lastEmail.text).toContain(extractToken);

    const activeToken = await activation.findOneByToken(extractToken);

    expect(activeToken).not.toBeNull();
    expect(activeToken.user_id).toBe(createdUserResponseBody.id);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${extractToken}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);
    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {});

  test("Get user information", async () => {});
});
