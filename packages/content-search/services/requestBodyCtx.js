const isJsonValid = str => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

module.exports = {
  generateRequestBodyCtx: (ctx, param) => {
    if (
      Object.keys(ctx.request.body).length === 0 ||
      !isJsonValid(ctx.request.body) ||
      !JSON.parse(ctx.request.body).hasOwnProperty(param)
    ) {
      return ctx.throw(400, "Malformed request body");
    }
    return JSON.parse(ctx.request.body);
  }
};

