import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { ForbiddenError, NotFoundError } from "infra/errors";
import user from "models/user.js";
import authorization from "./authorization";

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

async function findOneByToken(token) {
  const result = await database.query({
    text: "SELECT * FROM user_activation_tokens WHERE id = $1 and used_at IS NULL AND expires_at > NOW()  LIMIT 1",
    values: [token],
  });
  console.log(result.rowCount);
  if (result.rowCount === 0) {
    throw new NotFoundError({
      message:
        "O Token de ativação utilizado não foi encontrado no sistema ou expirou.",
      token: "Faça um novo cadastro.",
    });
  }

  return result.rows[0];
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "FOC <contato@filipeocastro.dev.br>",
    to: user.email,
    subject: "Ative seu cadastro.",
    text: `Olá ${user.username}, para ativar seu cadastro, clique no link abaixo:

${webserver.origin}/api/v1/activations/${activationToken.id}
    
Atenciosamente,
Equipe FOC
`,
  });
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationtoken = await runSelectQuery(activationTokenId);
  return usedActivationtoken;

  async function runSelectQuery(activationTokenId) {
    const results = await database.query({
      text: `
      UPDATE
       user_activation_tokens
       SET
       used_at = timezone('utc', now()),
       updated_at = timezone('utc', now())
       WHERE 
        id = $1
       RETURNING * ;`,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activeUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar este token de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneByToken,
  markTokenAsUsed,
  activeUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
