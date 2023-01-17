import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import Cards from '../models/cards';
import Board from '../models/boards';
import { API } from '../../../api';
import { Rooms, Subscriptions, Users } from '../../../models';

API.v2.addRoute('bookings', {
	post() {
		// workaround for duplicate booking
		if(!this.bodyParams.project_id){
			Meteor.call('board:createBooking', this.bodyParams, (err, res) => {
				if (err) {
					console.log(err);
				} else {
					return API.v2.success(res);
				}
			});
		}
	},
});


API.v2.addRoute('availability', {
	post() {
		let currentDate = new Date();
		let endDate = new Date();
		let name = '';
		let userObj;
		if (this.bodyParams.resources) {
			const uid = this.bodyParams.resources[0];
			userObj = Users.findOneById(uid);
			// username =  userObj.username,
			const offset = userObj.utcOffset;
			name = userObj.name;
			endDate = moment(new Date());
			endDate = endDate.utcOffset(offset);
			endDate.add(4, 'weeks');
			// currentDate = moment.tz(new Date(), this.bodyParams.output_timezone);
			currentDate = moment(new Date());
			currentDate.utcOffset(offset);
		}
		const availableIntervals = (startString, endString) => {
			const result = [];
			const start = startString;
			const end = endString;
			end.hour(18);
			end.second(0);
			end.millisecond(0);
			start.second(0);
			start.millisecond(0);
			start.minutes(Math.ceil(start.minutes() / 30) * 30);
			// round starting minutes up to nearest 15 (12 --> 15, 17 --> 30)
			// note that 59 will round up to 60, and moment.js handles that correctly
			const current = start;

			const query = {
				t: 'd',
				usersCount: 1,
				uids: userObj._id,
			};
			let room = Rooms.findOne(query);
			if (!room) {
				room = createRoom('d', null, null, [user], null, {}, { creator: userObj._id });
				//  room = Rooms.findOne(query);
			}
			const bdtitle = room.usernames.join('-');
			const boardObj = Board.findOne({ title: bdtitle });
			while (current <= end) {
				const startDateTime = current;
				const endDateTime = current;
				if (startDateTime) {
					const tempstart = startDateTime.clone();
					tempstart.add(2, 'minute');
					const query = {
						boardId: boardObj._id,
						archived: false,
						startAt: { $lt: new Date(tempstart.format()) },
						endAt: {
							$gte: new Date(tempstart.format()),
						},
					};
						// to be optimized
					const cards = Cards.find(query, { fields: { _id: 1, startAt: 1, endAt: 1 } }).fetch();
					if (!cards || cards.length <= 0) {
						if (startDateTime && endDateTime && current.hour() >= 9 && endDateTime.hour() < 18) {
							const tempstarttime = moment.tz(startDateTime, this.bodyParams.output_timezone);
							endDateTime.add(30, 'minute');
							const tempendtime = moment.tz(endDateTime, this.bodyParams.output_timezone);
							result.push({
								start: tempstarttime.format(),
								end: tempendtime.format(),
								resources: [
									{
										id: this.bodyParams.resources[0],
										name,
										timezone: 'UTC',
									},
								],
							});
						} else {
							if (endDateTime.day() === 0 || endDateTime.day() === 6) {
								endDateTime.add(1, 'days');
							} else {
								endDateTime.add(30, 'minute');
							}
						}
					} else {
						if (endDateTime.day() === 0 || endDateTime.day() === 6) {
							endDateTime.add(1, 'days');
						} else {
							endDateTime.add(30, 'minute');
						}
					}
				}
			}
			return result;
		};
		const available = {
			data: availableIntervals(currentDate, endDate),
		};
		return API.v2.success(available);
	},
});

API.v2.addRoute('projects/embed/:id', {
	get() {
		const obj = JSON.parse('{"data":{"id":"0f44587a-328b-4ed4-9720-4042bf008c3b","name":"","slug":"a1-453","booking":{"graph":"instant"},"ui":{"availability_view":"agendaWeek","show_credits":false,"time_date_format":"12h-mdy-sun","localization":{"allocated_resource_prefix":"with","submit_button":"Book it","success_message":"We have received your booking and sent a confirmation to %s"},"display_name":"","avatar":""},"customer_fields":{"name":{"title":"Name","required":true,"prefilled":"","readonly":false},"email":{"title":"E-mail","required":true,"prefilled":"","readonly":false}},"app_key":"test_widget_key_uYS3hVvdYkufiiPV23XIW7Fl7TISRsXY"}}');
		return API.v2.success(obj);
	},
});