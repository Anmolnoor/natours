// import axios from 'axios';

const axios = require('axios');

/* eslint-disable */

exports.email = async (email, password) => {
  alert('this is working in here');
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(res);
  } catch (error) {
    console.log(error.responce.data);
  }
};
