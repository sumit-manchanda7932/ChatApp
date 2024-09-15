const Mailgen = require('mailgen');

exports.otp=(name,otp)=>{
    
    const MailGenerator = new Mailgen({
        theme: "default",
        product : {
            name: "Tawk",
            link:"https://mailgen.js/"
        }
    })

    const response = {
        body: {
          name: name,
          intro: "Thank you for choosing Our Chat Application!",
          action:[
            {
            instructions: "To verify your email, enter the following OTP code:",
            button: {
              color: "#22BC66", 
              text: otp,
            },
          },
          {
            instructions: "Note: This OTP is valid for only 10 mins",
          }
        ],
          outro: "If you did not request this verification, please ignore this email.",
        },
      };

    const mail = MailGenerator.generate(response);
    return mail;

}

exports.resetPassword=(resetURL,name)=>{

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      
      name: "Tawk",
      link: "https://yourchatapp.com",
    },
  });
  
 
   
    const response = {
      body: {
        name: name,
        intro: "You have requested a password reset for your account.",
        action: {
          instructions: "To reset your password, click the following link:",
          button: {
            color: "#22BC66", 
            text: "Reset Password",
            link: resetURL,
          },
        },
        outro: "If you did not request a password reset, please ignore this email.",
      },
    };
  
   
    const mail = mailGenerator.generate(response);
    return mail;
}

exports.resetPasswordInform=(name)=>{
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      
      name: "Tawk",
      link: "https://yourchatapp.com",
    },
  });

  const response = {
    body: {
      name: name,
      intro: "Your password has been successfully reset.",
      outro: "If you did not reset your password, please contact our support team immediately.",
    },
  };

  
  const mail = mailGenerator.generate(response);
  return mail;
}