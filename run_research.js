const fs = require('fs');
const readline = require('readline');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/sse/live?query=latest+AI+news&provider=openaicompatible&thinkingModel=alias-huge&taskModel=alias-fast&searchProvider=searxng&maxResult=5&language=en',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer 7wbnkd5ehenf4wn37e3be6',
    'Accept': 'text/event-stream'
  }
};

const file = fs.createWriteStream('ai_news_stream.txt');

console.log('Starting research request...');
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.pipe(file);

  res.on('end', () => {
    console.log('Stream ended.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();

// Simple monitoring loop to check for completion
const checkCompletion = setInterval(() => {
  fs.readFile('ai_news_stream.txt', 'utf8', (err, data) => {
    if (err) return;
    if (data.includes('"step":"final-report","status":"end"')) {
      console.log('Research completed successfully!');
      clearInterval(checkCompletion);
      process.exit(0);
    }
  });
}, 5000);

// Timeout after 5 minutes
setTimeout(() => {
  console.log('Timeout reached (5 minutes). Exiting.');
  process.exit(1);
}, 300000);
