'use strict';

const assert = require('node:assert');
const td = require('testdouble');

describe('lib/get-all-messages-in-a-slack-channel', () => {
	let getAllMessagesInASlackChannel;
	let webApi;
	let WebClient;

	beforeEach(() => {
		WebClient = td.constructor();
		WebClient.prototype.conversations = {
			history: td.func()
		};
		webApi = td.replace('@slack/web-api', {WebClient});
		getAllMessagesInASlackChannel = require('../../../lib/get-all-messages-in-a-slack-channel');
	});

	it('exports a function', () => {
		assert.strictEqual(typeof getAllMessagesInASlackChannel, 'function');
	});

	describe('getAllMessagesInASlackChannel(slackWebApiClient, slackChannelId)', () => {
		let resolvedValue;
		let slackWebApiClient;

		beforeEach(async () => {
			td.when(WebClient.prototype.conversations.history(td.matchers.isA(Object))).thenResolve(
				{
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
				},
				{
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
				},
				{
					messages: [
						{
							ts: 'mock-timestamp-5',
							text: 'mock message 5'
						}
					],
					has_more: false
				}
			);

			// WebClient.prototype.conversations.history.onCall(3).rejects(new Error('Too many calls, no more messages'));
			slackWebApiClient = new webApi.WebClient();
			resolvedValue = await getAllMessagesInASlackChannel(slackWebApiClient, 'mock-channel-id');
		});

		it('makes calls to the Slack conversations.history API endpoint until there are no more messages', () => {
			td.verify(slackWebApiClient.conversations.history(td.matchers.isA(Object)), {times: 3});
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
				assert.ok(rejectedError instanceof TypeError);
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
				assert.ok(rejectedError instanceof TypeError);
				assert.strictEqual(rejectedError.message, '`slackChannelId` must be slack channel ID as a string');
			});

		});

	});

	describe('.default', () => {
		it('aliases the module exports', () => {
			assert.strictEqual(getAllMessagesInASlackChannel, getAllMessagesInASlackChannel.default);
		});
	});

});
