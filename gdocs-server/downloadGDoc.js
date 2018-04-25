var authHeader = (token => `Authorization: " Bearer ${token}"`);

var downDoc = exports.downDoc = ((id,name,token) => `curl 'https://docs.google.com/document/d/${id}/export?format=html -H "${authHeader(token)}" -o ./downloads/${name}.html`)