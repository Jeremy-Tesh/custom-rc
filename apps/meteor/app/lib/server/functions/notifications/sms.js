import { settings } from '../../../../settings/server';

export async function notifySMSUser({ receiver, message }) {
	// const data = {
	// 	phoneNo: [receiver.customFields.phoneNumber],
	// 	messageText: message.msg,
	// 	MessageId: message.id,
	// };
	const accountSid = settings.get('SMS_Twilio_Account_SID');
	const authToken = settings.get('SMS_Twilio_authToken');
	const fromNo = settings.get('SMS_Twilio_FromNo');

	const client = require('twilio')(accountSid, authToken);
	console.log('twilio request');
	try {
		const error = { smsStatus: 'success' };
		await client.messages.create({
			body: message.msg,
			from: fromNo, // '+18656584630',
			//  to: '+917667337474'
			to: receiver.customFields.phoneNumber, // '+917667337474'
		});
		return error.smsStatus;
	} catch (e) {
		const error = { smsStatus: 'SMS not sent' };
		return error.smsStatus;
	}

	// .then((message) => console.log(message));
}

export function shouldNotifySMS({ receiver, room, customFields }) {
	const SMSService = settings.get('SMS_Notification');
	let error = { smsStatus: 'success' };

	if (customFields?.Alert_SMS_Notification === 'No') {
		error = { smsStatus: 'Setting disabled' };
		return error.smsStatus;
	}

	if (!SMSService) {
		console.log('Ezhil sms false0', receiver?.name);
		error = { smsStatus: 'No SMS service found' };
		// throw new Meteor.Error('totp-invalid', 'TOTP Invalid');
		return error.smsStatus;
	}
	if (!room?.t === 'p') {
		console.log('Ezhil sms false1', receiver?.name);
		error = { smsStatus: 'a private group' };
		return error.smsStatus;
	}
	if (!receiver?.customFields?.phoneNumber) {
		console.log('receiver Ezhil sms false2', receiver?.name);
		error = { smsStatus: 'number found' };
		return error.smsStatus;
	}
	console.log('Ezhil sms true', receiver?.name);
	return error.smsStatus;
}
