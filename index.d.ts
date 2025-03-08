import type { ConversationsHistoryResponse, WebClient } from '@slack/web-api';

export type Messages = ConversationsHistoryResponse['messages'];

declare function getAllMessagesInASlackChannel(
	slackWebApiClient: WebClient,
	slackChannelId: string
): Promise<Messages>;
