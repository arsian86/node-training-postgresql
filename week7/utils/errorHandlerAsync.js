const errorHandlerAsync = (fn) => {
  // 定義一個 errorHandlerAsync 函式，接收一個異步函式 fn 作為參數
  return (req, res, next) => {
    // 回傳一個新的函式，這個函式符合 Express 中介層的格式 (req, res, next)
    // 使用 Promise.resolve 來確保 fn 即使是同步函式也能被包裝成 Promise
    Promise.resolve(fn(req, res, next))
      // 如果異步函式中發生錯誤，就會被 catch 捕獲
      // 並且將錯誤傳遞給 Express 的 next()，讓 Express 的錯誤處理中介層接手
      .catch(next)
  }
}

module.exports = errorHandlerAsync
