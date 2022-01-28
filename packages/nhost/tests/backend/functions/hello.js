module.exports = (req, res) => {
  const { name = 'World' } = req.post;
  res.status(200).send(`Hello ${name}!`);
};
