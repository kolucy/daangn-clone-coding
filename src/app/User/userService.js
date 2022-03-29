const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { userInfo } = require("os");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (email, password, nickname) {
    try {
        // 이메일 중복 확인
        // UserProvider에서 해당 이메일과 같은 User 목록을 받아서 emailRows에 저장한 후, 배열의 길이를 검사한다.
        // -> 길이가 0 이상이면 이미 해당 이메일을 갖고 있는 User가 조회된다는 의미
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertUserInfoParams = [email, hashedPassword, nickname];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.insertmyLike = async function (userId, productId) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertmyLikeParams = [userId, productId];
        console.log(insertmyLikeParams);
        const connection = await pool.getConnection(async (conn) => conn);

        const myLikeResult = await userDao.insertmyLike(connection, insertmyLikeParams);
        //console.log(`추가된 관심 상품 : ${myLikeResult[0].insertId}`)
        console.log(`추가된 관심 상품 : ${productId}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - insertmyLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.insertProduct = async function (userId, categoryId, productName, price, productDetail, productMainImg) {
    try {

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        const insertProductParams = [userId, categoryId, productName, price, productDetail, productMainImg];

        const connection = await pool.getConnection(async (conn) => conn);

        const ProductResult = await userDao.insertProduct(connection, insertProductParams);
        console.log(`등록된 상품 : ${ProductResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - insertProduct Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, password) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email

        // 비밀번호 확인 (입력한 비밀번호를 암호화한 것과 DB에 저장된 비밀번호가 일치하는 지 확인함)
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows.length < 1) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);

        if (userInfoRows[0].status === "INACTIVE") {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === "DELETED") {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log(userInfoRows[0].userId) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "User",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (userId, nickName) {
    let connection;
    try {
        console.log(userId)
        connection = await pool.getConnection(async (conn) => conn);
        await connection.beginTransaction(); // 트랜잭션 적용 시작
        const editUserResult = await userDao.updateUserInfo(connection, userId, nickName);
        await connection.commit(); // 커밋

        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback(); // 롤백
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release(); // connection 해제
    }
}

exports.editProductInfo = async function (userId, productId, price) {
    try {
        console.log(userId)
        const connection = await pool.getConnection(async (conn) => conn);
        // userId에 해당하는 product인지 확인
        const productInfoRows = await userProvider.myproductCheck(productId);
        if (productInfoRows.userId != userId) {
            return errResponse(baseResponse.USER_ID_NOT_MATCH);
        }
        const editProductInfoResult = await userDao.updateProductInfo(connection, productId, price)

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editProductInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.editProducttoSold = async function (userId, productId) {
    try {
        console.log(userId)
        const connection = await pool.getConnection(async (conn) => conn);
        // userId에 해당하는 product인지 확인
        const productInfoRows = await userProvider.myproductCheck(productId);
        if (productInfoRows.userId != userId) {
            return errResponse(baseResponse.USER_ID_NOT_MATCH);
        }
        const editProducttoSoldResult = await userDao.updateProducttoSold(connection, productId)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editProducttoSold Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.deletemyLike = async function (userId, productId) {
    try {
        console.log(userId)
        const connection = await pool.getConnection(async (conn) => conn);
        const deletemyLikeResult = await userDao.deletemyLike(connection, productId)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - deletemyLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.deleteProduct = async function (userId, productId) {
    try {
        console.log(userId)
        const connection = await pool.getConnection(async (conn) => conn);
        // userId에 해당하는 product인지 확인
        const productInfoRows = await userProvider.myproductCheck(productId);
        if (productInfoRows.userId != userId) {
            return errResponse(baseResponse.USER_ID_NOT_MATCH);
        }
        const deleteProductResult = await userDao.deleteProduct(connection, productId)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - deleteProduct Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//paging
exports.getProductsbypage = async (page, pageSize) => {
    try {
      let start = 0;
  
      if (page <= 0) {
        page = 1;
      } else {
        start = (page - 1) * pageSize;
      }
  
      const connection = await pool.getConnection(async (conn) => conn);
      const productlist = await userDao.getProductsbypage(connection, page, start, pageSize);
    //   if (page > Math.round(cnt[0].total / pageSize)) {
    //     return null;
    //   }
      return productlist

    } catch (err) {
      console.log('상품 목록 가져오기 실패.', err);
      throw err;
    }
  };