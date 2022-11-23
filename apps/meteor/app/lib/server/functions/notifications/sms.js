import { Meteor } from 'meteor/meteor';

import { settings } from '../../../../settings/server';
import { SMS } from '../../../../sms';

const AWS = require('aws-sdk');

export function notifySMSUser({ receiver, message }) {
	const data = {
		phoneNo: [receiver.customFields.phonenumber],
		messageText: message.msg,
		MessageId: message.id,
	};

	// const userPhoneNumber = pno;
	const awsAccessKeyId = settings.get('FileUpload_S3_AWSAccessKeyId');
	const awsSecretAccessKey = settings.get('FileUpload_S3_AWSSecretAccessKey');
	const awsRegion = settings.get('FileUpload_S3_Region');

	AWS.config.update({ accessKeyId: awsAccessKeyId, secretAccessKey: awsSecretAccessKey, region: awsRegion });
	const messageText = message.msg;
	// eslint-disable-next-line array-callback-return
	data.phoneNo.filter((phoneNo) => {
		const params = {
			Message: messageText.substring(0, 160),
			PhoneNumber: phoneNo.startsWith('+') ? phoneNo : settings.get('SMS_Default_Country_Code') + phoneNo,
		};
		/** Params for set SMSType - Set Transactional for highest reliability */
		const paramSmsType = {
			attributes: {
				/* required */ DefaultSMSType: 'Transactional',
			},
		};
		const setSMSTypePromise = new AWS.SNS({ apiVersion: '2010-03-31' }).setSMSAttributes(paramSmsType).promise();
		setSMSTypePromise
			.then(function (data) {
				console.log(` SMS Type ${JSON.stringify(data)}`);
			})
			.catch(function (err) {
				console.error(err, err.stack);
			});

		const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
		publishTextPromise
			.then(function (data) {
				console.log(`MessageID is ${data.MessageId}`);
			})
			.catch(function (err) {
				console.log(err);
				throw new Meteor.Error('error-sms-send-failed', `Error trying to send invite sms: ${phoneNo}`, {
					method: 'sendCutomerInvitationSMS',
					message,
				});
			});
	});
}

export function shouldNotifySMS(receiver) {
	if (!SMS.enabled) {
		return false;
	}
	const SMSService = settings.get('SMS_Notification');
	console.log('txt', SMSService);

	if (!SMSService) {
		return false;
	}
	if (!receiver?.customFields.phonenumber) {
		return false;
	}
	if (!settings.get('Accounts_AllowSMSNotifications')) {
		return false;
	}

	return true;
}
