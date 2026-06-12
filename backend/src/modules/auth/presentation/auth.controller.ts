import { Request, Response } from "express";
import { sendSuccess } from "../../../shared/utils/api-response";
import { RegisterUserUseCase } from "../application/use-cases/register-user.usecase";
import { LoginUserUseCase } from "../application/use-cases/login-user.usecase";
import { RefreshTokenUseCase } from "../application/use-cases/refresh-token.usecase";
import { GetCurrentUserUseCase } from "../application/use-cases/get-current-user.usecase";
import { LoginInput, RefreshInput, RegisterInput } from "../application/dtos/auth.dto";

/**
 * Thin HTTP adapter: extracts the validated request payload, delegates to a
 * use case, and shapes the response. Contains no business logic itself.
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;
    const result = await this.registerUserUseCase.execute(input);
    sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;
    const result = await this.loginUserUseCase.execute(input);
    sendSuccess(res, result);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshInput;
    const tokens = await this.refreshTokenUseCase.execute(refreshToken);
    sendSuccess(res, tokens);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    // req.userId is set by the `authenticate` middleware
    const profile = await this.getCurrentUserUseCase.execute(req.userId as string);
    sendSuccess(res, profile);
  };
}
