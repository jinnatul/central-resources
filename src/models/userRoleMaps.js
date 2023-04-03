import { DataTypes, literal } from 'sequelize';
import sequelize from '../config/database';

const { INTEGER, BOOLEAN } = DataTypes;

const userRoleMaps = sequelize.define(
  'user_role_maps',
  {
    user_id: { type: INTEGER, allowNull: false },
    role_id: { type: INTEGER, allowNull: false },
    is_deleted: { type: BOOLEAN, defaultValue: false },
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

export default userRoleMaps;
