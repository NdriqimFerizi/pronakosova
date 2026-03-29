module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') console.error('💥', err);
  if (err.name === 'CastError')        return res.status(404).json({ success:false, message:'Nuk u gjet.' });
  if (err.code === 11000) { const f = Object.keys(err.keyValue)[0]; return res.status(400).json({ success:false, message:`'${f}' ekziston tashmë.` }); }
  if (err.name === 'ValidationError') { return res.status(400).json({ success:false, message:Object.values(err.errors).map(e=>e.message).join('. ') }); }
  res.status(err.statusCode||500).json({ success:false, message:err.message||'Gabim.' });
};
