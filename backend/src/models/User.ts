import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.config";

export class User extends Model {
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
  }
);