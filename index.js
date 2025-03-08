'use strict';

const { WebClient } = require('@slack/web-api');

/**
 * @import { ConversationsHistoryArguments, ConversationsHistoryResponse } from '@slack/web-api'
 * @import { getAllMessagesInASlackChannel, Messages } from '.'
 */

/** @type {getAllMessagesInASlackChannel} */
exports.getAllMessagesInASlackChannel = function getAllMessagesInASlackChannel(
	slackWebApiClient,
	slackChannelId
) {
	if (!(slackWebApiClient instanceof WebClient)) {
		throw new TypeError('`slackWebApiClient` must be an instance of Slack `WebClient`');
	}
	if (!slackChannelId || typeof slackChannelId !== 'string') {
		throw new TypeError('`slackChannelId` must be slack channel ID as a string');
	}
	return recurseOverChannelHistory(slackWebApiClient, slackChannelId);
};

/**
 * @param {WebClient} slackWebApiClient
 * @param {string} slackChannelId
 * @param {{result: Messages, lastMessageTimestamp?: string}} [state]
 * @returns {Promise<Messages>}
 */
async function recurseOverChannelHistory(
	slackWebApiClient,
	slackChannelId,
	state = { result: [] }
) {
	/** @type {ConversationsHistoryArguments} */
	const apiCallOptions = {
		channel: slackChannelId,
		count: 100
	};
	if (state.lastMessageTimestamp) {
		apiCallOptions.latest = state.lastMessageTimestamp;
	}
	const response = await slackWebApiClient.conversations.history(apiCallOptions);
	if (response.messages) {
		state.result = state.result.concat(response.messages);
	}
	state.lastMessageTimestamp = state.result.at(-1)?.ts;
	if (response.has_more) {
		return recurseOverChannelHistory(slackWebApiClient, slackChannelId, state);
	}
	return state.result.reverse();
}
