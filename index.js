const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/index');

const app = express();
const PORT = 4040;

app.use(cors({
  origin: '*',
  methods: ['HEAD', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'TRACE'],
  optionsSuccessStatus: 204
}));
app.use(express.static('/var/www/prod/html'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.disable('x-powered-by');
app.disable('etag');
app.use('/api/v1', routes);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
