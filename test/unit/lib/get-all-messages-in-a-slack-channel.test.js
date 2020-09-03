'use strict';

const assert = require('proclaim');
const mockery = require('mockery');

describe('lib/get-all-messages-in-a-slack-channel', () => {
	let getAllMessagesInASlackChannel;
	let webApi;

	beforeEach(() => {
		webApi = require('../mock/npm/@slack/web-api.js');
		mockery.registerMock('@slack/web-api', webApi);
		getAllMessagesInASlackChannel = require('../../../lib/get-all-messages-in-a-slack-channel');
	});

	it('exports a function', () => {
		assert.isFunction(getAllMessagesInASlackChannel);
	});

	describe('getAllMessagesInASlackChannel(slackWebApiClient, slackChannelId)', () => {
		let resolvedValue;
		let slackWebApiClient;

		beforeEach(async () => {
			slackWebApiClient = new webApi.WebClient();
			resolvedValue = await getAllMessagesInASlackChannel(slackWebApiClient, 'mock-channel-id');
		});

		it('makes calls to the Slack conversations.history API endpoint until there are no more messages', () => {
			assert.calledThrice(slackWebApiClient.conversations.history);
		});

		it('resolves with an array containing all of the Slack messages in chronological order', () => {
			assert.isArray(resolvedValue);
			assert.lengthEquals(resolvedValue, 5);
			assert.deepEqual(resolvedValue, [
				{
					ts: 'mock-timestamp-5',
					text: 'mock message 5'
				},
				{
					ts: 'mock-timestamp-4',
					text: 'mock message 4'
				},
				{
					ts: 'mock-timestamp-3',
					text: 'mock message 3'
				},
				{
					ts: 'mock-timestamp-2',
					text: 'mock message 2'
				},
				{
					ts: 'mock-timestamp-1',
					text: 'mock message 1'
				}
			]);
		});

		describe('when `slackWebApiClient` is not a Slack Web API Client', () => {
			let rejectedError;

			beforeEach(async () => {
				try {
					await getAllMessagesInASlackChannel({}, 'mock-channel-id');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive `TypeError`', () => {
				assert.isInstanceOf(rejectedError, TypeError);
				assert.strictEqual(rejectedError.message, '`slackWebApiClient` must be an instance of Slack `WebClient`');
			});

		});

		describe('when `slackChannelId` is not a string', () => {
			let rejectedError;

			beforeEach(async () => {
				try {
					await getAllMessagesInASlackChannel(slackWebApiClient, 123);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive `TypeError`', () => {
				assert.isInstanceOf(rejectedError, TypeError);
				assert.strictEqual(rejectedError.message, '`slackChannelId` must be slack channel ID as a string');
			});

		});

		describe('when `slackChannelId` is an empty string', () => {
			let rejectedError;

			beforeEach(async () => {
				try {
					await getAllMessagesInASlackChannel(slackWebApiClient, '');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive `TypeError`', () => {
				assert.isInstanceOf(rejectedError, TypeError);
				assert.strictEqual(rejectedError.message, '`slackChannelId` must be slack channel ID as a string');
			});

		});

	});

});
