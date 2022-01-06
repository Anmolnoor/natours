/* eslint-disable */

console.log('Hello there, This is the parcelHere!!!');

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('this is working in here');

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log({ email, password });
  //   login(email, password);
});
