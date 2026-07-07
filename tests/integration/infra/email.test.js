import email from "infra/email.js";
import orchestrator from "tests/integration/api/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("SEND", async () => {
    await orchestrator.deleteAllEmails();
    await email.send({
      from: "FinTab <your_email@gmail.com>",
      to: "recipient_email@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    });
    await email.send({
      from: "FinTab <your_email@gmail.com>",
      to: "recipient_email@example.com",
      subject: "Test Email",
      text: "This is a test last email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    console.log("Last Email:", lastEmail);
    expect(lastEmail.sender).toBe("<your_email@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<recipient_email@example.com>");
    expect(lastEmail.subject).toBe("Test Email");
    expect(lastEmail.text).toBe("This is a test last email.\n");
  });
});
