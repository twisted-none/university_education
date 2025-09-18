/**
 * Middleware для проверки авторизации пользователя
 */
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
    
    // Если запрос через API, вернуть JSON с ошибкой
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Иначе перенаправить на страницу входа
    res.redirect('/');
  }
  
  module.exports = {
    isAuthenticated
  };