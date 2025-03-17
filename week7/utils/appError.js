const appError = (status, errMessage) => {
  const error = new Error(errMessage) // 建立一個新的錯誤物件，並指定錯誤訊息
  error.status = status // 自訂錯誤物件的 status 屬性，表示 HTTP 狀態碼
  return error // 回傳錯誤物件
}

module.exports = appError

//為什麼需要 appError？
// 1.	統一錯誤格式
// 透過 appError，你可以確保所有拋出的錯誤都擁有一致的結構和屬性
// （message 與 status），方便後續統一處理。
// 2.	搭配 Express 錯誤中介函式使用
// 當你在 API 中遇到錯誤時，可以直接用 next(appError(...))
// 來觸發錯誤中介函式。這樣一來，所有錯誤都能集中在同一個地方處理。
