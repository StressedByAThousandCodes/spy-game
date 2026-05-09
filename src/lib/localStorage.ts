export function getStoredDeviceToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("device_token");
}

export function setStoredDeviceToken(
  token: string
) {
  localStorage.setItem("device_token", token);
}