import { IAIProvider, ToneAnalysis } from "../../domain/ai-assistant.types";

export class AnalyzeToneUseCase {
  constructor(private readonly aiProvider: IAIProvider) {}

  execute(message: string): Promise<ToneAnalysis> {
    return this.aiProvider.analyzeTone(message);
  }
}
