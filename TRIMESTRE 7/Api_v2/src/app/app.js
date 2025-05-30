import express from 'express';
import userRouter from '../routers/user.router.js';
import morgan from 'morgan';
import userStatusRouter from '../routers/userStatus.router.js';
import roleRouter from '../routers/role.router.js';

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use('/api/v1', userRouter);
app.use('/api/v1', userStatusRouter);
app.use('/api/v1', roleRouter);


app.use((req, res, next) => {
  res.status(404).json({
    Message: 'Endpoint losses'
  });
});

export default app;
