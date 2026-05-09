const CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(
      Math.floor(Math.random() * CHARACTERS.length)
    );
  }

  return result;
}