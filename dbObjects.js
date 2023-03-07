const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
const UserItems = require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);
const UserWorkers = require('./models/UserWorkers.js')(sequelize, Sequelize.DataTypes);
const Workers = require('./models/Workers.js')(sequelize, Sequelize.DataTypes);
const WorkerShop = require('./models/WorkerShop.js')(sequelize, Sequelize.DataTypes);
const Storage = require('./models/Storage') (sequelize, Sequelize.DataTypes)
const aceslib = require('../aceslib');

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });
UserWorkers.belongsTo(WorkerShop, { foreignKey: 'item_id', as: 'worker' });

/* eslint-disable-next-line func-names */
Users.prototype.addItem = async function(item) {
	const userItem = await UserItems.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	console.log("<====================>")
	console.log("Checking for: ")
	console.log(userItem)
	console.log("<====================>")

	if (userItem != null) {
		userItem.amount += 1;
		userItem.save();
		console.log("Item Exist: Success")
		console.log("<====================>")
		return "Item Exist: Success"
	}
	else {
		UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
		console.log("Item Created: Success")
		console.log("<====================>")
		return "Item Created: Success"
	}
};

Users.prototype.addWorker = async function(worker) {
	const userWorker = await UserWorkers.findOne({
		where: { user_id: this.user_id, item_id: worker.id },
	});

	if (userWorker != null) {
		userWorker.amount += 1;
		return userWorker.save();
	}

	return UserWorkers.create({ user_id: this.user_id, item_id: worker.id, amount: 1 });
};

/* eslint-disable-next-line func-names */
Users.prototype.removeItem = async function(item) {
	const userItem = await UserItems.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	if (userItem) {
		userItem.amount -= 1;
		if (userItem.amount == 0){
			userItem.destroy({ where: { amount: 0 } })
		}
		return userItem.save();
	}
};

Users.prototype.removeWorker = async function(worker) {
	const userWorker = await UserWorkers.findOne({
		where: { user_id: this.user_id, item_id: worker.id },
	});

	if (userWorker) {
		userWorker.amount -= 1;
		if (userWorker.amount == 0){
			userWorker.destroy({ where: { amount: 0 } })
		}
		return userWorker.save();
	}
};

Users.prototype.undeployWorker = async function(worker) {
	const Worker = await Workers.findOne({
		where: { user_id: this.user_id, worker_id: worker.name },
	});

	if (Worker != null) {
		console.log(Worker);
		console.log(Worker.id);
		Worker.destroy({ where: { id: Worker.id } })
		return Worker.save();
	}
};

/* eslint-disable-next-line func-names */
Users.prototype.getItems = function() {
	return UserItems.findAll({
		where: { user_id: this.user_id },
		include: ['item'],
	});
};

Users.prototype.getWorkers = function() {
	return UserWorkers.findAll({
		where: { user_id: this.user_id },
		include: ['worker'],
	});
};




module.exports = { Users, CurrencyShop, UserItems, WorkerShop, Workers, Storage };