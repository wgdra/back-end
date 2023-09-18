const jwt = require('jsonwebtoken');

  const ROLE = {
    Admin: 0,
    Teacher: 1
  };
  
  const STATUS = {
    Accept: 1,
    Reject: 2,
    Watting: 3
  };
    async function  checkToken(request) {
        try {
          const token = request.header('Authorization').replace('Bearer ', '');
            const decodedToken = await new Promise((resolve, reject) => {
              jwt.verify(token, process.env.DATABASE_KEY_SECRET, (err, decoded) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(decoded);
                }
              });
            });
            
            return { status: true, data: decodedToken, message: "" };
          } catch (error) {
            return { status: false, data: "", message: 'Token không hợp lệ' };
          }
      }
module.exports = {
  ROLE,
  STATUS,
  checkToken,
};