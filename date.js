exports.getDate = function () {
  let newday = new Date();

  let options = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  };
  return newday.toLocaleString("en-US", options);
};

exports.getDay = function () {
  let newday = new Date();

  let options = {
    weekday: "long",
  };
  return newday.toLocaleString("en-US", options);
};
