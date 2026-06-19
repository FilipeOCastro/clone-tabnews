import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.get(gettHandler);
router.patch(patchtHandler);

export default router.handler(controller.errorHandlers);

async function gettHandler(request, response) {
  const username = request.query.username;
  const userResult = await user.findOneByUsername(username);
  return response.status(200).json(userResult);
}

async function patchtHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
