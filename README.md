
# @rowanmanning/get-all-messages-in-a-slack-channel

Get all messages in a public Slack channel.


## Table of Contents

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [Contributing](#contributing)
  * [License](#license)


## Requirements

This library requires the following to run:

  * [Node.js](https://nodejs.org/) 18+


## Usage

Install alongside the Slack web API with [npm](https://www.npmjs.com/):

```sh
npm install @slack/web-api @rowanmanning/get-all-messages-in-a-slack-channel
```

Load the library into your code with a `require` call (you'll also need the Slack `WebClient` class):

```js
const {WebClient} = require('@slack/web-api');
const getAllMessagesInASlackChannel = require('@rowanmanning/get-all-messages-in-a-slack-channel');
```

Get all the messages in a Slack channel:

```js
const slackWebClient = new WebClient('YOUR-SLACK-TOKEN');
const messages = await getAllMessagesInASlackChannel(slackWebClient, 'YOUR-CHANNEL-ID');
```

See the [Slack `channels.history` response documentation](https://api.slack.com/methods/channels.history#response) for info on what the messages look like.


## Contributing

[The contributing guide is available here](docs/contributing.md). All contributors must follow [this library's code of conduct](docs/code_of_conduct.md).


## License

Licensed under the [MIT](LICENSE) license.<br/>
Copyright &copy; 2019, Rowan Manning
