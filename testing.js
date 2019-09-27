'use strict';

const {WebClient} = require('@slack/web-api');
const getAllMessagesInASlackChannel = require('.');

(async () => {

	const slackWebClient = new WebClient(process.env.SLACK_TOKEN);
	const messages = await getAllMessagesInASlackChannel(slackWebClient, 'C874CTP7T');

	console.log(messages);

})();
