module.exports = (sequelize, DataTypes) => {
	return sequelize.define('workers', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		user_id: {
			type: DataTypes.STRING,
		},
		claim_stamp: {
			type: DataTypes.INTEGER,
		},
        worker_id: {
			type: DataTypes.STRING,
		},
	}, {
		timestamps: false,
	});
};