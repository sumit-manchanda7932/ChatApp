

const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const User = require("../models/user");
const crypto = require("crypto");
const mailService=require("../services/mailer");
const MailTemplates=require("../Templates/Mail/Mailtemplates");
const {promisify}=require("util");
const nodemailer = require('nodemailer');
const filterObj = require("../utils/filterObj");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"});

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// Register new user

exports.register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email"
  );
  const existing_user = await User.findOne({ email: email });

  if (existing_user && existing_user.verified) {
    res.status(400).json({
      status: "error",
      message: "Email is already in use ,Please login",
    });
  } else if (existing_user) {
    const updated_user = await User.findOneAndUpdate(
      { email: email },
       filteredBody ,
      { new: true, validateModifiedOnly: true }
    );
    updated_user.password=password;
    await updated_user.save({ new: true, validateModifiedOnly: true });
    req.userId = existing_user._id;
    next();
  } else {
    const new_user = await User.create(filteredBody);
    new_user.password=password;
    await new_user.save({ new: true, validateModifiedOnly: true });
    req.userId = new_user._id;
    next();
  }
};

exports.sendOTP = async (req, res, next) => {
  const { userId } = req;
  const user = await User.findOne({ _id: userId });

  const new_otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

     const otp_expiry_time = Date.now() + 10 * 60 * 1000;

    const new_user= await User.findByIdAndUpdate(userId, {
        otp_expiry_time
    }, { new: true, validateModifiedOnly: true });

    new_user.otp=new_otp.toString(),
    await new_user.save({ new: true, validateModifiedOnly: true });

  // TODO=>Send Mail 

  const message = {
    from : process.env.EMAIL,
    to : user.email,
    subject: "Account Verification for Your Chat Application",
    html: MailTemplates.otp(user.firstName,new_otp),
}
const transporter = mailService.ConfigMail();

  transporter.sendMail(message).then(() => {
    return res.status(201).json({
        status:"success",
        message: "Mail sent successfully"
    })
}).catch((error) => {
    return res.status(500).json({ error })
})

};

exports.verifyOTP = async (req, res, next) => {
  // Verify OTP and update user record accordingly
  const { email, otp } = req.body;
  const user = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Email is Invalid or OTP expired",
    });
  }
  if (!(await user.correctOTP(otp, user.otp))) {
    res.status(400).json({
      status: "error",
      message: "OTP is incorrect",
    });
  }
  user.verified = true;
  user.otp = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);

  res.status(200).json({
    status: "Success",
    message: "OTP verified successfully",
    token,
    user_id:user._id,
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both Email and Password are required",
    });
  }
  const user = await User.findOne({ email: email });
  if(!user){
    res.status(400).json({
      status: "error",
      message: "Email does not exist. Please Register ",
    });
    return;
  }
 else if ( !(await user.correctPassword(password, user.password))) {
    res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    });
    return;
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: "Success",
    message: "Logged in succesfully",
    token,
    about:user.about, 
    avatar:user.avatar,
    firstName:user.firstName,
    user_id:user._id,
  });
}; 

exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({
      status: "error",
      message: "There is no user with given email address",
    });
    return;
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(resetToken);
  const resetURL = `${process.env.BASE_URL}/auth/new-password/?token=${resetToken}`;
  try {

    // TODO --> Send email with reset url
    const message = {
        from : process.env.EMAIL,
        to : user.email,
        subject: "Password Reset for Your Chat Application",
        html: MailTemplates.resetPassword(resetURL,user.firstName),
    }
    const transporter = mailService.ConfigMail();
    
      transporter.sendMail(message).then(() => {
        return res.status(201).json({
            status:"success",
            message: "Mail sent successfully"
        })
    }).catch((error) => {
        return res.status(500).json({ error });
    })

  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "error",
      message: "There was an error sending the email,Please  try again later",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");  

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) { 
    res.status(400).json({
      status: "error",
      message: "Token is invalid or expired",
    });
    return; 
  }

  user.password=req.body.password;
  user.passwordConfirm=req.body.passwordConfirm;
  user.passwordResetToken=undefined;
  user.passwordResetExpires=undefined;
  await user.save();
// TODO --> Send an email to user informing about password reset    
const message = {
    from : process.env.EMAIL,
    to : user.email,
    subject: "Password Reset Successful for Your Chat Application",
    html: MailTemplates.resetPasswordInform(user.firstName),
}
const transporter = mailService.ConfigMail();

  transporter.sendMail(message).then(() => {
  const token = signToken(user._id);
  res.status(200).json({
    status: "Success",
    message: "Password Reseted successfully",
    token,
  }); 
}).catch((error) => {
    return res.status(500).json({ error })
})

  

};

exports.protect = async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }else{
        res.status(400).json({
            status: "error",
            message: "You are not logged In! Please log in to access",
          });
          return;
    }
  
    
    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    console.log(decoded);
  
    // 3) Check if user still exists
  
    const this_user = await User.findById(decoded.userId);
    if (!this_user) {
      res.status(400).json({
        status:"error",
        message: "The user belonging to this token does no longer exists.",
      });
    }

    if (this_user.changedPasswordAfter(decoded.iat)) {
         res.status(400).json({
            status:"error",
          message: "User recently changed password! Please log in again.",
        });
      }

      req.user=this_user;
      next();
}

