'use strict';
module.exports = (sequelize, DataTypes) => {
  let CsvData = sequelize.define('CsvData', {
    path: DataTypes.STRING,
    title: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    interval: DataTypes.INTEGER,
    x_col: DataTypes.INTEGER
  }, {});
  CsvData.associate = function(models) {
    // associations can be defined here
  };
  return CsvData;
};
