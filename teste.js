try {
  const error = new Error();

  // throw {
  //   code: 500,
  //   messagem: "Error",
  // };

  console.log(error);
  throw error;
} catch (error) {
  console.log(typeof error);
  console.log(error);
}
