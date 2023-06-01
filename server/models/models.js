const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, required: true},
    password: {type: DataTypes.STRING, required: true},
    isActivated: {type: DataTypes.BOOLEAN, defaultValue: false},
    activationLink: {type: DataTypes.STRING}
})

const Token = sequelize.define('Token', {
    refreshToken: {type: DataTypes.STRING, required: true},
    userId: {type: DataTypes.INTEGER, required: true, references: {
            model: User,
            key: 'id',
        }}
})

const Soldier = sequelize.define('Soldier', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    surname: {type: DataTypes.STRING, required: true},
    name: {type: DataTypes.STRING, required: true},
    patronymic: {type: DataTypes.STRING, required: true},
    rank: {type: DataTypes.STRING, required: true},
    status: {type: DataTypes.STRING, required: true},
    startDate: {type: DataTypes.DATE, required: true},
    endDate: {type: DataTypes.DATE, required: true}
})

User.hasMany(Token, {foreignKey: 'userId'})
Token.belongsTo(User, {foreignKey: 'userId'})

module.exports = {
    User,
    Token
}