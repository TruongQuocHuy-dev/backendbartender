const qs = require('qs');
const { urlencoded } = require('body-parser');
const express = require('express');
const app = express();
const axios = require('axios');
const crypto = require('crypto');
const admin = require('firebase-admin');
const moment = require('moment');


const config = require('./config');

// Khởi tạo Firebase Admin SDK
const serviceAccount = require('./firebase-key.json'); // Đảm bảo đường dẫn đúng
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const pendingTransactions = {};

app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(express.static('./public'));

app.post('/payment', async (req, res) => {
  let {
    accessKey,
    secretKey,
    orderInfo,
    partnerCode,
    redirectUrl,
    ipnUrl,
    requestType,
    extraData,
    orderGroupId,
    autoCapture,
    lang,
  } = config;

  const { amount, userId, selectedPlan } = req.body;
  if (!amount || !userId || !selectedPlan) {
    return res.status(400).json({ message: 'Amount, userId, and selectedPlan are required' });
  }

  const orderId = partnerCode + new Date().getTime();
  const requestId = orderId;

  pendingTransactions[orderId] = { userId, selectedPlan };

  const transactionExtraData = Buffer.from(JSON.stringify({ userId, selectedPlan })).toString('base64');

  const rawSignature =
    'accessKey=' +
    accessKey +
    '&amount=' +
    amount +
    '&extraData=' +
    transactionExtraData +
    '&ipnUrl=' +
    ipnUrl +
    '&orderId=' +
    orderId +
    '&orderInfo=' +
    orderInfo +
    '&partnerCode=' +
    partnerCode +
    '&redirectUrl=' +
    redirectUrl +
    '&requestId=' +
    requestId +
    '&requestType=' +
    requestType;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: transactionExtraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/create',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});

app.post('/callback', async (req, res) => {
  console.log('Callback:', req.body);
  const { resultCode, orderId, extraData, amount } = req.body;

  let userId, selectedPlan;
  try {
    const decodedExtraData = JSON.parse(Buffer.from(extraData, 'base64').toString());
    userId = decodedExtraData.userId;
    selectedPlan = decodedExtraData.selectedPlan;
  } catch (error) {
    console.error('Lỗi giải mã extraData:', error);
    const transaction = pendingTransactions[orderId];
    if (transaction) {
      userId = transaction.userId;
      selectedPlan = transaction.selectedPlan;
    }
  }

  if (!userId || !selectedPlan) {
    console.error('Không tìm thấy userId hoặc selectedPlan cho orderId:', orderId);
    return res.status(204).json(req.body);
  }

  // Tính expiry date dựa trên amount
  let expiryDate;
  if (parseInt(amount) === 99000) {
    expiryDate = moment().add(1, 'month').toDate(); // 1 tháng cho 99000
  } else if (parseInt(amount) === 799000) {
    expiryDate = moment().add(1, 'year').toDate(); // 1 năm cho 799000
  } else {
    expiryDate = moment().add(selectedPlan === 'monthly' ? 1 : 12, 'months').toDate(); // Fallback dựa trên selectedPlan
  }

  const updateData = {
    premium_status: true, // Luôn true cho 7002, 0, 9000
    premium_expiry_date: admin.firestore.Timestamp.fromDate(expiryDate),
    payment_status: resultCode === 7002 ? 'pending' : 'completed',
    last_updated: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    if (resultCode === 0 || resultCode === 9000 || resultCode === 7002) {
      await db.collection('users').doc(userId).update(updateData);
      console.log(`Updated Firestore for user ${userId} with plan ${selectedPlan}, status: ${updateData.payment_status}`);
    }
  } catch (error) {
    console.error('Lỗi cập nhật Firestore:', error);
  }

  delete pendingTransactions[orderId];
  return res.status(204).json(req.body);
});

app.post('/check-status-transaction', async (req, res) => {
  const { orderId } = req.body;

  const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  const accessKey = 'F8BBA842ECF85';
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: 'MOMO',
    requestId: orderId,
    orderId: orderId,
    signature: signature,
    lang: 'vi',
  });

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/query',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});


// Thêm cấu hình VNPay
const vnpConfig = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: '412SUAFX', // Thay bằng mã website của bạn
  vnp_HashSecret: 'N5R95ZPCSFA01HZ5JWU7ZY9TLC6794EB', // Thay bằng secret key của bạn
  vnp_ReturnUrl: 'https://ed09-14-191-196-206.ngrok-free.app/vnpay_return', // URL return sau thanh toán
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
};

// Route tạo payment URL
app.get('/vnpay_return', async (req, res) => {
  console.log('Received VNPay callback:', req.query);
  const { vnp_SecureHash, vnp_SecureHashType, ...vnp_Params } = req.query;
  
  // Validate signature
  const sortedParams = sortObject(vnp_Params);
  const signData = qs.stringify(sortedParams, { encode: false }); // Changed encode to false
  const hmac = crypto.createHmac("sha512", vnpConfig.vnp_HashSecret);
  const signed = hmac.update(signData).digest("hex");

  if (vnp_SecureHash !== signed) {
    console.error('Invalid signature:', { received: vnp_SecureHash, calculated: signed });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { 
    vnp_TxnRef: orderId, 
    vnp_ResponseCode: rspCode,
    vnp_Amount: amount,
    vnp_TransactionNo: transactionNo,
    vnp_PayDate: payDate
  } = vnp_Params;

  const transactionRef = db.collection('transactions').doc(orderId);
  const doc = await transactionRef.get();

  if (!doc.exists) {
    console.error('Transaction not found:', orderId);
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const { userId } = doc.data();
  const paymentAmount = parseInt(amount) / 100; // Convert back from VNPay's format (x100)

  // Prepare payment record
  const paymentData = {
    userId,
    orderId,
    paymentMethod: 'VNPay',
    amount: paymentAmount,
    transactionNo: transactionNo || '',
    paymentDate: payDate ? moment(payDate, 'YYYYMMDDHHmmss').toDate() : new Date(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  };

  try {
    switch (rspCode) {
      case '00': // Success
        const expiryDate = paymentAmount === 99000 
          ? moment().add(1, 'month').toDate()
          : moment().add(1, 'year').toDate();

        // Update user premium status
        await db.collection('users').doc(userId).update({
          premium_status: true,
          premium_expiry_date: admin.firestore.Timestamp.fromDate(expiryDate),
          last_updated: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update transaction status
        await transactionRef.update({
          status: 'completed',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Save payment record
        paymentData.status = 'completed';
        await db.collection('payments').doc(orderId).set(paymentData);

        return res.redirect(`bartenderapp://payment-success?orderId=${orderId}&amount=${paymentAmount}&resultCode=0`);

      case '07': // Processing (waiting for OTP)
        await transactionRef.update({ 
          status: 'processing',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        paymentData.status = 'processing';
        await db.collection('payments').doc(orderId).set(paymentData);
        return res.redirect(`bartenderapp://payment-pending?orderId=${orderId}`);

      case '09': // OTP invalid
        await transactionRef.update({ 
          status: 'otp_invalid',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        paymentData.status = 'failed';
        paymentData.errorCode = '09';
        await db.collection('payments').doc(orderId).set(paymentData);
        return res.redirect(`bartenderapp://payment-otp-error?orderId=${orderId}`);

      default: // Other errors
        await transactionRef.update({ 
          status: 'failed',
          error_code: rspCode,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        paymentData.status = 'failed';
        paymentData.errorCode = rspCode;
        await db.collection('payments').doc(orderId).set(paymentData);
        return res.redirect(`bartenderapp://payment-failed?orderId=${orderId}&code=${rspCode}`);
    }
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    paymentData.status = 'error';
    paymentData.errorMessage = error.message;
    await db.collection('payments').doc(orderId).set(paymentData);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update create_payment_url route to include initial payment record
app.post('/order/create_payment_url', async (req, res) => {
  const { userId, amount } = req.body;
  const ipAddr = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress || 
                req.connection.socket.remoteAddress;

  const tmnCode = vnpConfig.vnp_TmnCode;
  const secretKey = vnpConfig.vnp_HashSecret;
  const returnUrl = vnpConfig.vnp_ReturnUrl;
  
  const orderId = `${tmnCode}_${Date.now()}`;
  const createDate = moment().format('YYYYMMDDHHmmss');
  const bankCode = 'VNBANK';
  
  let vnp_Params = {
    vnp_Version: vnpConfig.vnp_Version,
    vnp_Command: vnpConfig.vnp_Command,
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan goi premium cho user ${userId}`,
    vnp_OrderType: 'billpayment',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) vnp_Params.vnp_BankCode = bankCode;

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false }); // Changed encode to false
  const secureHash = crypto.createHmac('sha512', secretKey)
                          .update(signData)
                          .digest('hex');

  const vnpUrl = `${vnpConfig.vnp_Url}?${qs.stringify({ 
    ...vnp_Params, 
    vnp_SecureHash: secureHash 
  }, { encode: false })}`;
  
  // Save initial records
  await Promise.all([
    db.collection('transactions').doc(orderId).set({
      userId,
      amount,
      status: 'pending',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    }),
    db.collection('payments').doc(orderId).set({
      userId,
      orderId,
      paymentMethod: 'VNPay',
      amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
  ]);

  res.json({ paymentUrl: vnpUrl });
});


// Hàm sắp xếp object
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
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}


app.listen(5000, () => {
  console.log('Server is running at port 5000');
});