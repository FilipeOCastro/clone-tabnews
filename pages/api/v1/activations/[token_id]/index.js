import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.patch(patchtHandler);

export default router.handler(controller.errorHandlers);

async function patchtHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken =
    await activation.findOneByToken(activationTokenId);
  const usedActivationtoken =
    await activation.markTokenAsUsed(activationTokenId);

  await activation.activeUserByUserId(validActivationToken.user_id);

  return response.status(200).json(usedActivationtoken);
}
