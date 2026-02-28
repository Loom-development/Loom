module.exports.hello = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: "Hello from Loom Serverless template" })
});
