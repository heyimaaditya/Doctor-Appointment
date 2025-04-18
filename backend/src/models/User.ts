import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.config";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isDoctor: boolean;
  notification: any[];
  seenNotification: any[];
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "isAdmin" | "isDoctor" | "notification" | "seenNotification"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isAdmin!: boolean;
  public isDoctor!: boolean;
  public notification!: any[];
  public seenNotification!: any[];
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDoctor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notification: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    seenNotification: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);
