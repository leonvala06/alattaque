exports.paust = (req, res, next) => {
    console.log('post reçu');
    console.log(req);
    console.log(res);
  };

exports.gait = (req, res, next) => {
    console.log('get reçu');
    Carre.findOne({ _id: req.params.id })
      .then(carre => res.status(200).json(carre))
      .catch(error => res.status(404).json({ error }));
  };