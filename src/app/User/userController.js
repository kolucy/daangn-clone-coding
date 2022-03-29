const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/signup
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, password, nickName
     */
    const {email, password, nickName} = req.body;

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 길이 체크
    if (email.length > 30)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    // createUser 함수 실행을 통한 결과 값을 signUpResponse에 저장
    const signUpResponse = await userService.createUser(
        email,
        password,
        nickName
    );

    // signUpResponse 값을 json으로 전달
    return res.send(signUpResponse);
};

// TODO: After 로그인 인증 방법 (JWT)
/**
 * API No. 2
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
 exports.login = async function (req, res) {

    const {email, password} = req.body;

    //validation 처리

    const signInResponse = await userService.postSignIn(email, password);

    return res.send(signInResponse);
};

/**
 * API No. 3
 * API Name : 유저 조회 API (이메일로 검색 조회)
 * [GET] /app/users
 * [GET] /app/users?email=
 */
exports.getUsers = async function (req, res) {

    /**
     * Query String: email
     */
    const email = req.query.email;

    if (!email) {
        // 유저 전체 조회
        const userListResult = await userProvider.retrieveUserList();
        // SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" }, 메세지와 함께 userListResult 호출
        return res.send(response(baseResponse.SUCCESS, userListResult));
    } else {
        // 이메일을 통한 유저 검색 조회
        const userListByEmail = await userProvider.retrieveUserList(email);
        return res.send(response(baseResponse.SUCCESS, userListByEmail));
    }
};

/**
 * API No. 4
 * API Name : 특정 유저 조회 API
 * [GET] /app/users/:userId
 */
exports.getUserById = async function (req, res) {

    /**
     * Path Variable: userId
     */
    const userId = req.params.userId;
    // errResponse 전달
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    // userId를 통한 유저 검색 함수 호출 및 결과 저장
    const userByUserId = await userProvider.retrieveUser(userId);

    if(!userByUserId)
        return res.send(errResponse(baseResponse.USER_USERID_NOT_EXIST))

    return res.send(response(baseResponse.SUCCESS, userByUserId));
};

/**
 * API No. 5
 * API Name : 회원 정보 수정 API + JWT + Validation
 * [PATCH] /app/users/edit
 * (path variable : userId)
 * body : nickname
 */
 exports.patchUsers = async function (req, res) {

    // jwt - userId, (path variable :userId)

    //const userIdFromJWT = req.verifiedToken.userId
    //const userId = req.params.userId;

    const userId = req.verifiedToken.userId
    const nickName = req.body.nickName;

    // JWT는 이 후 주차에 다룰 내용
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickName) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

        const editUserInfo = await userService.editUser(userId, nickName)
        return res.send(editUserInfo);
    }
};

/**
 * API No. 6
 * API Name : 내가 판매중인 상품 조회 API + JWT + Validation
 * [GET] /app/myselling
 */
 exports.getmySellingById = async function (req, res) {

    // jwt - userId, path variable :userId
    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;
 
    // errResponse 전달
    //if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // userId를 통한 mySelling 검색 함수 호출 및 결과 저장
        const mySelling = await userProvider.retrievemySelling(userId);

        if(!mySelling) return res.send(errResponse(baseResponse.PRODUCT_MYSELLING_NOT_EXIST))
        return res.send(response(baseResponse.SUCCESS, mySelling));
    }
};

// /**
//  * API Name : 내가 판매중인 상품 조회 API (jwt 적용 전)
//  * [GET] /app/products/myselling/{userId}
//  */
//  exports.getmySellingById = async function (req, res) {

//     /**
//      * Path Variable: userId
//      */
//     const userId = req.params.userId;
//     // errResponse 전달
//     if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

//     // userId를 통한 mySelling 검색 함수 호출 및 결과 저장
//     const mySelling = await userProvider.retrievemySelling(userId);

//     if(!mySelling)
//         return res.send(errResponse(baseResponse.PRODUCT_MYSELLING_NOT_EXIST))

//     return res.send(response(baseResponse.SUCCESS, mySelling));
// };

/**
 * API No. 7
 * API Name : 내가 판매완료한 상품 조회 API + JWT + Validation
 * [GET] /app/mysold
 * (path variable : userId)
 */
 exports.getmySoldById = async function (req, res) {

    // jwt - userId, path variable :userId

    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;

    // errResponse 전달
    //if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // userId를 통한 mySold 검색 함수 호출 및 결과 저장
        const mySold = await userProvider.retrievemySold(userId);

        if(!mySold) return res.send(errResponse(baseResponse.PRODUCT_MYSOLD_NOT_EXIST))
        return res.send(response(baseResponse.SUCCESS, mySold));
    }
};

// /**
//  * API Name : 내가 판매완료한 상품 조회 API (jwt 적용 전)
//  * [GET] /app/products/mysold/{userId}
//  */
//  exports.getmySoldById = async function (req, res) {

//     /**
//      * Path Variable: userId
//      */
//     const userId = req.params.userId;
//     // errResponse 전달
//     if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

//     // userId를 통한 mySold 검색 함수 호출 및 결과 저장
//     const mySold = await userProvider.retrievemySold(userId);

//     if(!mySold)
//         return res.send(errResponse(baseResponse.PRODUCT_MYSOLD_NOT_EXIST))

//     return res.send(response(baseResponse.SUCCESS, mySold));
// };


/**
 * API No. 8
 * API Name : 내 상품 판매완료 변경 API + JWT + Validation
 * [PATCH] /app/users/myselling
 * (path variable : userId)
 * body : productId
 */
 exports.patchProducttoSold = async function (req, res) {

    // jwt - userId, path variable :userId

    const userId = req.verifiedToken.userId

    //const userId = req.params.userId;
    const productId = req.body.productId;

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!productId) return res.send(errResponse(baseResponse.USER_PRODUCTID_EMPTY));

        const editProducttoSold = await userService.editProducttoSold(userId, productId)
        return res.send(editProducttoSold);
    }
};

/**
 * API No. 9
 * API Name : 내 관심상품 등록 API + JWT + Validation
 * [POST] /app/users/addmylike
 */
 exports.postmyLike = async function (req, res) {

    /**
     * Body: productId
     */
    // jwt - userId

    const userId = req.verifiedToken.userId
    //const productId = req.body;
    const productId = req.body['productId'];

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // 빈 값 체크
        if (!productId) return res.send(errResponse(baseResponse.USER_PRODUCTID_EMPTY));

        // insertmyLike 함수 실행을 통한 결과 값을 addmyLikeResponse에 저장
        const addmyLikeResponse = await userService.insertmyLike(
            userId,
            productId
        );
        
        // addmyLikeResponse 값을 json으로 전달
        return res.send(addmyLikeResponse);
    }
};

// /**
//  * API No. 9
//  * API Name : 내 관심상품 등록 API + JWT + Validation
//  * [POST] /app/users/mylike/add
//  */
//  exports.postmyLike = async function (req, res) {

//     /**
//      * Body: userId, productId
//      */
//     // jwt - userId

//     const userIdFromJWT = req.verifiedToken.userId
//     const {userId, productId} = req.body;

//     // JWT
//     if (userIdFromJWT != userId) {
//         res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
//     } else {
//         // 빈 값 체크
//         if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
//         if (!productId) return res.send(errResponse(baseResponse.USER_PRODUCTID_EMPTY));

//         // createmyLike 함수 실행을 통한 결과 값을 addmyLikeResponse에 저장
//         const addmyLikeResponse = await userService.insertmyLike(
//             userId,
//             productId
//         );
        
//         // addmyLikeResponse 값을 json으로 전달
//         return res.send(addmyLikeResponse);
//     }
// };

/**
 * API No. 10
 * API Name : 나의 관심목록 조회 API
 * [GET] /app/users/mylike
 */
 exports.getmyLikeById = async function (req, res) {

    // jwt - userId

    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;

    // errResponse 전달
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    // JWT
    // if (userIdFromJWT != userId) {
    //     res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    // } else {
    //     // userId를 통한 myLike 검색 함수 호출 및 결과 저장
    const myLike = await userProvider.retrievemyLike(userId);

    if(!myLike) return res.send(errResponse(baseResponse.PRODUCT_MYLIKE_NOT_EXIST))
    return res.send(response(baseResponse.SUCCESS, myLike));
    // }
};

// /**
//  * API Name : 나의 관심목록 조회 API (jwt 적용 전)
//  * [GET] /app/products/mylike/{userId}
//  */
//  exports.getmyLikeById = async function (req, res) {

//     /**
//      * Path Variable: userId
//      */
//     const userId = req.params.userId;
//     // errResponse 전달
//     if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

//     // userId를 통한 myLike 검색 함수 호출 및 결과 저장
//     const myLike = await userProvider.retrievemyLike(userId);

//     if(!myLike)
//         return res.send(errResponse(baseResponse.PRODUCT_MYLIKE_NOT_EXIST))

//     return res.send(response(baseResponse.SUCCESS, myLike));
// };

/**
 * API No. 11
 * API Name : 내 관심상품 삭제 API + JWT + Validation
 * [PATCH] /app/users/mylike/:userId
 * body : productId
 */
 exports.patchmyLike = async function (req, res) {

    // jwt - userId

    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;
    const productId = req.body.productId;

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!productId) return res.send(errResponse(baseResponse.USER_PRODUCTID_EMPTY));

        const deletemyLike = await userService.deletemyLike(userId, productId)
        return res.send(deletemyLike);
    }
};

/**
 * API No. 12
 * API Name : 상품 판매글 등록 API + JWT + Validation
 * [POST] /app/products/post
 */
 exports.postProduct = async function (req, res) {

    /**
     * Body: categoryId, productName, price, productDetail, productMainImg
     */
    // jwt - userId

    const userId = req.verifiedToken.userId
    const {categoryId, productName, price, productDetail, productMainImg} = req.body;

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // 빈 값 체크
        //if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));
        if (!categoryId) return res.send(errResponse(baseResponse.PRODUCT_CATEGORYID_EMPTY));
        if (!productName) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTNAME_EMPTY));
        if (!price) return res.send(errResponse(baseResponse.PRODUCT_PRICE_EMPTY));
        if (!productDetail) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTDETAIL_EMPTY));
        if (!productMainImg) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTIMG_EMPTY));

        // createProduct 함수 실행을 통한 결과 값을 addProductResponse에 저장
        const addProductResponse = await userService.insertProduct(
            userId, categoryId, productName, price, productDetail, productMainImg
        );
        
        // addProductResponse 값을 json으로 전달
        return res.send(addProductResponse);
    }
};

/**
 * API No. 13
 * API Name : 내 판매글 수정 API + JWT + Validation
 * [PATCH] /app/products/edit
 * path variable : userId
 * body : productId, price
 */
 exports.patchProductInfo = async function (req, res) {

    // jwt - userId

    const userId= req.verifiedToken.userId
    //const userId = req.params.userId;
    const productId = req.body.productId;
    const price = req.body.price;

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!price) return res.send(errResponse(baseResponse.PRODUCT_PRICE_EMPTY));

        const editProductInfo = await userService.editProductInfo(userId, productId, price)

        return res.send(editProductInfo);
    }
};

/**
 * API No. 14
 * API Name : 내 판매글 삭제 API + JWT + Validation
 * [PATCH] /app/products/delete
 * path variable : userId
 * body : productId
 */
 exports.patchProducttoDelete = async function (req, res) {

    // jwt - userId

    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;
    const productId = req.body.productId;

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!productId) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTID_EMPTY));

        const deleteProduct = await userService.deleteProduct(userId, productId)
        return res.send(deleteProduct);
    }
};


/**
 * API No. 15
 * API Name : 판매 상품 조회 API
 * [GET] /app/products
 */
 exports.getProducts = async function (req, res) {

    // 상품 목록 전체 조회
    const productListResult = await userProvider.retrieveProducts();
    // SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" }, 메세지와 함께 productListResult 호출
    return res.send(response(baseResponse.SUCCESS, productListResult));
};

/**
 * API No. 16
 * API Name : 특정 상품 조회 API(productId)
 * [GET] /app/products/:productId
 */
 exports.getProductbyId = async function (req, res) {

    /**
     * Path Variable: productId
     */
    const productId = req.params.productId;
    // errResponse 전달
    if (!productId) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTID_EMPTY));

    // productId를 통한 유저 검색 함수 호출 및 결과 저장
    const ProductbyIdResult = await userProvider.retrieveProductbyId(productId);

    if(!ProductbyIdResult)
        return res.send(response(baseResponse.PRODUCT_PRODUCTID_NOT_EXIST))

    return res.send(response(baseResponse.SUCCESS, ProductbyIdResult));
};

/**
 * API No. 17
 * API Name : 특정 상품 조회 API(productName)
 * [GET] /app/productsbyproductName?productName=
 */
 exports.getProductbyName = async function (req, res) {

    /**
     * Query String: productName
     */

    const productName = req.query.productName;

    if (!productName) {
        return res.send(errResponse(baseResponse.PRODUCT_PRODUCTNAME_EMPTY))
    } else {
        // productName을 통한 특정 상품 조회
        const ProductbyNameResult = await userProvider.retrieveProductbyName(productName);
        if(!ProductbyNameResult)
            return res.send(response(baseResponse.PRODUCT_PRODUCTID_NOT_EXIST))

        return res.send(response(baseResponse.SUCCESS, ProductbyNameResult));
    }
};

/**
 * API No. 18
 * API Name : 특정 상품 상세조회 API
 * [GET] /app/products/detail/:productId
 */
 exports.getProductDetailById = async function (req, res) {

    /**
     * Path Variable: productId
     */
    const productId = req.params.productId;
    // errResponse 전달
    if (!productId) return res.send(errResponse(baseResponse.PRODUCT_PRODUCTID_EMPTY));

    // productId를 통한 상품 검색 함수 호출 및 결과 저장
    const productDetailById = await userProvider.retrieveProductDetailbyId(productId);

    if(!productDetailById)
        return res.send(errResponse(baseResponse.PRODUCT_PRODUCTID_NOT_EXIST))

    return res.send(response(baseResponse.SUCCESS, productDetailById));
};

/**
 * API No. 19
 * API Name : 카테고리별 상품 조회 API
 * [GET] /app/productsbycategoryId?categoryId=
 */
 exports.getProductsbycategoryId = async function (req, res) {

    /**
     * Query String: categoryId
     */
    const categoryId = req.query.categoryId;

    if (!categoryId) {
        return res.send(errResponse(baseResponse.PRODUCT_CATEGORYID_EMPTY))
    } else {
        // categoryId을 통한 상품 조회
        const ProductListBycategoryId = await userProvider.retrieveProductsbycategoryId(categoryId);
        return res.send(response(baseResponse.SUCCESS, ProductListBycategoryId));
    }
};


/**
 * API No. 20
 * API Name : 나의 채팅방 목록 조회 API
 * [GET] /app/users/mychatroom
 */
 exports.getchatRoomById = async function (req, res) {

    // jwt - userId

    const userId = req.verifiedToken.userId
    //const userId = req.params.userId;
    // errResponse 전달
    if (!userId) return res.send(errResponse(baseResponse.USER_USERID_EMPTY));

    // JWT
    if (!userId) {
        res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        // userId를 통한 chatRoom 검색 함수 호출 및 결과 저장
        const chatRoom = await userProvider.retrieveChatList(userId);

        if(!chatRoom) return res.send(errResponse(baseResponse.USER_CHATROOM_NOT_EXIST))
        return res.send(response(baseResponse.SUCCESS, chatRoom));
    }
};


// JWT 이 후 주차에 다룰 내용
/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};


/**
 * API No. 21
 * API Name : 판매 상품 조회 API - pagination
 * [GET] /app/productsbypage
 */
 exports.getProductsbypage = async function (req, res) {
     const pageInfo = req.query;
     const page = parseInt(pageInfo.page);
     const pageSize = parseInt(pageInfo.pageSize);

     try {
         if(!pageInfo || !pageSize) {
             res.send(baseResponse.BAD_REQUEST);
         }
         const getProductsbypage = await userService.getProductsbypage(page, pageSize);
         if(getProductsbypage == false) {
             res.send(baseResponse.BAD_REQUEST)}
         res.send(response(baseResponse.SUCCESS, getProductsbypage));
     } catch (err) {
         res.send(baseResponse.DB_ERROR);
         throw err;
     }
};
