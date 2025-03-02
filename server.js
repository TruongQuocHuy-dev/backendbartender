const express = require('express');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const app = express();

app.use(express.json());

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

app.post('/order/create_payment_url', (req, res) => {
  const { userId, amount } = req.body;

  const tmnCode = '412SUAFX';
  const secretKey = 'N5R95ZPCSFA01HZ5JWU7ZY9TLC6794EB';
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = 'https://f150-123-23-17-168.ngrok-free.app/order/vnpay_return'; // Sửa lại

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
    vnp_CurrCode: 'VND',
    vnp_IpAddr: '127.0.0.1',
    vnp_Locale: 'vn',
    vnp_OrderInfo: `Thanh toan cho user ${userId}`,
    vnp_OrderType: 'billpayment',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: `${moment().unix()}-${Math.floor(Math.random() * 1000)}`,
    vnp_ExpireDate: moment().add(1, 'days').format('YYYYMMDDHHmmss'),
  };

  const sortedParams = sortObject(vnp_Params);
  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  const hmac = CryptoJS.HmacSHA512(queryString, secretKey);
  const signed = CryptoJS.enc.Hex.stringify(hmac);
  vnp_Params['vnp_SecureHash'] = signed;

  const paymentUrl = `${vnpUrl}?${queryString}&vnp_SecureHash=${signed}`;
  res.json({ paymentUrl });
});

app.get('/order/vnpay_return', (req, res) => {
  const vnpParams = req.query;
  const secureHash = vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  const secretKey = 'N5R95ZPCSFA01HZ5JWU7ZY9TLC6794EB';
  const sortedParams = sortObject(vnpParams);
  const queryString = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  const hmac = CryptoJS.HmacSHA512(queryString, secretKey);
  const calculatedHash = CryptoJS.enc.Hex.stringify(hmac);

  if (secureHash === calculatedHash) {
    if (vnpParams['vnp_ResponseCode'] === '00') {
      res.send('Thanh toán thành công! Bạn có thể đóng trang này.');
    } else {
      res.send('Thanh toán thất bại!');
    }
  } else {
    res.send('Chữ ký không hợp lệ!');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));