import { DataTypes, literal } from 'sequelize';
import sequelize from '../config/database';

const { STRING, INTEGER, BOOLEAN, JSONB } = DataTypes;

const auditLogs = sequelize.define(
  'audit_logs',
  {
    user_id: { type: INTEGER, allowNull: false },
    ip_address: { type: STRING, allowNull: false },
    browser: { type: STRING, allowNull: false },
    service: { type: STRING, allowNull: false },
    resource: { type: STRING, allowNull: false },
    action: { type: STRING, allowNull: false },
    document: { type: STRING, allowNull: false },
    payload: { type: JSONB, allowNull: false },
    is_delete: { type: BOOLEAN, defaultValue: false },
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

export default auditLogs;
