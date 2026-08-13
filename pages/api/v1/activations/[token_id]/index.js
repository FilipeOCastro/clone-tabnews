import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchtHandler);

export default router.handler(controller.errorHandlers);

async function patchtHandler(request, response) {
  const activationTokenId = request.query.token_id;

  const validActivationToken =
    await activation.findOneByToken(activationTokenId);

  await activation.activeUserByUserId(validActivationToken.user_id);

  const usedActivationtoken =
    await activation.markTokenAsUsed(activationTokenId);

  return response.status(200).json(usedActivationtoken);
}
