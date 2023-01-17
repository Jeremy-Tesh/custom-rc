/* eslint-disable no-useless-constructor */
/* eslint-disable no-empty-function */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import _ from 'underscore';

import { BaseDb } from '../../../models';


export class Base {
	constructor() {
	}

	setDBmodel = (dbmodel) => {
		this._db = new BaseDb(dbmodel, this);
		this.model = this._db.model;
		this.collectionName = this._db.collectionName;
		this.name = this._db.name;
		this.db = this;
		this.on = this._db.on;
		this.emit = this._db.emit;
		
	}

	get origin() {
		return '_db';
	}

	roleBaseQuery() {

	}

	findRolesByUserId(userId) {
		const query = this.roleBaseQuery(userId);
		return this.find(query, { fields: { roles: 1 } });
	}

	isUserInRole(userId, roleName, scope) {
		const query = this.roleBaseQuery(userId, scope);

		if (query == null) {
			return false;
		}

		query.roles = roleName;
		return !_.isUndefined(this.findOne(query, { fields: { roles: 1 } }));
	}

	addRolesByUserId(userId, roles, scope) {
		roles = [].concat(roles);
		const query = this.roleBaseQuery(userId, scope);
		const update = {
			$addToSet: {
				roles: { $each: roles },
			},
		};
		return this.update(query, update);
	}

	addMember(memberId, boardId) {
		const query = {
			_id: boardId,
		};
		const update = { $addToSet: {
			members: {
				userId: memberId,
				isAdmin: true,
				isActive: true,
				isCommentOnly: false,
			},
		} };

		return this.update(query, update);
	}

	removeRolesByUserId(userId, roles, scope) {
		roles = [].concat(roles);
		const query = this.roleBaseQuery(userId, scope);
		const update = {
			$pullAll: {
				roles,
			},
		};
		return this.update(query, update);
	}

	findUsersInRoles() {
		throw new Meteor.Error('overwrite-function', 'You must overwrite this function in the extended classes');
	}

	arrayToCursor(data) {
		return {
			fetch() {
				return data;
			},
			count() {
				return data.length;
			},
			forEach(fn) {
				return data.forEach(fn);
			},
		};
	}

	setUpdatedAt(...args/* record, checkQuery, query*/) {
		return this._db.setUpdatedAt(...args);
	}

	find(...args) {
		try {
			return this[this.origin].find(...args);
		} catch (e) {
			console.error('Exception on find', e, ...args);
		}
	}

	findOne(...args) {
		try {
			return this[this.origin].findOne(...args);
		} catch (e) {
			console.error('Exception on find', e, ...args);
		}
	}

	findOneById(...args) {
		try {
			return this[this.origin].findOneById(...args);
		} catch (e) {
			console.error('Exception on find', e, ...args);
		}
	}

	findOneByIds(ids, options, ...args) {
		check(ids, [String]);

		try {
			return this[this.origin].findOneByIds(ids, options);
		} catch (e) {
			console.error('Exception on find', e, [ids, options, ...args]);
		}
	}

	insert(...args/* record*/) {
		return this._db.insert(...args);
	}

	update(...args/* query, update, options*/) {
		return this._db.update(...args);
	}

	upsert(...args/* query, update*/) {
		return this._db.upsert(...args);
	}

	remove(...args/* query*/) {
		return this._db.remove(...args);
	}

	insertOrUpsert(...args) {
		return this._db.insertOrUpsert(...args);
	}

	allow(...args) {
		return this._db.allow(...args);
	}

	deny(...args) {
		return this._db.deny(...args);
	}

	ensureIndex(...args) {
		return this._db.ensureIndex(...args);
	}

	dropIndex(...args) {
		return this._db.dropIndex(...args);
	}

	tryEnsureIndex(...args) {
		return this._db.tryEnsureIndex(...args);
	}

	tryDropIndex(...args) {
		return this._db.tryDropIndex(...args);
	}
}
