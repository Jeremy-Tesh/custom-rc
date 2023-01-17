import { Mongo } from 'meteor/mongo';

const CallQueue = new Mongo.Collection(null);

export { CallQueue };
