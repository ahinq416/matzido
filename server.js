const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// public 폴더 안의 HTML, CSS 파일을 웹에 공개
app.use(express.static(path.join(__dirname, 'public')));

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});