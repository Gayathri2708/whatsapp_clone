import { ChatMessageInput, ChatSummary, IAIProvider } from "../../domain/ai-assistant.types";

export class SummarizeMessagesUseCase {
  constructor(private readonly aiProvider: IAIProvider) {}

  execute(messages: ChatMessageInput[]): Promise<ChatSummary> {
    return this.aiProvider.summarizeMessages(messages);
  }
}
