// 驗證 UUID 格式
const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
function isNotValidUuid(value) {
  return typeof value !== 'string' || !uuidRegex.test(value)
}
function isUndefined (value) {
    return value === undefined
  }

// 驗證整數
function isNotValidInteger(value) {
  return typeof value !== 'number' || !Number.isInteger(value) || value <= 0
}

// 驗證字串
function isNotValidString (value) {
    return typeof value !== 'string' || value.trim().length === 0 || value === ''
  }

module.exports = {
  isNotValidUuid,
  isNotValidInteger,
  isNotValidString,
  isUndefined
}