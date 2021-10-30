module.exports = (req, res) => {
  const { name = 'World' } = req.query;
  console.log(
    'This logs should be printed in dev and stored somewhere in prod'
  );
  console.log('NEW LOG 123');
  return res.status(200).send(`UPDATED 123 ${name}!`);
};
