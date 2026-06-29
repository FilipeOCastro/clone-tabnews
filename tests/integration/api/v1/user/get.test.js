import { version as uuidVersion } from "uuid";
import orchestrator from "../../orchestrator.js";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";


beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "userWithValidSession",       
      });

        const sessionObject = await orchestrator.createSession(createdUser.id);      
      console.log(sessionObject)
      const response2 = await fetch(
        "http://localhost:3000/api/v1/user", {
          headers: {
            Cookie: `session_id=${sessionObject.token}`
          }
        }
      );

      expect(response2.status).toBe(200);

      const cacheControlHeader = response2.headers.get("Cache-Control");
      expect(cacheControlHeader).toBe("no-store, no-cache, must-revalidate, max-age=0");

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: createdUser.id,
        username: "userWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();

      const renewedSessionObject = await session.findOneValidByToken(sessionObject.token);

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toEqual(true);
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toEqual(true);

      //set cookie assertion
       const parsedSetCookie = setCookieParser(response2, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });

    });
    test("With nonexistent session", async () => {
      const nonexistentToken = 'ea439e45270bb60979c5c73d57fc20cd08037d5fa90da5922b856a6e7769ab355a41ebd3490377124e1c0141165b1008';

      const response = await fetch(
        "http://localhost:3000/api/v1/user", {
          headers: {
            Cookie: `session_id=${nonexistentToken}`
          }
        }
      );

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });   
    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS), 
      })

      const createdUser = await orchestrator.createUser({
        username: "userExpiredSession",       
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);     

      jest.useRealTimers();

      const response = await fetch(
        "http://localhost:3000/api/v1/user", {
          headers: {
            Cookie: `session_id=${sessionObject.token}`
          }
        }
      );

       expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
