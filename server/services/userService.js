const models = require('../models/models')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../services/mailService')
const tokenService = require('../services/tokenService')
const UserDto = require('../dtos/userDto')
const ApiError = require('../exceptions/apiError')

class UserService{
    async registration(email, password){
        const candidate = await models.User.findOne({where: {email}})

        if (candidate){
            throw ApiError.BadRequest(`User with ${email} already exists`)
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const user = await models.User.create({
            email,
            password: hashPassword,
            activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({userId: userDto.id})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async activate(activationLink){
        const user = await models.User.findOne({where: {activationLink}})
        if (!user){
            throw ApiError.BadRequest('Invalid activation link')
        }
        user.isActivated = true
        await user.save()
    }

    async login(email, password){
        const user = await models.User.findOne({where: {email}})
        if (!user){
            throw ApiError.BadRequest(`User with email: ${email} doesn't exist`)
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals){
            throw ApiError.BadRequest('Incorrect password')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken){
        if (!refreshToken){
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError()
        }

        const user = await models.User.findOne({id: userData.id})
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async getAllUsers(){
        const users = await models.User.findAll()
        return users
    }
}

module.exports = new UserService()