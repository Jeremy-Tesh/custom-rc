import { settings } from '../../../../settings/server';

export function notifySMSUser({ receiver, message }) {
	// const data = {
	// 	phoneNo: [receiver.customFields.phoneNumber],
	// 	messageText: message.msg,
	// 	MessageId: message.id,
	// };
	const accountSid = settings.get('SMS_Twilio_Account_SID');
	const authToken = settings.get('SMS_Twilio_authToken');
	const fromNo = settings.get('SMS_Twilio_FromNo');

	const client = require('twilio')(accountSid, authToken);

	client.messages
		.create({
			body: message.msg,
			from: fromNo, // '+18656584630',
			//  to: '+917667337474'
			to: receiver.customFields.phoneNumber, // '+917667337474'
		})
		.then((message) => console.log(message));
}

export function shouldNotifySMS({ receiver, room }) {
	const SMSService = settings.get('SMS_Notification');

	if (!SMSService) {
		console.log('Ezhil sms false0', receiver?.name);
		return false;
	}
	if (!room?.t === 'p') {
		console.log('Ezhil sms false1', receiver?.name);
		return false;
	}
	if (!receiver?.customFields?.phoneNumber) {
		console.log('receiver Ezhil sms false2', receiver?.name);
		return false;
	}
	console.log('Ezhil sms true', receiver?.name);
	return true;
}
