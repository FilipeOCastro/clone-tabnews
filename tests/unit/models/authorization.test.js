import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors.js";

describe("models/authorization.js", () => {
  describe(".can", () => {
    test("without user", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });
    test("without user.features", () => {
      const user = { username: "UserWithoutFeatures" };
      expect(() => {
        authorization.can(user);
      }).toThrow(InternalServerError);
    });
    test("without unknown feature", () => {
      const user = { features: [] };
      expect(() => {
        authorization.can(user, "uk:feature");
      }).toThrow(InternalServerError);
    });
    test("with valid user and known feature", () => {
      const user = { features: ["read:user"] };

      expect(authorization.can(user, "read:user")).toBe(true);
    });
  });

  describe(".filterOutput", () => {
    test("without user", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });
    test("without user.features", () => {
      const user = { username: "UserWithoutFeatures" };
      expect(() => {
        authorization.filterOutput(user);
      }).toThrow(InternalServerError);
    });
    test("without unknown feature", () => {
      const user = { features: [] };
      expect(() => {
        authorization.filterOutput(user, "uk:feature");
      }).toThrow(InternalServerError);
    });
    test("with valid user, known feature but no resource", () => {
      const user = { features: ["read:user"] };
      expect(() => {
        authorization.filterOutput(user, "read:user");
      }).toThrow(InternalServerError);
    });
    test("with valid user, known feature and resource", () => {
      const user = { features: ["read:user"] };
      const resource = {
        id: 1,
        username: "TestUser",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00Z",
        updated_at: "2026-0826T00:00:00Z",
        email: "test@example.com",
        password: "hashedpassword",
      };

      expect(authorization.filterOutput(user, "read:user", resource)).toEqual({
        id: 1,
        username: "TestUser",
        features: ["read:user"],
        created_at: "2026-0101T00:00:00Z",
        updated_at: "2026-0826T00:00:00Z",
      });
    });
  });
});
