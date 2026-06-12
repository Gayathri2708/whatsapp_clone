import { Request, Response } from "express";
import { sendSuccess } from "../../../shared/utils/api-response";
import { AnalyzeToneUseCase } from "../application/use-cases/analyze-tone.usecase";
import { SummarizeMessagesUseCase } from "../application/use-cases/summarize-messages.usecase";
import { AnalyzeToneInput, SummarizeMessagesInput } from "../application/dtos/ai.dto";

export class AIController {
  constructor(
    private readonly analyzeToneUseCase: AnalyzeToneUseCase,
    private readonly summarizeMessagesUseCase: SummarizeMessagesUseCase,
  ) {}

  analyzeTone = async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body as AnalyzeToneInput;
    const result = await this.analyzeToneUseCase.execute(message);
    sendSuccess(res, result);
  };

  summarizeMessages = async (req: Request, res: Response): Promise<void> => {
    const { messages } = req.body as SummarizeMessagesInput;
    const result = await this.summarizeMessagesUseCase.execute(messages);
    sendSuccess(res, result);
  };
}
