import { expect } from 'chai';

import { getCredentials, api, request, credentials, group, apiPrivateChannelName } from '../../data/api-data.js';

// function getRoomInfo(roomId) {
// 	return new Promise((resolve /* , reject*/) => {
// 		request
// 			.get(api('groups.info'))
// 			.set(credentials)
// 			.query({
// 				roomId,
// 			})
// 			.end((err, req) => {
// 				resolve(req.body);
// 			});
// 	});
// }

describe('[AlertGroups]', function () {
	this.retries(0);

	before((done) => getCredentials(done));

	it('should createAlertGroup', (done) => {
		request
			.post(api('groups.createAlertGroup'))
			.set(credentials)
			.send({
				name: apiPrivateChannelName,
				members: ['ermi'],
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('group._id');
				expect(res.body).to.have.nested.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.nested.property('group.t', 'p');
				expect(res.body).to.have.nested.property('group.msgs', 0);
				group._id = res.body.group._id;
			})
			.end(done);
	});

	// it('should notify users', async (done) => {
	// 	console.log(await getRoomInfo(group._id));
	// 	await request
	// 		.post(api('groups.notifySecurityDispatch'))
	// 		.set(credentials)
	// 		.send({
	// 			roomId: group._id,
	// 			members: ['ermi'],
	// 		})
	// 		.expect('Content-Type', 'application/json')
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body).to.have.property('success', true);
	// 		})
	// 		.end(done);
	// });
	// it('should notify who canceled the notification', async (done) => {
	// 	console.log(await getRoomInfo(group._id));
	// 	await request
	// 		.post(api('groups.notifySecurityDispatch'))
	// 		.set(credentials)
	// 		.send({
	// 			roomId: group._id,
	// 			members: ['ermi'],
	// 		})
	// 		.expect('Content-Type', 'application/json')
	// 		.expect(200)
	// 		.expect((res) => {
	// 			expect(res.body).to.have.property('success', true);
	// 			expect(res.body).to.have.nested.property('group._id');
	// 			expect(res.body).to.have.nested.property('group.name', apiPrivateChannelName);
	// 			expect(res.body).to.have.nested.property('group.t', 'p');
	// 			expect(res.body).to.have.nested.property('group.msgs', 0);
	// 		})
	// 		.end(done);
	// });
	it('should return group basic structure', (done) => {
		request
			.get(api('groups.alertStatus'))
			.set(credentials)
			.query({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('status').and.to.be.an('array');
			})
			.end(done);
	});
	it('should cancel alert notification', (done) => {
		request
			.post(api('groups.notifyCancel'))
			.set(credentials)
			.send({
				roomName: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
});
