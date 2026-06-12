import { Router } from "express";
import { asyncHandler } from "../../../shared/middlewares/async-handler";
import { validate } from "../../../shared/middlewares/validate.middleware";
import { loginSchema, refreshSchema, registerSchema } from "../application/dtos/auth.dto";
import { AuthController } from "./auth.controller";
import { RegisterUserUseCase } from "../application/use-cases/register-user.usecase";
import { LoginUserUseCase } from "../application/use-cases/login-user.usecase";
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.usecase";
import { GetCurrentUserUseCase } from "../application/use-cases/get-current-user.usecase";
import { MongoUserRepository } from "../infrastructure/repositories/mongo-user.repository";
import { BcryptPasswordHasher } from "../infrastructure/services/bcrypt-password-hasher";
import { JwtTokenService } from "../infrastructure/services/jwt-token.service";

/**
 * Composition root for the auth module: wires the concrete infrastructure
 * implementations into the use cases and the use cases into the
 * controller, then exposes the routes. Keeping this wiring in one place
 * means swapping an implementation (e.g. a different token service) only
 * requires a change here.
 *
 * Exported alongside the router so `users.routes.ts` can reuse the same
 * controller instance for `/users/me` without re-wiring dependencies.
 */
export function createAuthController(): AuthController {
  const userRepository = new MongoUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  return new AuthController(
    new RegisterUserUseCase(userRepository, passwordHasher, tokenService),
    new LoginUserUseCase(userRepository, passwordHasher, tokenService),
    new RefreshTokenUseCase(userRepository, tokenService),
    new GetCurrentUserUseCase(userRepository),
  );
}

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validate(registerSchema), asyncHandler(controller.register));
  router.post("/login", validate(loginSchema), asyncHandler(controller.login));
  router.post("/refresh", validate(refreshSchema), asyncHandler(controller.refresh));

  return router;
}
