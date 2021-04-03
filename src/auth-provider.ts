import * as functions from 'firebase-functions';
import express from 'express';
import expressHbs from 'express-handlebars';
import authRouter from './routes/auth';
import path from 'path';
import handlebars from 'handlebars';
const app = express();
app.engine(
  '.hbs',
  expressHbs({
    extname: '.hbs',
    handlebars,
  })
);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/login.css', (_, res) =>
  res.sendFile(path.join(__dirname, '/public/login/login.css'))
);
app.use('/auth', authRouter);

export const authProvider = functions.https.onRequest(app);
