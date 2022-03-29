const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {

  //email을 인자로 받는 경우와 받지 않는 경우를 구분하여 하나의 함수에서 두 가지 기능을 처리함

  if (!email) {
    // connection 은 db와의 연결을 도와줌
    const connection = await pool.getConnection(async (conn) => conn);
    // Dao 쿼리문의 결과를 호출
    const userListResult = await userDao.selectUser(connection);
    // connection 해제
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0]; // 한 명의 유저 정보만을 불러오므로 배열 타입을 리턴하는 게 아닌 0번 인덱스를 파싱해서 오브젝트 타입 리턴
};

exports.retrievemySelling = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const mySellingResult = await userDao.selectmySelling(connection, userId);

  connection.release();

  return mySellingResult;
};

exports.retrievemySold = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const mySoldResult = await userDao.selectmySold(connection, userId);

  connection.release();

  return mySoldResult;
};

exports.retrievemyLike = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const myLikeResult = await userDao.selectmyLike(connection, userId);

  connection.release();

  return myLikeResult;
};

exports.retrieveChatList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ChatListResult = await userDao.selectchatList(connection, userId);

  connection.release();

  return ChatListResult;
};

exports.retrieveProducts = async function () {
  // connection 은 db와의 연결을 도와줌
  const connection = await pool.getConnection(async (conn) => conn);
  // Dao 쿼리문의 결과를 호출
  const productListResult = await userDao.selectProducts(connection);
  // connection 해제
  connection.release();

  return productListResult;
};

exports.retrieveProductbyId = async function (productId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ProductbyIdResult = await userDao.selectProductbyId(connection, productId);

  connection.release();

  return ProductbyIdResult[0]; 
};

exports.retrieveProductbyName = async function (productName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ProductbyNameResult = await userDao.selectProductbyName(connection, productName);

  connection.release();

  return ProductbyNameResult[0]; 
};

exports.retrieveProductsbycategoryId = async function (categoryId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ProductsbycategoryIdResult = await userDao.selectProductsbycategoryId(connection, categoryId);

  connection.release();

  return ProductsbycategoryIdResult;
};

exports.retrieveProductDetailbyId = async function (productId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const ProductDetailbyIdResult = await userDao.selectProductDetail(connection, productId);

  connection.release();

  return ProductDetailbyIdResult[0];
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  // 쿼리문에 여러개의 인자를 전달할 때 selectUserPasswordParams와 같이 사용합니다.
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.myproductCheck = async function (selectUsermyProductParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  // 쿼리문에 여러개의 인자를 전달할 때 selectUsermyProductParams와 같이 사용합니다.
  const selectUsermyProductResult = await userDao.selectUsermyProduct(
      connection,
      selectUsermyProductParams
  );
  connection.release();
  //console.log("selectUsermyProductResult: ", selectUsermyProductResult)
  return selectUsermyProductResult[0];
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};