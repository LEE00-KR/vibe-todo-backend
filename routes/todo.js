const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// 모든 할일 조회
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }); // 최신순 정렬
    
    // CORS 헤더 명시적으로 추가
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    
    res.status(200).json({
      success: true,
      message: '할일 목록을 성공적으로 조회했습니다.',
      count: todos.length,
      data: todos
    });
  } catch (error) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      success: false,
      message: '할일 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 할일 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findById(id);
    
    // 할일을 찾지 못한 경우
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '할일을 성공적으로 조회했습니다.',
      data: todo
    });
  } catch (error) {
    // 잘못된 ID 형식인 경우
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '잘못된 ID 형식입니다.'
      });
    }

    res.status(500).json({
      success: false,
      message: '할일 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 생성
router.post('/', async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // title 필수 체크
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: '할일 제목(title)은 필수입니다.' 
      });
    }

    const todo = new Todo({
      title,
      description: description || '',
      completed: completed || false
    });

    const savedTodo = await todo.save();
    
    res.status(201).json({
      success: true,
      message: '할일이 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '할일 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, archived } = req.body;

    // 업데이트할 데이터 구성
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed;
    if (archived !== undefined) updateData.archived = archived;

    // 업데이트할 필드가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: '수정할 필드를 제공해주세요. (title, description, completed, archived)'
      });
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // 할일을 찾지 못한 경우
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '할일이 수정되었습니다.',
      data: todo
    });
  } catch (error) {
    // 잘못된 ID 형식인 경우
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '잘못된 ID 형식입니다.'
      });
    }

    res.status(500).json({
      success: false,
      message: '할일 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findByIdAndDelete(id);
    
    // 할일을 찾지 못한 경우
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '할일이 삭제되었습니다.',
      data: todo
    });
  } catch (error) {
    // 잘못된 ID 형식인 경우
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: '잘못된 ID 형식입니다.'
      });
    }

    res.status(500).json({
      success: false,
      message: '할일 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;

