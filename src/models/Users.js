import { DataTypes, literal } from "sequelize";
import sequelize from "../config/Database";
import UserRoleMaps from "../models/UserRoleMaps";

const { STRING, DATE, BOOLEAN } = DataTypes;

const Users = sequelize.define(
  "users",
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
    is_delete: { type: BOOLEAN, defaultValue: false },
    mfa_secret: { type: STRING, allowNull: false },
    mfa_qr: { type: STRING, allowNull: false },
    mfa_enables: { type: BOOLEAN, defaultValue: false },
    reset_link: { type: STRING, allowNull: true },
    created_at: {
      type: "TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "TIMESTAMP",
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    timestamps: true,
    schema: process.env.Schema,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Users.hasOne(UserRoleMaps, { as: "role_info", foreignKey: "user_id" });

export default Users;
