const { DataTypes, literal } = require('sequelize');
const sequelize = require('../config/database');
const userRoleMaps = require('../models/userRoleMaps');

const { STRING, DATE, BOOLEAN } = DataTypes;

const users = sequelize.define(
  'users',
  {
    f_name: { type: STRING, allowNull: false },
    l_name: { type: STRING, allowNull: false },
    email: { type: STRING, allowNull: false },
    phone: { type: STRING, allowNull: true },
    password: { type: STRING, allowNull: true },
    is_google: { type: BOOLEAN, defaultValue: false },
    otp: { type: STRING, allowNull: true },
    otp_expire: { type: DATE, allowNull: true },
    is_verified: { type: BOOLEAN, defaultValue: false },
    is_deleted: { type: BOOLEAN, defaultValue: false },
    mfa_secret: { type: STRING, allowNull: false },
    mfa_qr: { type: STRING, allowNull: false },
    mfa_enables: { type: BOOLEAN, defaultValue: false },
    reset_link: { type: STRING, allowNull: true },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    timestamps: true,
    SCHEMA: process.env.SCHEMA,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

users.hasOne(userRoleMaps, { as: 'role_info', foreignKey: 'user_id' });

module.exports = users;
