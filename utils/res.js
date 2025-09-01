// 성공 응답 함수
export const sendSuccess = (res, data) => {
  res.json({
    result: "success",
    data,
  });
};

// 실패 응답 함수
export const sendFail = (res, message = "요청 실패") => {
  res.json({
    result: "fail",
    message,
  });
};