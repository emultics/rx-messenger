const formidable = require('formidable');
const validator = require('validator');
const registerModel = require('../models/register');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const console = require('console');
exports.userRegister = (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    const { userName, email, password, confirmPassword } = fields;
    const error = [];
    if (!userName) {
      error.push('Please provide your user name');
    }
    if (!email) {
      error.push('Please provide your Email');
    }
    if (email && !validator.isEmail(email)) {
      error.push('Please provide your Valid Email');
    }
    if (!password) {
      error.push('Please provide your Password');
    }
    if (!confirmPassword) {
      error.push('Please provide your confirm Password');
    }
    if (password && confirmPassword && password !== confirmPassword) {
      error.push('Your Password and Confirm Password not same');
    }
    if (password && password.length < 6) {
      error.push('Please provide password mush be 6 character');
    }

    if (error.length > 0) {
      res.status(400).json({
        error: {
          errorMessage: error,
        },
      });
    }

    try {
      const checkUser = await registerModel.findOne({
        email: email,
      });
      if (checkUser) {
        res.status(404).json({
          error: {
            errorMessage: ['Your email already exist!'],
          },
        });
      } else {
        const userCreate = await registerModel.create({
          userName,
          email,
          password: await bcrypt.hash(password, 10),
        });

        const token = jwt.sign(
          {
            id: userCreate._id,
            email: userCreate.email,
            userName: userCreate.userName,
            registerTime: userCreate.createdAt,
          },
          process.env.SECRET,
          {
            expiresIn: process.env.TOKEN_EXP,
          }
        );

        const options = {
          expires: new Date(
            Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000
          ),
        };

        res.status(201).cookie('authToken', token, options).json({
          successMessage: 'Your Register Successful',
          token,
        });
      }
    } catch (e) {
      res.status(500).json({
        error: {
          errorMessage: e,
        },
      });
    }
  });
};
