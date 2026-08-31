import { version as uuidVersion } from "uuid";
import orchestrator from "../../../orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";
import { faker } from "@faker-js/faker";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With uique'username'", async () => {
      const createdUser = await orchestrator.createUser({});
      const newUsername = faker.internet.username().replace(/[_.-]/g, "");
      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );

      expect(response2.status).toBe(403);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        action: "Verifique se o usuário possui a feature: update:user",
        message: "Você não possui permissão para realizar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
  describe("Privileged user", () => {
    test("With update:user:others targeting Default user", async () => {
      const privilegedUser = await orchestrator.createUser();
      const activatedprivilegedUser =
        await orchestrator.activateUser(privilegedUser);

      await orchestrator.addFeatureToUser(privilegedUser, [
        "update:user:others",
      ]);

      const privilegedsession = await orchestrator.createSession(
        activatedprivilegedUser.id,
      );

      const defaultUser = await orchestrator.createUser();

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${defaultUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${privilegedsession.token}`,
          },
          body: JSON.stringify({
            username: "AlteradoPorPrevilegiado",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: defaultUser.id,
        username: "AlteradoPorPrevilegiado",
        features: defaultUser.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
  describe("Default user", () => {
    test("With nonexistent 'username'", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(response2.status).toBe(404);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado.",
        action: "Verifique se o username foi digitado corretamente.",
        status_code: 404,
      });
    });
    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
        email: "user1@gmail.com",
      });
      const user2 = await orchestrator.createUser({
        username: "user2",
        email: "user2@gmail.com",
      });

      const activatedUser2 = await orchestrator.activateUser(user2);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/user2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            username: "user1",
          }),
        },
      );

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Username já utilizado.",
        action: "Utilize outro username para esta operação.",
        status_code: 400,
      });
    });
    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const activatedUser2 = await orchestrator.activateUser(createdUser2);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );

      expect(response2.status).toBe(400);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Email já utilizado.",
        action: "Utilize outro email.",
        status_code: 400,
      });
    });
    test("With uique'username'", async () => {
      const createdUser = await orchestrator.createUser({});

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const newUsername = faker.internet.username().replace(/[_.-]/g, "");
      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: newUsername,
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: newUsername,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With uique'email'", async () => {
      const createdUser = await orchestrator.createUser({});
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueemail2@gmail.com",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "senha123",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "senha321",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);

      const correctPasswordMatch = await password.compare(
        "senha321",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      const incorrectPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      expect(incorrectPasswordMatch).toBe(false);
    });
    test("With user2 targeting user11", async () => {
      await orchestrator.createUser({
        username: "user11",
        email: "user11@gmail.com",
      });
      const user22 = await orchestrator.createUser({
        username: "user22",
        email: "user22@gmail.com",
      });

      const activatedUser2 = await orchestrator.activateUser(user22);
      const sessionObject2 = await orchestrator.createSession(
        activatedUser2.id,
      );

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/user11",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            username: "user33",
          }),
        },
      );

      expect(response2.status).toBe(403);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        action:
          "Verifique se você possui a permissão necessária para atualizar o usuário.",
        message: "Você não tem permissão para atualizar este usuário.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });
});
