import axios from 'axios';
import faker from 'faker';
import { auth, mailhog, signUpAndInUser, signUpAndVerifyUser } from './helpers';

const htmlUrls = require('html-urls');

test('change existing password', async () => {
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  await signUpAndInUser({ email, password });

  const signInA = await auth.signIn({
    email,
    password,
  });

  expect(signInA.error).toBeNull();
  expect(signInA.session).toBeTruthy();

  const newPassword = `${password}-new`;
  const changePasswordResponse = await auth.changePassword({
    newPassword,
  });

  expect(changePasswordResponse.error).toBeNull();

  await auth.signOut();

  const { session, error } = await auth.signIn({
    email,
    password: newPassword,
  });

  expect(error).toBeNull();
  expect(session).toBeTruthy();
});

test('reset password', async () => {
  const email = faker.internet.email().toLocaleLowerCase();
  const password = faker.internet.password(8);

  await signUpAndVerifyUser({ email, password });

  // reset password
  const { error } = await auth.resetPassword({ email });

  expect(error).toBeNull();

  // get email that was sent
  const messageResetPassword = await mailhog.latestTo(email);

  if (!messageResetPassword?.html) {
    throw new Error('email does not exists');
  }

  // get verify email link
  const resetPasswordLink = htmlUrls({ html: messageResetPassword.html }).find(
    (href: { value: string; url: string; uri: string }) => href.url.includes('passwordReset'),
  );

  // verify email
  await axios.get(resetPasswordLink.url, {
    maxRedirects: 0,
    validateStatus: (status) => status === 302,
  });
});
