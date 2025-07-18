const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const register = asyncHandler(async (req, res) => {
  //Destructuing the inputs from req.body
  const { fullName, email, password, registerToken } = req.body;

  if (registerToken !== process.env.REGISTER_TOKEN) {
    return res.status(403).json({
      message: "Access Denied",
    });
  }

  //Verifying the email address inputed is not used already
  const verifyEmail = await userModel.findOne({ email: email });
  try {
    if (verifyEmail) {
      return res.status(403).json({
        message: "Email already used",
      });
    } else {
      //generating userId
      const userId = uuidv4();
      //using bcrypt to hash the password sent from the user
      bcrypt.hash(password, 10).then((hash) => {
        //Registering the user
        const user = new userModel({
          userId: userId,
          fullName: fullName,
          email: email,
          password: hash,
        });

        //saving the data to the mongodb user collection
        user
          .save()
          .then((response) => {
            return res.status(201).json({
              message: "user successfully created!",
              result: response,
              success: true,
            });
          })
          .catch((error) => {
            res.status(500).json({
              error: error,
            });
          });
      });
    }
  } catch (error) {
    return res.status(412).send({
      success: false,
      message: error.message,
    });
  }
});

const login = asyncHandler(async (req, res) => {
  //Destructing the inputs from req.body
  const { email, password } = req.body;

  try {
    //verifying that the user with the email exist or not
    const user = await userModel.findOne({ email: email });
    
    if (!user) {
      //if user does not exist responding Authentication Failed
      return res.status(401).json({
        message: "Authentication Failed",
        success: false,
      });
    }

    /*
    Then compare the password from the req.body and the hased password on the database 
    using the bcrypt.compare built in function
    */
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Authentication Failed",
        success: false,
      });
    }

    // If we reach here, authentication is successful
    let jwtToken = jwt.sign(
      {
        email: user.email,
        userId: user.userId,
      },
      //Signing the token with the JWT_SECRET in the .env
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    
    return res.status(200).json({
      accessToken: jwtToken,
      //I like to send the userId of the user that loggedin in order to fetch his data and display
      userId: user.userId,
      message: "Authentication Successful",
      success: true,
    });
  } catch (err) {
    return res.status(401).json({
      message: err.message,
      success: false,
    });
  }
});

const userProfile = asyncHandler(async (req, res, next) => {
  //Destructing id from the req.params
  const { id } = req.params;

  try {
    //verifying if the user exist in the database
    const verifyUser = await userModel.findOne({ userId: id });
    if (!verifyUser) {
      return res.status(403).json({
        message: "user not found",
        success: false,
      });
    } else {
      return res.status(200).json({
        messgae: `user ${verifyUser.fullName}`,
        success: true,
      });
    }
  } catch (error) {
    return res.status(401).json({
      sucess: false,
      message: error.message,
    });
  }
});

const users = asyncHandler(async (req, res) => {
  //Fetching all users from database
  try {
    const users = await userModel.find();
    return res.status(200).json({
      data: users,
      sucess: true,
      message: "users list",
    });
  } catch (error) {
    return res.status(401).json({
      sucess: false,
      message: error.message,
    });
  }
});

module.exports = {
  register,
  login,
  userProfile,
  users,
};
