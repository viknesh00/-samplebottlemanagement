export const getCookie = (cname) => {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

export const setCookie = (name, value, expires) => {
  let cookieData = encodeURI(name) + '=' + encodeURI(value) + ';'
  if (expires) {
    var d = new Date(expires)
    cookieData = cookieData + ' expires=' + d.toGMTString() + ';'
  }
  cookieData = cookieData + ' path = /;'
  document.cookie = cookieData
}

export const cookieKeys = (user, time) => {
  var userList = Object.keys(user)
  userList.forEach((item) => {
    setCookie(`${item}`, user[`${item}`], time)
  })
}
