module.exports = (sequelize, DataTypes) => {
	return sequelize.define('workers', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
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