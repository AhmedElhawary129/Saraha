import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendEmail.js";
import { generateToken } from "../token/generateToken.js";


export const eventEmitter = new EventEmitter();

// confirm email
eventEmitter.on("sendEmail", async (data) => {
  const { email } = data;
  // generate comfirmation link
  const token = await generateToken({
    payload: { email },
    SIGNETURE: process.env.SIGNETURE_EMAIL_CONFIRMATION,
    option: { expiresIn: "10m" },
  });
  const link = `http://localhost:3000/users/comfirmEmail/${token}`;

  // send email
  const emailSender = await sendEmail(
    email,
    "Confirm your email",
    `
        <p>You must confirm your email to use your account</p>
        <a href="${link}" style="color: brown; font-size: large;">Click here to confirm your email</a>
        <p>The link is expired after 10 minutes</p>
        <p>Thanks for using Saraha</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new Error("Error sending email", { cause: 500 }));
  }
});

//--------------------------------------------------------------------------------------------------------------

// unFreeze
eventEmitter.on("unFreezeAccount", async (data) => {
  const { email } = data;
  // generate comfirmation link
  const token = await generateToken({
    payload: { email },
    SIGNETURE: process.env.SIGNETURE_UNFREEZE_CONFIRMATION,
    option: { expiresIn: "10m" },
  });
  const link = `http://localhost:3000/users/confirmUnFreeze/${token}`;

  // send email
  const emailSender = await sendEmail(
    email,
    "Confirm unFreeze operation",
    `
        <p>You must confirm unFreeze operatio to use your account again</p>
        <a href="${link}" style="color: brown; font-size: large;">Click here to unFreeze your account</a>
        <p>The link is expired after 10 minutes</p>
        <p>Thanks for using Saraha</p>
        <p>Best wishes</p>
        `
  );
  if (!emailSender) {
    return next(new Error("Error sending message", { cause: 500 }));
  }
});
