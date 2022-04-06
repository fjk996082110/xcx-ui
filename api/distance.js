import { get, post } from '../utils/https'
const dayjs = require("./dayjs");

export function getDistance() {
  const d = dayjs('2022-04-03').format('YYYY-MM-DD');
  return get(
    '/distances/getDistances',
    {
      date: d,
    }
  )
}