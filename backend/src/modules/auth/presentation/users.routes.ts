import { Router } from "express";
import { asyncHandler } from "../../../shared/middlewares/async-handler";
import { authenticate } from "../../../shared/middlewares/authenticate.middleware";
import { AuthController } from "./auth.controller";

export function createUsersRouter(controller: AuthController): Router {
  const router = Router();

  router.get("/me", authenticate, asyncHandler(controller.me));

  return router;
}
