const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todoRoutes = require('./routes/todo');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB URL 환경변수 확인 및 디버깅
if (!process.env.MONGO_URL) {
  console.warn('⚠️  MONGO_URL 환경변수가 설정되지 않았습니다. 기본값을 사용합니다.');
  console.warn('   .env 파일이 프로젝트 루트에 있는지 확인하세요.');
} else {
  console.log('✓ MONGO_URL 환경변수가 로드되었습니다.');
  console.log(`   MongoDB URI: ${process.env.MONGO_URL.substring(0, 40)}...`);
}

const MONGODB_URI = process.env.MONGO_URL || 'mongodb://localhost:27017/todo-backend';

// CORS 설정 - 개발 환경에서 모든 origin 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// 모든 라우트에 CORS 헤더 명시적으로 추가 (이중 안전장치)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  next();
});

// JSON 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 설정
app.use('/api/todos', todoRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Todo Backend API is running!' });
});

// MongoDB 연결 이벤트 리스너
mongoose.connection.on('connected', () => {
  console.log('연결 성공');
  console.log(`MongoDB 데이터베이스: ${mongoose.connection.name}`);
  console.log(`MongoDB 호스트: ${mongoose.connection.host}:${mongoose.connection.port}`);
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB 연결 오류:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다.');
});

// 서버 시작
const server = app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // MongoDB 연결 (서버는 MongoDB 연결과 관계없이 시작)
  try {
    // 이미 연결되어 있으면 재연결하지 않음
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    } else if (mongoose.connection.readyState === 1) {
      console.log('연결 성공');
      console.log(`MongoDB 데이터베이스: ${mongoose.connection.name}`);
      console.log(`MongoDB 호스트: ${mongoose.connection.host}:${mongoose.connection.port}`);
    }
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    console.warn('⚠️  서버는 실행 중이지만 MongoDB가 연결되지 않았습니다.');
    console.warn('MongoDB가 실행 중인지 확인해주세요.');
  }
});

// 포트 충돌 처리
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`포트 ${PORT}가 이미 사용 중입니다.`);
    console.error('다른 프로세스를 종료하거나 다른 포트를 사용하세요.');
  } else {
    console.error('서버 오류:', error);
  }
});

