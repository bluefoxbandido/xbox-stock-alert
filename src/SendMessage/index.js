const AWS = require('aws-sdk');
const sns = new AWS.SNS({region: 'us-west-2'});

const message = 'Xbox alert! Click me now: https://www.xbox.com/en-us/configure/8WJ714N3RBTL';
const defaultMessage = 'No Xboxes available, try again later';

exports.handler = async (event) => {
  // Log the event argument for debugging and for use in local development
  console.log(JSON.stringify(event, undefined, 2));
  // If the CodeBuild job was successful, that means Xboxes are not in stock and no message needs to be sent
  if (event.detail['build-status'] === 'SUCCEEDED') {
    console.log(defaultMessage)
    return {
      statusCode: 200,
      body: defaultMessage
    };
  } else if (event.detail['build-status'] === 'FAILED') {
    // If the CodeBuild job failed, that means Xboxes are back in stock!
    console.log('Sending message: ', message);

    // Create SNS parameters
    const params = {
      Message: message, /* required */
      TopicArn: process.env.TOPIC_ARN,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Promotional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'XboxAlert'
        },
      },
    };

    try {
      let data = await sns.publish(params).promise();
      console.log('Message sent! Xbox purchase, commence!');
      return { 
        statusCode: 200,
        body: data
      };
    } catch (err) {
      console.log('Sending failed', err);
      throw err;
    }
  }
  return {};
};