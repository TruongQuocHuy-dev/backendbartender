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

app.listen(5000, () => {
  console.log('Server is running at port 5000');
});