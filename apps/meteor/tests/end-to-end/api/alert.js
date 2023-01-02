import { expect } from 'chai';

import { adminUsername } from '../../data/user.js';
import { getCredentials, api, request, credentials, group, apiPrivateChannelName } from '../../data/api-data.js';

function getRoomInfo(roomId) {
	return new Promise((resolve /* , reject*/) => {
		request
			.get(api('groups.info'))
			.set(credentials)
			.query({
				roomId,
			})
			.end((err, req) => {
				resolve(req.body);
			});
	});
}

describe('[AlertGroups]', function () {
	this.retries(0);
	let groupMessage = {};

	before((done) => getCredentials(done));

	it('should createAlertGroup', (done) => {
		request
			.post(api('groups.createAlertGroup'))
			.set(credentials)
			.send({
				name: apiPrivateChannelName,
				members: ['edi'],
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
	//  console.log(await getRoomInfo(group._id));
	//  await request
	//      .post(api('groups.notifySecurityDispatch'))
	//      .set(credentials)
	//      .send({
	//          roomId: group._id,
	//          members: ['edi'],
	//      })
	//      .expect('Content-Type', 'application/json')
	//      .expect(200)
	//      .expect((res) => {
	//          expect(res.body).to.have.property('success', true);
	//      })
	//      .end(done);
	// });
	it('should notify who canceled the notification', (done) => {
		request
			.post(api('groups.notifySecurityDispatch'))
			.set(credentials)
			.send({
				roomId: group._id,
				members: ['edi'],
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				// expect(res.body).to.have.nested.property('group._id');
				// expect(res.body).to.have.nested.property('group.name', apiPrivateChannelName);
				// expect(res.body).to.have.nested.property('group.t', 'p');
				// expect(res.body).to.have.nested.property('group.msgs', 0);
			})
			.end(done);
	});

	it('sending a message...', (done) => {
		request
			.post(api('chat.sendMessage'))
			.set(credentials)
			.send({
				message: {
					msg: 'Sample message',
					rid: group._id,
				},
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				groupMessage = res.body.message;
			})
			.end(done);
	});

	it('should return alert status ', (done) => {
		request
			.get(api('groups.alertStatus'))
			.set(credentials)
			.query({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
	it('should cancel alert notification', (done) => {
		request
			.post(api('groups.notifyCancel'))
			.set(credentials)
			.send({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
	it('/groups.invite', async () => {
		const roomInfo = await getRoomInfo(group._id);

		return request
			.post(api('groups.invite'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'mona',
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('group._id');
				expect(res.body).to.have.nested.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.nested.property('group.t', 'p');
				expect(res.body).to.have.nested.property('group.msgs', roomInfo.group.msgs + 1);
			});
	});
	it('should return group basic structure', async () => {
		const roomInfo = await getRoomInfo(group._id);
		return request
			.get(api('groups.info'))
			.set(credentials)
			.query({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.nested.property('group._id');
				expect(res.body).to.have.nested.property('group.name');
				expect(res.body).to.have.nested.property('group.t', 'p');
				expect(res.body).to.have.nested.property('group.msgs', roomInfo.group.msgs);
			});
	});

	it('REACTing with last message', (done) => {
		request
			.post(api('chat.react'))
			.set(credentials)
			.send({
				emoji: ':squid:',
				messageId: groupMessage._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
	it('STARring last message', (done) => {
		request
			.post(api('chat.starMessage'))
			.set(credentials)
			.send({
				messageId: groupMessage._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
	it('PINning last message', (done) => {
		request
			.post(api('chat.pinMessage'))
			.set(credentials)
			.send({
				messageId: groupMessage._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
	it('should return group structure with "lastMessage" object including pin, reaction and star(should be an array) infos', (done) => {
		request
			.get(api('groups.info'))
			.set(credentials)
			.query({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('group').and.to.be.an('object');
				const { group } = res.body;
				expect(group).to.have.property('lastMessage').and.to.be.an('object');
				expect(group.lastMessage).to.have.property('reactions').and.to.be.an('object');
				expect(group.lastMessage).to.have.property('pinned').and.to.be.a('boolean');
				expect(group.lastMessage).to.have.property('pinnedAt').and.to.be.a('string');
				expect(group.lastMessage).to.have.property('pinnedBy').and.to.be.an('object');
				expect(group.lastMessage).to.have.property('starred').and.to.be.an('array');
			})
			.end(done);
	});
	it('should return all groups messages where the last message of array should have the "star" array with USERS star ONLY', (done) => {
		request
			.get(api('groups.messages'))
			.set(credentials)
			.query({
				roomId: group._id,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('messages').and.to.be.an('array');
				const { messages } = res.body;
				const lastMessage = messages.filter((message) => message._id === groupMessage._id)[0];
				expect(lastMessage).to.have.property('starred').and.to.be.an('array');
				expect(lastMessage.starred[0]._id).to.be.equal(adminUsername);
			})
			.end(done);
	});
	it('should return all groups messages where the last message of array should have the "star" array with USERS star ONLY even requested with count and offset params', (done) => {
		request
			.get(api('groups.messages'))
			.set(credentials)
			.query({
				roomId: group._id,
				count: 5,
				offset: 0,
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('messages').and.to.be.an('array');
				const { messages } = res.body;
				const lastMessage = messages.filter((message) => message._id === groupMessage._id)[0];
				expect(lastMessage).to.have.property('starred').and.to.be.an('array');
				expect(lastMessage.starred[0]._id).to.be.equal(adminUsername);
			})
			.end(done);
	});
});
