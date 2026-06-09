test("Not allowed Methodos to /api/v1/migrations should return 405", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "PUT",
  });

  const responseBody = await response.json();

  expect(responseBody).toEqual({
    name: "MethodNotAllowedError",
    message: "Método não é permitido para este endpoint",
    action: "Verifique se o método HTTP enviado é válido para este endpoint",
    status_code: 405,
  });
});
