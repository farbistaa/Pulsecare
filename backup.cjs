const { exec } = require('child_process');

const command = `PGPASSWORD="npg_F8b7MTjVPSQd" pg_dump -h ep-blue-smoke-a1s439xu-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d neondb > backup.sql`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log('Backup completed successfully!');
});