'use strict';
module.exports = (sequelize, DataTypes) => {
  let Trend = sequelize.define('Trend', {
    title: DataTypes.STRING,
    y_col: DataTypes.INTEGER,
    trendline_coef: DataTypes.FLOAT
  }, {});
  Trend.associate = function(models) {
    // associations can be defined here
    models.Trend.belongsTo(models.CsvData);
  };
  return Trend;
};
