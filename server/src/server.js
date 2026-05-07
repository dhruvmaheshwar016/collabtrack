import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

await connectDatabase();

const app = createApp();

app.listen(port, () => {
  console.log(`CollabTrack API listening on port ${port}`);
});
