import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes in milliseconds

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: "INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *",
      values: [userId, expiresAt],
    });
    return result.rows[0];
  }
}

async function findOneByUserId(userId) {
  const result = await database.query({
    text: "SELECT * FROM user_activation_tokens WHERE user_id = $1 LIMIT 1",
    values: [userId],
  });

  return result.rows[0];
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "FinTab <contato@gmail.com>",
    to: user.email,
    subject: "Ative seu cadastro.",
    text: `Olá ${user.username}, para ativar seu cadastro, clique no link abaixo:

${webserver.origin}/api/v1/activations/${activationToken.id}
    
Atenciosamente,
Equipe FinTab
`,
  });
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
};

export default activation;
