function getJSONCookie(cookieName) {
  try {
    const cookie = document.cookie
      .split(";")
      .find((cookie) => cookie.includes(cookieName));
    return cookie ? JSON.parse(decodeURIComponent(cookie.split("=")[1])) : null;
  }
    catch (error) {
      return null;
    }
  }

function setJSONCookie(cookieName, data) {
    document.cookie = `${cookieName}=${encodeURIComponent(
      JSON.stringify(data)
    )}; path=/; SameSite=None; Secure; max-age=31536000`;
  };

export { getJSONCookie, setJSONCookie };