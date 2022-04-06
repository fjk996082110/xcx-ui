import { get, post } from '../utils/https'
// 登陆
export function login(username, password) {
  return post(
    '/info/login',
    {
      username,
      password
    }
  )
}