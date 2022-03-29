
// 새롭게 추가한 함수를 아래 부분에서 export 해줘야 외부의 Provider, Service 등에서 사용가능합니다.

// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickName 
                FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT email, nickName 
                FROM User 
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT userId, email, nickName 
                 FROM User
                 WHERE userId = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 판매 상품 조회
async function selectProducts(connection) {
  const selectProductListQuery = `
                 SELECT productId, productName, CONCAT(price, '원') AS price, productMainImg,
                        (CASE
                          WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                          WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                          WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                          END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE U.address LIKE '%다산동%' and Product.status = 'ACTIVE'
                 ORDER BY Product.updateAt DESC;
                 `;
  const [productRows] = await connection.query(selectProductListQuery);
  return productRows;
}

// 판매 상품 조회-ID
async function selectProductbyId(connection, productId) {
  const selectProductbyIdQuery = `
                 SELECT productId, productName, CONCAT(price, '원') AS price, productMainImg,
                        (CASE
                          WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                          WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                          WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                          END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE U.address LIKE '%다산동%' and Product.status = 'ACTIVE' and productId = ?;
                 `;
  const [productbyIdRows] = await connection.query(selectProductbyIdQuery, productId);
  return productbyIdRows;
}

// 판매 상품 조회-Name
async function selectProductbyName(connection, productName) {
  const selectProductbyNameQuery = `
                 SELECT productId, productName, CONCAT(price, '원') AS price, productMainImg,
                        (CASE
                          WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                          WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                          WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                          END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE U.address LIKE '%다산동%' and Product.status = 'ACTIVE' and productName = ?;
                 `;
  const [productbyNameRows] = await connection.query(selectProductbyNameQuery, productName);
  return productbyNameRows;
}

// 판매 상품 조회-categoryId
async function selectProductsbycategoryId(connection, categoryId) {
  const selectProductsbycategoryIdQuery = `
                 SELECT productId, productName, CONCAT(price, '원') AS price, productMainImg,
                        (CASE
                          WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                          WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                          WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                          END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE categoryId = ?
                 ORDER BY Product.updateAt DESC;
                 `;
  const [productsbycategoryIdRows] = await connection.query(selectProductsbycategoryIdQuery, categoryId);
  return productsbycategoryIdRows;
}

// productId 판매상품 상세 조회
async function selectProductDetail(connection, productId) {
  const selectProductDetailQuery = `
                 SELECT productId, productName, U.nickName, CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(U.address, '동', 2), ' ', -1), '동') AS address, U.profileImg,
                        CONCAT(price, '원') AS price, productDetail, C.category,
                        (CASE
                            WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                            WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                            WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                            END) AS time
                 FROM Product
                 INNER JOIN User U on Product.userId = U.userId
                 INNER JOIN Category C on Product.categoryId = C.categoryId
                 WHERE productId = ?;
                 `;
  const [productRow] = await connection.query(selectProductDetailQuery, productId);
  return productRow;
}

// 내가 판매중인 상품 API
async function selectmySelling(connection, userId) {
  const selectmySellingQuery = `
                 SELECT productId,productName, CONCAT(price, '원') AS price, productMainImg, CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(U.address, '동', 2), ' ', -1), '동') AS address,
                        (CASE
                            WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                            WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                            WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                            END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE Product.userId = ? AND Product.status = 'ACTIVE';
                 `;
  const [sellingRow] = await connection.query(selectmySellingQuery, userId);
  return sellingRow;
}

// 나의 판매완료 상품 API
async function selectmySold(connection, userId) {
  const selectmySoldQuery = `
                 SELECT productId,productName, CONCAT(price, '원') AS price, productMainImg, CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(U.address, '동', 2), ' ', -1), '동') AS address,
                        (CASE
                            WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
                            WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
                            WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
                            END) AS time
                 FROM Product
                 INNER JOIN User U ON U.userId = Product.userId
                 WHERE Product.userId = ? AND Product.status = 'COMPLETE';
                 `;
  const [soldRow] = await connection.query(selectmySoldQuery, userId);
  return soldRow;
}

// 나의 관심목록 API
async function selectmyLike(connection, userId) {
  const selectmyLikeQuery = `
  SELECT U.userId, P.productName, P.price, P.productMainImg
  FROM myLike
  INNER JOIN User U ON U.userId = myLike.userId
  INNER JOIN Product P on P.productId = myLike.productId
  WHERE U.userId = ?;
                 `;
  const [likeRow] = await connection.query(selectmyLikeQuery, userId);
  return likeRow;
}

// 나의 채팅방 조회 API
async function selectchatList(connection, userId) {
  const selectchatListQuery = `
  SELECT roomId, buyerId, sellerId, P.productMainImg, P.productName
  FROM Chatroom
  INNER JOIN User U ON U.userId = Chatroom.sellerId
  INNER JOIN Product P on U.userId = P.userId
  WHERE buyerId = ?;
                 `;
  const [chatListRow] = await connection.query(selectchatListQuery, userId);
  return chatListRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(email, password, nickName)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email, nickName, password
        FROM User
        WHERE email = ? AND password = ?;
        `;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 해당 user의 product인지 체크
async function selectUsermyProduct(connection, productId) {
  const selectUsermyProductQuery = `
        SELECT userId
        FROM Product
        WHERE productId = ?;
        `;
  const selectUsermyProductRow = await connection.query(
    selectUsermyProductQuery,
    productId
  );
  //console.log("selectUsermyProductRow: ", selectUsermyProductRow)
  return selectUsermyProductRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, userId
        FROM User
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

// 유저 닉네임 변경
async function updateUserInfo(connection, userId, nickName) {
  const updateUserQuery = `
  UPDATE User
  SET nickName = ?
  WHERE userId = ?;`;
  const updateUserRow = await connection.query(updateUserQuery, [nickName, userId]);
  return updateUserRow[0];
}

// 상품 정보 변경
async function updateProductInfo(connection, productId, price) {
  const updatePriceQuery = `
  UPDATE Product
  SET price = ?
  WHERE productId = ?;`;
  const updatePriceRow = await connection.query(updatePriceQuery, [price, productId]);
  return updatePriceRow[0];
}

// 내 상품 판매완료 변경
async function updateProducttoSold(connection, productId) {
  const updateProducttoSoldQuery = `
  UPDATE Product
  SET status = 'COMPLETE'
  WHERE productId = ?;`;
  const updateProducttoSoldRow = await connection.query(updateProducttoSoldQuery, [productId]);
  return updateProducttoSoldRow[0];
}

// 판매 상품 등록
async function insertProduct(connection, insertProductParams) {
  const insertProductQuery = `
        INSERT INTO Product(userId, categoryId, productName, price, productDetail, productMainImg)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
  const insertProductRow = await connection.query(
    insertProductQuery,
    insertProductParams
  );

  return insertProductRow;
}

// 관심 상품 등록
async function insertmyLike(connection, userId, productId) {
  //console.log('Dao console-undefined', userId, productId);
  const insertmyLikeQuery = `
        INSERT INTO myLike(userId, productId)
        VALUES (?, ?);
    `;
  const insertmyLikeRow = await connection.query(
    insertmyLikeQuery,
    userId, productId
  );
  
  return insertmyLikeRow[0];
}

// // 관심 상품 등록
// async function insertmyLike(connection, insertmyLikeParams) {
//   const insertmyLikeQuery = `
//         INSERT INTO myLike(userId, productId)
//         VALUES (?, ?);
//     `;
//   const insertmyLikeRow = await connection.query(
//     insertmyLikeQuery,
//     insertmyLikeParams
//   );

//   return insertmyLikeRow;
// }

// 채팅방 생성
async function insertchatList(connection, insertchatListParams) {
  const insertchatListQuery = `
        INSERT INTO Chatroom(sellerId, buyerId, itemId)
        VALUES (?, ?, ?);
    `;
  const insertchatListRow = await connection.query(
    insertchatListQuery,
    insertchatListParams
  );

  return insertchatListRow;
}

// 관심 상품 삭제
async function deletemyLike(connection, productId) {
  const deletemyLikeQuery = `
  DELETE FROM myLike
  WHERE productId = ?;`;
  const deletemyLikeRow = await connection.query(
    deletemyLikeQuery, [productId]
  );
  return deletemyLikeRow[0];
}

// 내 판매 상품 삭제
async function deleteProduct(connection, productId) {
  const deleteProductQuery = `
  DELETE FROM Product
  WHERE productId = ?;`;
  const deleteProductRow = await connection.query(
    deleteProductQuery, [productId]
  );
  return deleteProductRow[0];
}

// 채팅방 삭제
async function deletechatList(connection, deletechatListParams) {
  const deletechatListQuery = `
  DELETE FROM Chatroom
  WHERE roomId = ?;`;
  const deletechatListRow = await connection.query(
    deletechatListQuery,
    deletechatListParams
  );
  return deletechatListRow;
}

 // 상품 목록 조회 paging
 async function getProductsbypage(connection, page, start, end) {
   const getProductsbypageQuery = `
   SELECT productId, productName, CONCAT(price, '원') AS price, productMainImg,
   (CASE
     WHEN TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, Product.updateAt, NOW()), '분 전')
     WHEN TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, Product.updateAt, NOW()), '시간 전')
     WHEN TIMESTAMPDIFF(DAY, Product.updateAt, NOW()) < 30 THEN CONCAT(TIMESTAMPDIFF(DAY, Product.updateAt, NOW()), '일 전')
     END) AS time
   FROM Product
   INNER JOIN User U ON U.userId = Product.userId
   WHERE U.address LIKE '%다산동%' and Product.status = 'ACTIVE'
   ORDER BY Product.updateAt DESC
   LIMIT ${start}, ${end}; `;
   const getProductsbypageRow = await connection.query(
   getProductsbypageQuery,
   page
   );
   return getProductsbypageRow[0];
  }

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  selectProducts,
  selectProductbyId,
  selectProductbyName,
  selectProductsbycategoryId,
  selectProductDetail,
  selectmySelling,
  selectmySold,
  selectmyLike,
  selectchatList,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
  updateProducttoSold,
  updateProductInfo,
  insertProduct,
  insertmyLike,
  insertchatList,
  deletemyLike,
  deleteProduct,
  deletechatList,
  getProductsbypage,
  selectUsermyProduct
};
