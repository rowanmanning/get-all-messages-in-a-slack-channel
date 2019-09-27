'use strict';

const assert = require('proclaim');
const mockery = require('mockery');

describe('index', () => {
	let index;
	let getAllMessagesInASlackChannel;

	beforeEach(() => {
		mockery.registerMock('@slack/web-api', require('./mock/npm/@slack/web-api.js'));
		index = require('../../index');
		getAllMessagesInASlackChannel = require('../../lib/get-all-messages-in-a-slack-channel');
	});

	it('aliases `lib/get-all-messages-in-a-slack-channel`', () => {
		assert.strictEqual(index, getAllMessagesInASlackChannel);
	});

});
