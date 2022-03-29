module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/app/test', user.getTest);

    // 1. 유저 생성 (회원가입) API
    app.post('/app/signup', user.postUsers);

    // 2. 로그인 API (JWT 생성)
    app.post('/app/login', user.login);

    // 3. 유저 조회 API (+ query string email 검색)
    app.get('/app/users',user.getUsers); 

    // 4. 특정 유저 조회 API
    app.get('/app/users/:userId', user.getUserById);

    // 5. 회원 정보 수정 API
    app.patch('/app/users/edit', jwtMiddleware, user.patchUsers);

    // 6. 내가 판매중인 상품 조회 API
    app.get('/app/myselling', jwtMiddleware, user.getmySellingById);

    // 7. 나의 판매완료 상품 조회  API
    app.get('/app/mysold', jwtMiddleware, user.getmySoldById);

    // 8. 내 상품 판매완료 변경 API
    app.patch('/app/users/myselling', jwtMiddleware, user.patchProducttoSold);

    // 9. 내 관심상품 등록 API
    app.post('/app/users/addmylike', jwtMiddleware, user.postmyLike);

    // 10. 나의 관심목록 조회 API
    app.get('/app/viewmylike', jwtMiddleware, user.getmyLikeById);

    // 11. 내 관심상품 삭제 API
    app.patch('/app/users/mylike/delete', jwtMiddleware, user.patchmyLike);

    // 12. 상품 판매글 등록 API
    app.post('/app/products/post', jwtMiddleware, user.postProduct);

    // 13. 내 판매글 수정 API
    app.patch('/app/products/edit', jwtMiddleware, user.patchProductInfo);

    // 14. 내 판매글 삭제 API
    app.patch('/app/products/delete', jwtMiddleware, user.patchProducttoDelete);

    // 15. 판매 상품 조회 API
    app.get('/app/products', user.getProducts);

    // 16. 특정 상품 조회 API(productId)
    app.get('/app/products/:productId', user.getProductbyId);

    // 17. 특정 상품 조회 API(productName)
    app.get('/app/productsbyproductName', user.getProductbyName);

    // 18. 판매 상품 상세 조회 API
    app.get('/app/products/detail/:productId', user.getProductDetailById);

    // 19. 카테고리별 상품 조회 API
    app.get('/app/productsbycategoryId', user.getProductsbycategoryId);

    // 20. 내 채팅방 조회 API
    app.get('/app/users/mychatroom', jwtMiddleware, user.getchatRoomById);

    // 21. 상품 목록 조회 paging
    app.get('/app/productsbypage', jwtMiddleware, user.getProductsbypage)

    // 아래 부분은 7주차에서 다룸.
    // TODO: After 로그인 인증 방법 (JWT)

    // // 11. 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    // app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)

    // 12. 상품 목록 조회 paging
    // app.get('/app/app/products/paging', jwtMiddleware, user.getproductPaging)

};

// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API