export default function cors(url) {
  return (req, res, next) => {
    res.header({
      'Access-Control-Allow-Origin': url,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept,' +
        ' Authorization',
    });

    next();
  };
}
