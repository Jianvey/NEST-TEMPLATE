import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isToday from "dayjs/plugin/isToday"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import weekday from "dayjs/plugin/weekday"

dayjs.extend(utc)
dayjs.extend(isToday)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(weekday)
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(duration)

export const DEFAULT_TIMEZONE = "Asia/Shanghai"
export default dayjs
