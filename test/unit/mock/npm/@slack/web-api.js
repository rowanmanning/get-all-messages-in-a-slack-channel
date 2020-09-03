'use strict';

const sinon = require('sinon');

class WebClient {}

WebClient.prototype.constructor = sinon.stub();

const conversations = WebClient.prototype.conversations = {
	history: sinon.stub()
};

conversations.history.onCall(0).resolves({
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
});

conversations.history.onCall(1).resolves({
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
});

conversations.history.onCall(2).resolves({
	messages: [
		{
			ts: 'mock-timestamp-5',
			text: 'mock message 5'
		}
	],
	has_more: false
});

conversations.history.onCall(3).rejects(new Error('Too many calls, no more messages'));

module.exports = {WebClient};
