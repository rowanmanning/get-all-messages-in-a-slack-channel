/**
 * @module @rowanmanning/get-all-messages-in-a-slack-channel
 */
'use strict';

const {WebClient} = require('@slack/web-api');

/**
 * Get all of the messages in a Slack channel.
 *
 * @access public
 * @param {WebClient} slackWebApiClient
 *     A pre-authenticated Slack Web API client {@see https://www.npmjs.com/package/@slack/web-api}.
 * @param {string} slackChannelId
 *     The ID of the Slack channel to get all messages for.
 * @returns {Promise<Array<import('@slack/web-api/dist/response/ConversationsHistoryResponse').Message>>}
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
 * @access private
 * @param {WebClient} slackWebApiClient
 *     A pre-authenticated Slack Web API client {@see https://www.npmjs.com/package/@slack/web-api}.
 * @param {string} slackChannelId
 *     The ID of the Slack channel to get all messages for.
 * @param {object} [state={result: []}]
 *     A private state object used in recursion.
 * @returns {Promise<Array<import('@slack/web-api/dist/response/ConversationsHistoryResponse').Message>>}
 *     Returns a promise that resolves to an array of Slack messages.
 * @throws {Error}
 *     Throws if the Slack API errors.
 */
async function recurseOverChannelHistory(slackWebApiClient, slackChannelId, state = {result: []}) {
	const apiCallOptions = {
		channel: slackChannelId,
		count: 100
	};
	if (state.lastMessageTimestamp) {
		apiCallOptions.latest = state.lastMessageTimestamp;
	}
	const response = await slackWebApiClient.conversations.history(apiCallOptions);
	state.result = state.result.concat(response.messages);
	state.lastMessageTimestamp = state.result[state.result.length - 1].ts;
	if (response.has_more) {
		return recurseOverChannelHistory(slackWebApiClient, slackChannelId, state);
	}
	return state.result.reverse();
}

module.exports = getAllMessagesInASlackChannel;
