import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.config";

export class Appointment extends Model {
  public id!: number;
  public userId!: string;
  public doctorId!: string;
  public userInfo!: any;
  public doctorInfo!: any;
  public date!: string;
  public officeTime!: string;
  public status!: string;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userInfo: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    doctorInfo: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    officeTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Appointment",
  }
);