import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(gettHandler);
router.patch(controller.canRequest("update:user"), patchtHandler);

export default router.handler(controller.errorHandlers);

async function gettHandler(request, response) {
  const username = request.query.username;
  const userResult = await user.findOneByUsername(username);
  return response.status(200).json(userResult);
}

async function patchtHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const userTryingToPatch = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não tem permissão para atualizar este usuário.",
      action:
        "Verifique se você possui a permissão necessária para atualizar o usuário.",
    });
  }

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
