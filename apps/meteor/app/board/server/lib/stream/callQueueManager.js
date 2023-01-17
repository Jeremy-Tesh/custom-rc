import { Meteor } from 'meteor/meteor';

import { CallQueue } from '../../index';

// const queueDataStreamer = new Meteor.Streamer('callqueue_observer');
// queueDataStreamer.allowRead('all');
// queueDataStreamer.allowEmit('all');
// queueDataStreamer.allowWrite('none');
// queueDataStreamer.allowRead(function() {
// 	return true;
// });
const queueDataStreamer = new Meteor.Streamer('callqueue_observer', { retransmit: false });
queueDataStreamer.serverOnly = true;
queueDataStreamer.allowRead('all');
queueDataStreamer.allowEmit('all');
queueDataStreamer.allowWrite('none');

const emitQueueDataEvent = (event, data) => {
	queueDataStreamer.emitWithoutBroadcast(event, data);
};
const mountDataToEmit = (type, data) => ({ type, ...data });
// CallQueue.on('change', ({ clientAction, id: _id, data: record }) => {
// 	switch (clientAction) {
// 		case 'inserted':
// 			emitQueueDataEvent('callqueue', mountDataToEmit('added', record));
// 			break;
// 		case 'updated':
// 			// const isUpdatingDepartment = record && record.depId;
// 			const updatedRecord = CallQueue.findOneById(_id);
// 			emitQueueDataEvent('callqueue', mountDataToEmit('changed', updatedRecord));
// 			// emitQueueDataEvent(_id, { ...updatedRecord, clientAction });
// 			// if (updatedRecord && !updatedRecord.depId) {
// 			// 	return emitQueueDataEvent('callqueue', mountDataToEmit('changed', updatedRecord));
// 			// }
// 			// if (isUpdatingDepartment) {
// 			// 	emitQueueDataEvent('callqueue', mountDataToEmit('changed', updatedRecord));
// 			// }
// 			break;

// 		case 'removed':
// 			// const removedRecord = CallQueue.trashFindOneById(_id);
// 			// emitQueueDataEvent(_id, { _id, clientAction });
// 			emitQueueDataEvent('callqueue', mountDataToEmit('removed', { _id }));
// 			break;
// 	}
// });
