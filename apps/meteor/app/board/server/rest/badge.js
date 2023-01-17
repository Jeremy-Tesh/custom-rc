import bip39 from 'bip39';
import base58 from 'bs58';
import nacl from 'tweetnacl';
import moment from 'moment';

import { API } from '../../../api/server/api';
import { Users, Rooms, Uploads } from '../../../models/server';
import Wallet from '../wallet/wallet';
import Badge from '../wallet/badge';
import resumeutil from './resumeutil';

const totalBadgesLimit = 5;

const badgeTemplate = [
	{
		key: 'Vitality',
		data: [
			[
				{ id: 'VI001', image: 'https://mongrov.com/badges/badge1.jpg', title: 'completed' },
				{ id: 'VI002', image: 'https://mongrov.com/badges/badge2.jpg', title: 'challenge' },
			],
		],
	},
	{
		key: 'Intelligence',
		data: [
			[
				{ id: 'IN001', image: 'https://mongrov.com/badges/badge3.jpg', title: 'logical' },
				{ id: 'IN002', image: 'https://mongrov.com/badges/badge4.jpg', title: 'idea' },
			],
		],
	},
	{
		key: 'Humanity',
		data: [
			[
				{ id: 'HU001', image: 'https://mongrov.com/badges/badge5.jpg', title: 'kindness' },
				{ id: 'HU002', image: 'https://mongrov.com/badges/badge6.jpg', title: 'justice' },
			],
		],
	},
	{
		totalBadgesLimit: 0,
		totalBadgesGiven: 0,
	},
];

API.v1.addRoute('getBadgeList', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// const { sort, fields, query } = this.parseJsonQuery();
		// Ex. /mgbd.getBoards?query={ "title": { "$regex": "testboard" } }
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const fromuid = this.userId;
		const badgeList = Badge.find({ fromuid, ts: { $gte: startOfWeek } }, {
			sort: { ts: -1 } }).count();
		// console.push('badgeList', badgeList);
		// console.log('totalBadgesLimit',totalBadgesLimit);
		badgeTemplate.pop(); // remove last badges details
		badgeTemplate.push({
			totalBadgesLimit,
			totalBadgesGiven: badgeList,
		});

		return API.v1.success(badgeTemplate);
	},
});


API.v1.addRoute('getLeaderData', { authRequired: true }, {
	get() {
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const topuserlist = Promise.await(Badge.model.rawCollection().aggregate([
			{
				$match: {
					ts: { $gte: startOfWeek },
				},
			},
			{
				$group: {
					_id: '$touid',
					badgecount: { $sum: 1 },
				},
			},
			{
				$sort: {
					badgecount: -1,
				},

			}, {
				$limit: 25,
			},

		]).toArray());
		// dirty fix to be handled in query
		const newtopuserlist = topuserlist.map(({ _id: uid, ...rest }) => ({ uid, ...rest }));
		// const top10List = Badge.model.aggregate([{ $project: { 'ts~~~day': { $let: { vars: { column: '$ts' },
		// 	in: { ___date: { $dateToString: { format: '%Y-%m-%d', date: '$$column' } } } } },
		// touid: '$touid' } }, { $match: { 'ts~~~day': { $gte: { ___date: '2020-02-14' },
		// 	$lte: { ___date: '2020-02-20' } } } }, { $project: { _id: '$_id', ___group: { touid: '$touid' } } },
		// { $group: { _id: '$___group', count: { $sum: 1 } } }, { $sort: { _id: 1 } },
		// { $project: { _id: false, touid: '$_id.touid', count: true } }, { $sort: { count: -1, touid: 1 } }, { $limit: 10 }]);

		// console.log(toplist);
		return API.v1.success(newtopuserlist);
	},
});

API.v1.addRoute('getNudgeList', { authRequired: true }, {
	get() {
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const topuserlist = Promise.await(Badge.model.rawCollection().aggregate([
			{
				$match: {
					ts: { $gte: startOfWeek },
				},
			},
			{
				$group: {
					_id: '$fromuid',
					badgecount: { $sum: 1 },
				},
			},
			{
				$sort: {
					badgecount: -1,
				},

			},

		]).toArray());
		// dirty fix to be handled in query
		const newtopuserlist = topuserlist.map(({ _id: uid, ...rest }) => ({ uid, ...rest }));
		newtopuserlist.push({
			totalBadgesLimit,
		});
		return API.v1.success(newtopuserlist);
	},
});

API.v1.addRoute('getLeaderSentData', { authRequired: true }, {
	get() {
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const topuserlist = Promise.await(Badge.model.rawCollection().aggregate([
			{
				$match: {
					ts: { $gte: startOfWeek },
				},
			},
			{
				$group: {
					_id: '$fromuid',
					badgecount: { $sum: 1 },
				},
			},
			{
				$sort: {
					badgecount: -1,
				},

			}, {
				$limit: 25,
			},

		]).toArray());
		// dirty fix to be handled in query
		const newtopuserlist = topuserlist.map(({ _id: uid, ...rest }) => ({ uid, ...rest }));
		// const top10List = Badge.model.aggregate([{ $project: { 'ts~~~day': { $let: { vars: { column: '$ts' },
		// 	in: { ___date: { $dateToString: { format: '%Y-%m-%d', date: '$$column' } } } } },
		// touid: '$touid' } }, { $match: { 'ts~~~day': { $gte: { ___date: '2020-02-14' },
		// 	$lte: { ___date: '2020-02-20' } } } }, { $project: { _id: '$_id', ___group: { touid: '$touid' } } },
		// { $group: { _id: '$___group', count: { $sum: 1 } } }, { $sort: { _id: 1 } },
		// { $project: { _id: false, touid: '$_id.touid', count: true } }, { $sort: { count: -1, touid: 1 } }, { $limit: 10 }]);

		// console.log(toplist);
		newtopuserlist.push({
			totalBadgesLimit,
		});
		return API.v1.success(newtopuserlist);
	},
});

API.v1.addRoute('getLeaderDetails', { authRequired: true }, {
	get() {
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const topuserlist = Promise.await(Badge.model.rawCollection().aggregate([
			{
				$match: {
					ts: { $gte: startOfWeek },
				},
			},
			{
				$group: {
					_id: { category: '$category', badgeId: '$badgeId', touid: '$touid' },
					count: { $sum: 1 },
				},
			},
			{
				$sort: {
					count: -1,
				},

			}, {
				$group: {
					_id: { category: '$_id.category', badgeId: '$_id.badgeId' },
					user: {
						$push: {
							uid: '$_id.touid',
							bcount: '$count',
						},
					},
					bcount: { $sum: '$count' },
				},
			}, {
				$project: {
					details: { $slice: ['$user', 3] },
				},
			},
		]).toArray());
		return API.v1.success(topuserlist);
	},
});


API.v1.addRoute('sendBadge', { authRequired: true }, {
	post() {
		const fromuid = this.userId;
		const startOfWeek = new Date(moment(new Date()).startOf('week'));

		const badgeCount = Badge.find({ fromuid, ts: { $gte: startOfWeek } }, {
			sort: { ts: -1 } }).count();
		if (badgeCount >= totalBadgesLimit) {
			return API.v1.failure('max badges sent for this week');
		}

		const { userId, badgeId, comments, category } = this.bodyParams;
		const touid = userId;
		if (badgeId && touid && touid !== fromuid) {
			// if (badgeList[touid]) {
			// 	const tempBadgeObjList = badgeList[touid];
			// 	tempBadgeObjList.push({ badgeId, comments, fromuid: this.userId, category, ts: new Date() });
			// } else {
			// 	const tempBadgeObjList = [];
			// 	tempBadgeObjList.push({ badgeId, comments, fromuid: this.userId, category, ts: new Date() });
			// 	badgeList[touid] = tempBadgeObjList;
			// }
			Badge.insert({
				touid,
				fromuid,
				comments,
				category,
				badgeId,
			});
			const badgeList = Badge.find({ fromuid, ts: { $gte: startOfWeek } }, {
				sort: { ts: -1 } }).count();
			return API.v1.success({
				totalBadgesLimit,
				totalBadgesGiven: badgeList,
			});
		}
		return API.v1.failure('please check input');
	},
});

API.v1.addRoute('getUserBadges/:userId', { authRequired: true }, {
	get() {
		const uid = this.urlParams.userId;
		const startOfWeek = new Date(moment(new Date()).startOf('week'));
		const badgeList = Badge.find({ touid: uid, ts: { $gte: startOfWeek } }, {
			sort: { ts: -1 } }).fetch();
		let userBadges = badgeList;
		if (userBadges) {
			userBadges.totalBadges = badgeList.length;
		} else {
			userBadges = { totalBadges: 0 };
		}

		return API.v1.success(userBadges);
	},
});


API.v1.addRoute('userWallet', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// const { sort, fields, query } = this.parseJsonQuery();
		// Ex. /mgbd.getBoards?query={ "title": { "$regex": "testboard" } }
		const uid = this.userId;
		let walletObj = Wallet.findOne({ userId: uid });
		if (walletObj === undefined) {
			const mnemonicGenerated = bip39.generateMnemonic();
			const seed = bip39.mnemonicToSeed(mnemonicGenerated).slice(0, 32);
			const naclKey = nacl.sign.keyPair.fromSeed(seed);
			const pkey = base58.encode(naclKey.publicKey);
			walletObj = {
				userId: uid,
				mnemonics: mnemonicGenerated,
				// privatekey: masterKey.privateKey,
				publickey: pkey,
			};
			Wallet.insert({
				userId: uid,
				mnemonics: mnemonicGenerated,
				privatekey: '',
				publickey: pkey,
			});
		} else if (!walletObj.publickey || walletObj.publickey.length <= 0) {
			const seed = bip39.mnemonicToSeed(walletObj.mnemonics).slice(0, 32);
			const naclKey = nacl.sign.keyPair.fromSeed(seed);
			const pkey = base58.encode(naclKey.publicKey);
			walletObj.publickey = pkey;
			Wallet.insert({
				userId: uid,
				mnemonics: walletObj.mnemonics,
				privatekey: '',
				publickey: pkey,
			});
		}
		return API.v1.success(walletObj);
	},
});

API.v1.addRoute('userWallet/:userId', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// const { sort, fields, query } = this.parseJsonQuery();
		// Ex. /mgbd.getBoards?query={ "title": { "$regex": "testboard" } }
		if (this.urlParams.userId) {
			const uid = this.urlParams.userId;
			let walletObj = Wallet.findOne({ userId: uid });
			if (walletObj === undefined) {
				const mnemonicGenerated = bip39.generateMnemonic();
				const seed = bip39.mnemonicToSeed(mnemonicGenerated).slice(0, 32);
				const naclKey = nacl.sign.keyPair.fromSeed(seed);
				const pkey = base58.encode(naclKey.publicKey);
				walletObj = {
					userId: uid,
					mnemonics: mnemonicGenerated,
					// privatekey: masterKey.privateKey,
					publickey: pkey,
				};
				Wallet.insert({
					userId: uid,
					mnemonics: mnemonicGenerated,
					privatekey: '',
					publickey: pkey,
				});
			} else if (!walletObj.publickey || walletObj.publickey.length <= 0) {
				const seed = bip39.mnemonicToSeed(walletObj.mnemonics).slice(0, 32);
				const naclKey = nacl.sign.keyPair.fromSeed(seed);
				const pkey = base58.encode(naclKey.publicKey);
				walletObj.publickey = pkey;
				Wallet.insert({
					userId: uid,
					mnemonics: walletObj.mnemonics,
					privatekey: '',
					publickey: pkey,
				});
			}
			return API.v1.success(walletObj);
		}
		return API.v1.failure('The "userId" param is required!');
	},
});

API.v1.addRoute('userDetailFromPublicId/:publicId', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// const { sort, fields, query } = this.parseJsonQuery();
		// Ex. /mgbd.getBoards?query={ "title": { "$regex": "testboard" } }
		if (this.urlParams.publicId) {
			const pid = this.urlParams.publicId;
			const walletObj = Wallet.findOne({ publickey: pid });
			if (walletObj === undefined) {
				return API.v1.success('No user found');
			}
			const userObj = Users.findOneById(walletObj.userId);
			if (userObj) {
				return API.v1.success({
					publickey: pid,
					_id: userObj._id,
					username: userObj.username,
					name: userObj.name,
					status: userObj.status,
				});
			}
			return API.v1.success('No user found');
		}
		return API.v1.failure('The "userId" param is required!');
	},
});

API.v1.addRoute('profile/:uname', {
	get() {
		const username = this.urlParams.uname;
		if(!username)
			return API.v1.failure('The "username" is required');
		// Meteor.call('getUserProfileDetails', { username: userstring }, function(error, userobj) {
		const userobj = Users.findOneByUsernameIgnoringCase(username, { fields: { _id: 1, name: 1, username: 1, bio: 1, statusText: 1, customFields: 1, roles: 1, emails: 1, statusLivechat: 1 } });
		if (userobj && !userobj.roles.includes('customer')) {

			var generatedJson = {
					$schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
					basics: resumeutil.generateContactSection(userobj),
					work: userobj.customFields ? resumeutil.getJsonData(userobj.customFields.Work) : [],
					volunteer: [],
					education: userobj.customFields ? resumeutil.getJsonData(userobj.customFields.Education) : [],
					awards: [],
					publications: [],
					skills: userobj.customFields ? resumeutil.getJsonData(userobj.customFields.Skills) : [],
					languages: [],
					interests: resumeutil.generateInterestsSection(userobj),
					references: []
			};
			return API.v1.success(generatedJson)
		}
		return API.v1.failure('The "user" not found');
	},
});

API.v1.addRoute('profile.files/:uname', {
	get() {
		const username = this.urlParams.uname;
		if(!username)
			return API.v1.failure('The "username" is required');
			const userobj = Users.findOneByUsernameIgnoringCase(username, { fields: { _id: 1, name: 1, username: 1} });
			if (!userobj) {
				return API.v1.failure('The "user" not found');
			}
			const addUserObjectToEveryObject = (file) => {
				if (file.userId) {
					file = this.insertUserObject({ object: file, userId: file.userId });
				}
				return file;
			};
			const query = {
				t: 'd',
				usersCount: 1,
				uids: userobj._id,
			};
			const room = Rooms.findOne(query);
			if (room) {
				const { offset, count } = this.getPaginationItems();
				const { sort, fields, query } = this.parseJsonQuery();
		
				const ourQuery = Object.assign({}, query, { rid: room._id });
		
				const files = Uploads.find(ourQuery, {
					sort: sort || { name: 1 },
					skip: offset,
					limit: count,
					fields,
				}).fetch();
		
				return API.v1.success({
					files: files.map(addUserObjectToEveryObject),
					count: files.length,
					offset,
					total: Uploads.find(ourQuery).count(),
				});
			}
			return API.v1.success({});
	},
});


