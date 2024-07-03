'use strict';

const { WebClient } = require('@slack/web-api');

/**
 * @import { ConversationsHistoryResponse } from '@slack/web-api'
 */

/**
 * @typedef {ConversationsHistoryResponse['messages']} Messages
 */

/**
 * Get all of the messages in a Slack channel.
 *
 * @public
 * @param {WebClient} slackWebApiClient
 *     A pre-authenticated Slack Web API client {@see https://www.npmjs.com/package/@slack/web-api}.
 * @param {string} slackChannelId
 *     The ID of the Slack channel to get all messages for.
 * @returns {Promise<Messages>}
 *     Returns a promise that resolves to an array of Slack messages.
 * @throws {TypeError}
 *     Throws if any of the parameters are invalid.
 * @throws {Error}
 *     Throws if the Slack API errors.
 */
function getAllMessagesInASlackChannel(slackWebApiClient, slackChannelId) {
	if (!(slackWebApiClient instanceof WebClient)) {
		throw new TypeError('`slackWebApiClient` must be an instance of Slack `WebClient`');
	}
	if (!slackChannelId || typeof slackChannelId !== 'string') {
		throw new TypeError('`slackChannelId` must be slack channel ID as a string');
	}
	return recurseOverChannelHistory(slackWebApiClient, slackChannelId);
}

/**
 * Recurse over a Slack channel's history.
 *
 * @private
 * @param {WebClient} slackWebApiClient
 *     A pre-authenticated Slack Web API client {@see https://www.npmjs.com/package/@slack/web-api}.
 * @param {string} slackChannelId
 *     The ID of the Slack channel to get all messages for.
 * @param {object} [state]
 *     A private state object used in recursion.
 * @returns {Promise<Messages>}
 *     Returns a promise that resolves to an array of Slack messages.
 * @throws {Error}
 *     Throws if the Slack API errors.
 */
async function recurseOverChannelHistory(
	slackWebApiClient,
	slackChannelId,
	state = { result: [] }
) {
	const apiCallOptions = {
		channel: slackChannelId,
		count: 100
	};
	if (state.lastMessageTimestamp) {
		apiCallOptions.latest = state.lastMessageTimestamp;
	}
	const response = await slackWebApiClient.conversations.history(apiCallOptions);
	state.result = state.result.concat(response.messages);
	state.lastMessageTimestamp = state.result.at(-1).ts;
	if (response.has_more) {
		return recurseOverChannelHistory(slackWebApiClient, slackChannelId, state);
	}
	return state.result.reverse();
}

module.exports = getAllMessagesInASlackChannel;
module.exports.default = module.exports;
