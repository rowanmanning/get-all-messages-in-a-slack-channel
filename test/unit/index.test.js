'use strict';

const { afterEach, beforeEach, describe, it, mock } = require('node:test');
const assert = require('node:assert');

const conversations = { history: mock.fn() };
const WebClient = mock.fn(
	class WebClient {
		conversations = conversations;
	}
);
mock.module('@slack/web-api', { namedExports: { WebClient } });

describe('@rowanmanning/get-all-messages-in-a-slack-channel', () => {
	let getAllMessagesInASlackChannel;

	beforeEach(() => {
		getAllMessagesInASlackChannel = require('../..').getAllMessagesInASlackChannel;
	});

	afterEach(() => mock.reset());

	it('exports a function', () => {
		assert.strictEqual(typeof getAllMessagesInASlackChannel, 'function');
	});

	describe('getAllMessagesInASlackChannel(slackWebApiClient, slackChannelId)', () => {
		let resolvedValue;
		let slackWebApiClient;

		beforeEach(async () => {
			conversations.history.mock.resetCalls();
			conversations.history.mock.mockImplementationOnce(
				async () => ({
					messages: [
						{
							ts: 'mock-timestamp-1',
							text: 'mock message 1'
						},
						{
							ts: 'mock-timestamp-2',
							text: 'mock message 2'
						}
					],
					has_more: true
				}),
				0
			);
			conversations.history.mock.mockImplementationOnce(
				async () => ({
					messages: [
						{
							ts: 'mock-timestamp-3',
							text: 'mock message 3'
						},
						{
							ts: 'mock-timestamp-4',
							text: 'mock message 4'
						}
					],
					has_more: true
				}),
				1
			);
			conversations.history.mock.mockImplementationOnce(
				async () => ({
					messages: [
						{
							ts: 'mock-timestamp-5',
							text: 'mock message 5'
						}
					],
					has_more: false
				}),
				2
			);
			conversations.history.mock.mockImplementationOnce(async () => {
				throw new Error('Too many calls, no more messages');
			}, 3);

			slackWebApiClient = new WebClient();
			resolvedValue = await getAllMessagesInASlackChannel(
				slackWebApiClient,
				'mock-channel-id'
			);
		});

		it('makes calls to the Slack conversations.history API endpoint until there are no more messages', () => {
			assert.strictEqual(conversations.history.mock.callCount(), 3);
			assert.deepStrictEqual(conversations.history.mock.calls[0].arguments, [
				{
					channel: 'mock-channel-id',
					count: 100
				}
			]);
			assert.deepStrictEqual(conversations.history.mock.calls[1].arguments, [
				{
					channel: 'mock-channel-id',
					count: 100,
					latest: 'mock-timestamp-2'
				}
			]);
			assert.deepStrictEqual(conversations.history.mock.calls[2].arguments, [
				{
					channel: 'mock-channel-id',
					count: 100,
					latest: 'mock-timestamp-4'
				}
			]);
		});

		it('resolves with an array containing all of the Slack messages in chronological order', () => {
			assert.ok(Array.isArray(resolvedValue));
			assert.strictEqual(resolvedValue.length, 5);
			assert.deepStrictEqual(resolvedValue, [
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
				assert.ok(rejectedError instanceof TypeError);
				assert.strictEqual(
					rejectedError.message,
					'`slackWebApiClient` must be an instance of Slack `WebClient`'
				);
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
				assert.ok(rejectedError instanceof TypeError);
				assert.strictEqual(
					rejectedError.message,
					'`slackChannelId` must be slack channel ID as a string'
				);
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
				assert.ok(rejectedError instanceof TypeError);
				assert.strictEqual(
					rejectedError.message,
					'`slackChannelId` must be slack channel ID as a string'
				);
			});
		});
	});
});
