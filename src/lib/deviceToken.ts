import { v4 as uuidv4 } from "uuid";

export function generateDeviceToken() {
  return uuidv4();
}