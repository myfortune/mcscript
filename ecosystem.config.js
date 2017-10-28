module.exports = {
  apps: [{
    name: 'mcscript',
    script: './app.js'
  }],
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-34-227-99-134.compute-1.amazonaws.com',
      key: '~/.ssh/notificationDemo.pem',
      ref: 'origin/master',
      repo: 'git@github.com:myfortune/mcscript.git',
      path: '/home/ec2-user/mcscript',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
