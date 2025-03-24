const request = require("supertest");
const app = require("../src/app"); // ✅ Fixed import from `app.js`

describe("User API Tests", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "User123",
      email: "user@gmail.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });
});
