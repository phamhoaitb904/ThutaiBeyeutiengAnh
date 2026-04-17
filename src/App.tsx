import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Trophy, RotateCcw, Volume2, X, Smile, Check, ArrowRight, Settings, Plus, Trash2, Save, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraFaceTracker } from './components/CameraFaceTracker';
import { QUESTIONS as INITIAL_QUESTIONS } from './data/questions';
import { GameState, Question, GameConfig, FeedbackState } from './types';
import { playSound, speakText } from './lib/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [playerName, setPlayerName] = useState('');
  const [className, setClassName] = useState('');
  const [score, setScore] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  
  const [config, setConfig] = useState<GameConfig>({
    timePerQuestion: 10,
    difficulty: 'all',
    useCamera: false,
  });

  // Load questions from localStorage or use initial ones
  const [allQuestions, setAllQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('game_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  const bgPattern = "bg-[#f0fdfa] bg-[radial-gradient(#99f6e4_3px,transparent_3px)] [background-size:24px_24px]";

  const saveQuestions = (newQuestions: Question[]) => {
    setAllQuestions(newQuestions);
    localStorage.setItem('game_questions', JSON.stringify(newQuestions));
  };

  const startGame = () => {
    if (!playerName.trim() || !className.trim()) {
      alert("Cô ơi, hãy nhập đầy đủ tên và lớp cho bé trước khi bắt đầu nhé!");
      return;
    }

    let qList = allQuestions;
    if (config.difficulty !== 'all') {
      qList = allQuestions.filter(q => q.level === parseInt(config.difficulty));
    }
    
    qList = [...qList].sort(() => Math.random() - 0.5).slice(0, 10);

    if (qList.length === 0) {
      alert("Không có câu hỏi cho mức độ này!");
      return;
    }

    setFilteredQuestions(qList);
    setScore(0);
    setCurrentQuestionIdx(0);
    setGameState('playing');
    setFeedback(null);
    setIsLocked(false);
    setIsCooldown(false);
    startTurn(qList[0]);
  };

  const startTurn = (question: Question) => {
    setTimeLeft(config.timePerQuestion);
    speakText(question.text);
    setIsCooldown(true);
    setTimeout(() => {
      setIsCooldown(false);
    }, 1500);
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && !isLocked && !isCooldown && timeLeft > 0) {
      timer = setTimeout(() => {
        if (timeLeft <= 5) playSound('tick');
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (gameState === 'playing' && !isLocked && !isCooldown && timeLeft === 0) {
      handleAnswer(-1); 
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, isLocked, isCooldown]);

  const handleAnswer = useCallback((selectedIndex: number) => {
    if (isLocked || isCooldown) return;
    setIsLocked(true);

    const question = filteredQuestions[currentQuestionIdx];
    const isCorrect = selectedIndex === question.answer;

    if (isCorrect) {
      playSound('correct');
      setFeedback({ isCorrect: true, message: "🎉 Tuyệt vời!" });
      setScore(prev => prev + question.points);
    } else {
      playSound('wrong');
      setFeedback({ isCorrect: false, message: "😊 Thử lại nhé!" });
    }

    setTimeout(() => {
      setFeedback(null);
      setIsLocked(false);
      
      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx < filteredQuestions.length) {
        setCurrentQuestionIdx(nextIdx);
        startTurn(filteredQuestions[nextIdx]);
      } else {
        setGameState('result');
      }
    }, 2500);
  }, [currentQuestionIdx, filteredQuestions, isLocked, isCooldown]);

  const currentQuestion = useMemo(() => filteredQuestions[currentQuestionIdx], [filteredQuestions, currentQuestionIdx]);

  return (
    <div className={`min-h-screen flex flex-col ${bgPattern} overflow-x-hidden`}>
      <AnimatePresence mode="wait">
        {gameState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-4"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-3xl w-full p-8 md:p-12 border-8 border-cyan-100 relative">
              <button 
                onClick={() => setGameState('admin')}
                className="absolute top-4 right-4 p-2 text-cyan-200 hover:text-cyan-600 transition"
                title="Quản trị câu hỏi"
              >
                <Settings size={24} />
              </button>

              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-black text-cyan-600 mb-2 tracking-tight uppercase">
                  Ai Nhanh Hơn
                </h1>
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mb-4 uppercase animate-pulse">
                  Bé Yêu Tiếng Anh
                </h2>
                <div className="text-gray-500 font-bold text-sm md:text-base">
                  <p>Sáng lập: TRƯỜNG MẦM NON THAN UYÊN</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <label className="block text-xl font-black text-cyan-800 text-center md:text-left">Tên bé là gì nhỉ?</label>
                  <input 
                    type="text" 
                    placeholder="Tên học sinh..."
                    className="w-full text-center text-xl md:text-2xl font-bold p-4 rounded-2xl border-4 border-cyan-300 focus:outline-none focus:border-orange-400 focus:ring-4 ring-orange-200 transition-all text-gray-700 placeholder-gray-300"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-xl font-black text-cyan-800 text-center md:text-left">Bé học lớp nào?</label>
                  <input 
                    type="text" 
                    placeholder="Tên lớp..."
                    className="w-full text-center text-xl md:text-2xl font-bold p-4 rounded-2xl border-4 border-cyan-300 focus:outline-none focus:border-orange-400 focus:ring-4 ring-orange-200 transition-all text-gray-700 placeholder-gray-300"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startGame()}
                  />
                </div>
              </div>

              <div className="bg-cyan-50 rounded-2xl p-6 border-2 border-cyan-200 mb-8 max-w-xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <label className="font-bold text-cyan-800 text-lg whitespace-nowrap">⏳ Mỗi câu:</label>
                  <select 
                    className="w-full sm:w-auto p-3 rounded-xl border-2 border-cyan-300 font-bold text-cyan-700 bg-white"
                    value={config.timePerQuestion}
                    onChange={e => setConfig({...config, timePerQuestion: parseInt(e.target.value)})}
                  >
                    <option value={10}>10 Giây</option>
                    <option value={15}>15 Giây</option>
                    <option value={20}>20 Giây</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <label className="font-bold text-cyan-800 text-lg whitespace-nowrap">🎯 Độ khó:</label>
                  <select 
                    className="w-full sm:w-auto p-3 rounded-xl border-2 border-cyan-300 font-bold text-cyan-700 bg-white"
                    value={config.difficulty}
                    onChange={e => setConfig({...config, difficulty: e.target.value})}
                  >
                    <option value="all">Tất cả</option>
                    <option value={1}>Mức 1 (Dễ)</option>
                    <option value={2}>Mức 2 (TB)</option>
                    <option value={3}>Mức 3 (Khó)</option>
                  </select>
                </div>

                <label className="flex items-center justify-center gap-3 mt-4 cursor-pointer p-3 bg-white rounded-xl border-2 border-dashed border-cyan-300 hover:bg-cyan-100 transition">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 text-orange-500 rounded"
                    checked={config.useCamera}
                    onChange={e => setConfig({...config, useCamera: e.target.checked})}
                  />
                  <span className="font-bold text-cyan-800 text-sm md:text-base">📷 Bật Nhận Diện Khuôn Mặt (AI)</span>
                </label>
              </div>

              <div className="text-center">
                <button 
                  onClick={startGame}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-2xl py-4 px-12 rounded-full shadow-[0_8px_0_0_rgba(194,65,12,1)] active:shadow-none active:translate-y-2 transition-all"
                >
                  BẮT ĐẦU CHƠI
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="bg-white/90 backdrop-blur-md border-b-4 border-cyan-200 p-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
              <div className="flex gap-2 items-center">
                 <div className="px-4 py-1.5 rounded-full font-bold text-white bg-pink-500 shadow-sm flex items-center gap-2 text-xs md:text-sm">
                    <Users size={16}/> {playerName} • {className} <span className="opacity-50 px-1">|</span> {score}đ
                 </div>
              </div>
              <div className="hidden sm:block font-black text-base text-cyan-800 bg-cyan-100 px-4 py-1 rounded-full border border-cyan-300">
                Câu {currentQuestionIdx + 1} / {filteredQuestions.length}
              </div>
              <button 
                onClick={() => setGameState('setup')}
                className="text-gray-400 hover:text-red-500 font-bold flex items-center gap-1 p-2 transition"
              >
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
              <motion.div 
                key={currentQuestion.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 w-full max-w-5xl border-8 border-yellow-300 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-40 h-40 md:w-64 md:h-64 bg-cyan-50 rounded-full border-8 border-cyan-200 flex items-center justify-center text-7xl md:text-9xl shadow-inner"
                    >
                       {currentQuestion.image}
                    </motion.div>
                    <CameraFaceTracker onGesture={handleAnswer} isCameraEnabled={config.useCamera} isLocked={isLocked || isCooldown} />
                  </div>

                  <div className="flex-1 flex flex-col w-full text-center md:text-left">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex-1">
                          <div className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-xs border border-orange-200 mb-2 inline-block">
                            Mức {currentQuestion.level} • {currentQuestion.points}đ
                          </div>
                          <h2 className="text-3xl md:text-5xl font-black text-gray-800 flex flex-wrap items-center justify-center md:justify-start gap-3 leading-tight">
                            {currentQuestion.text}
                            <button onClick={() => speakText(currentQuestion.text)} className="p-2 rounded-full bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition">
                              <Volume2 size={24}/>
                            </button>
                          </h2>
                       </div>
                       
                       <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 ml-4 hidden md:block">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke={timeLeft <= 3 ? '#ef4444' : '#10b981'} strokeWidth="8" 
                                    strokeDasharray="283" 
                                    strokeDashoffset={283 - (283 * timeLeft) / config.timePerQuestion} 
                                    className="transition-all duration-1000 ease-linear" />
                          </svg>
                          <span className={`absolute inset-0 flex items-center justify-center text-xl md:text-2xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {timeLeft}
                          </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {currentQuestion.options.map((opt, idx) => {
                        const isCorrectAnswer = idx === currentQuestion.answer;
                        const label = String.fromCharCode(65 + idx);
                        
                        let baseStyle = "bg-white border-gray-200 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50";
                        if (currentQuestion.type === 'tf') {
                          baseStyle = idx === 0 
                            ? "bg-green-50 border-green-200 text-green-700 hover:border-green-400" 
                            : "bg-red-50 border-red-200 text-red-700 hover:border-red-400";
                        }

                        if (feedback) {
                           if (isCorrectAnswer) baseStyle = "bg-green-500 border-green-600 text-white scale-105 shadow-lg";
                           else baseStyle = "bg-gray-100 border-gray-200 text-gray-400 opacity-50";
                        }

                        return (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            key={idx}
                            disabled={isLocked || isCooldown}
                            onClick={() => handleAnswer(idx)}
                            className={`relative p-4 md:p-6 rounded-2xl border-4 text-lg md:text-3xl font-black transition-all ${baseStyle}`}
                          >
                            <span className="absolute top-2 left-3 text-[10px] md:text-xs opacity-50 font-black">
                              {label} {config.useCamera && (
                                <span className="ml-1 hidden sm:inline">• {['Nghiêng', 'Thẳng', 'Há miệng', 'Nhe răng'][idx]}</span>
                              )}
                            </span>
                            <span className="block mt-2">{opt}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20"
                    >
                      <motion.div 
                        initial={{ scale: 0.5, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="text-center px-4"
                      >
                        <div className={`p-6 md:p-8 rounded-full shadow-2xl mb-6 mx-auto w-fit ${feedback.isCorrect ? 'bg-green-500' : 'bg-orange-500'}`}>
                          {feedback.isCorrect ? <Check size={50} className="md:w-20 md:h-20" color="white" strokeWidth={4} /> : <X size={50} className="md:w-20 md:h-20" color="white" strokeWidth={4} />}
                        </div>
                        <h2 className={`text-4xl md:text-7xl font-black drop-shadow-md ${feedback.isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
                          {feedback.message}
                        </h2>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex-1 flex items-center justify-center p-4 text-center"
          >
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-16 text-center max-w-2xl w-full border-8 border-yellow-300 relative overflow-hidden">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-10 -left-10 text-yellow-300 opacity-20"
              >
                <Trophy size={200} />
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-black text-orange-500 mb-8">KẾT QUẢ</h2>
              <div className="mb-10">
                <p className="text-xl md:text-2xl font-bold text-gray-500 mb-2">Chúc mừng bé:</p>
                <h3 className="text-3xl md:text-6xl font-black text-pink-500 mb-2 uppercase tracking-wide">
                  {playerName}
                </h3>
                <p className="text-lg md:text-xl font-bold text-cyan-500 mb-8">Lớp: {className}</p>
                
                <p className="text-xl md:text-2xl font-bold text-gray-500 mb-2">Điểm đạt được:</p>
                <div className="text-6xl md:text-8xl font-black text-yellow-500 drop-shadow-md flex items-center justify-center gap-4">
                  🌟 {score}
                </div>
              </div>

              <button 
                onClick={() => setGameState('setup')}
                className="group flex items-center justify-center gap-3 mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xl md:text-2xl py-4 px-10 rounded-full shadow-[0_6px_0_0_rgba(8,145,178,1)] active:shadow-none active:translate-y-1.5 transition-all"
              >
                <RotateCcw className="group-hover:rotate-[-45deg] transition-transform" /> 
                CHƠI LẠI
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'admin' && (
          <AdminPanel 
            questions={allQuestions} 
            onSave={saveQuestions} 
            onClose={() => setGameState('setup')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- ADMIN PANEL COMPONENT ---
function AdminPanel({ questions, onSave, onClose }: { questions: Question[], onSave: (q: Question[]) => void, onClose: () => void }) {
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q, options: [...q.options] });
  };

  const handleDelete = (id: number) => {
    if (confirm("Xóa câu hỏi này?")) {
      const updated = localQuestions.filter(q => q.id !== id);
      setLocalQuestions(updated);
    }
  };

  const handleAdd = () => {
    const nextId = localQuestions.length > 0 ? Math.max(...localQuestions.map(q => q.id)) + 1 : 1;
    const newQ: Question = {
      id: nextId,
      level: 1,
      type: 'mcq',
      image: '❓',
      text: 'Câu hỏi mới?',
      options: ['ĐA 1', 'ĐA 2', 'ĐA 3', 'ĐA 4'],
      answer: 0,
      points: 10
    };
    setLocalQuestions([newQ, ...localQuestions]);
    handleEdit(newQ);
  };

  const saveEdit = () => {
    if (editForm) {
      const updated = localQuestions.map(q => q.id === editForm.id ? editForm : q);
      setLocalQuestions(updated);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleGlobalSave = () => {
    onSave(localQuestions);
    alert("Đã lưu nội dung câu hỏi!");
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-cyan-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl p-6 md:p-10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-black text-cyan-800 flex items-center gap-2">
            <Settings size={32} /> QUẢN TRỊ CÂU HỎI
          </h2>
          <div className="flex gap-2">
             <button onClick={handleAdd} className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl flex items-center gap-2 font-bold shadow-md transition">
               <Plus size={20}/> Thêm mới
             </button>
             <button 
               onClick={() => {
                 if(confirm("Khôi phục toàn bộ câu hỏi về mặc định? Dữ liệu bạn đã sửa sẽ bị mất.")) {
                   setLocalQuestions(INITIAL_QUESTIONS);
                 }
               }} 
               className="bg-orange-400 hover:bg-orange-500 text-white p-3 rounded-xl flex items-center gap-2 font-bold shadow-md transition"
               title="Khôi phục mặc định"
             >
               <RotateCcw size={20}/> Khôi phục
             </button>
             <button onClick={handleGlobalSave} className="bg-cyan-600 hover:bg-cyan-700 text-white p-3 rounded-xl flex items-center gap-2 font-bold shadow-md transition">
               <Save size={20}/> Lưu tất cả
             </button>
             <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition">
               <X size={24}/>
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {localQuestions.map(q => (
            <div key={q.id} className="bg-cyan-50 border-2 border-cyan-100 rounded-2xl p-4 transition-all hover:border-cyan-200">
              {editingId === q.id && editForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-600 uppercase">Hình ảnh (Emoji):</label>
                      <input 
                        type="text" 
                        className="w-full p-2 rounded-lg border focus:ring-2 ring-cyan-400" 
                        value={editForm.image} 
                        onChange={e => setEditForm({...editForm, image: e.target.value})}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-cyan-600 uppercase">Nội dung câu hỏi (English):</label>
                      <input 
                        type="text" 
                        className="w-full p-2 rounded-lg border focus:ring-2 ring-cyan-400" 
                        value={editForm.text} 
                        onChange={e => setEditForm({...editForm, text: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {editForm.options.map((opt, i) => (
                      <div key={i} className={`space-y-1 p-2 rounded-xl border-2 ${editForm.answer === i ? 'bg-green-50 border-green-300' : 'bg-white border-gray-100'}`}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase flex justify-between">
                          ĐA {String.fromCharCode(65 + i)}
                          <input 
                            type="radio" 
                            name={`answer-${q.id}`} 
                            checked={editForm.answer === i} 
                            onChange={() => setEditForm({...editForm, answer: i})} 
                          />
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-1 text-sm border-none bg-transparent focus:ring-0" 
                          value={opt} 
                          onChange={e => {
                            const newOps = [...editForm.options];
                            newOps[i] = e.target.value;
                            setEditForm({...editForm, options: newOps});
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
                    <div className="flex gap-4">
                       <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                         Mức độ:
                         <select value={editForm.level} onChange={e => setEditForm({...editForm, level: parseInt(e.target.value)})} className="p-1 border rounded">
                           <option value={1}>1 (Dễ)</option>
                           <option value={2}>2 (TB)</option>
                           <option value={3}>3 (Khó)</option>
                         </select>
                       </label>
                       <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                         Điểm:
                         <input type="number" value={editForm.points} onChange={e => setEditForm({...editForm, points: parseInt(e.target.value)})} className="w-16 p-1 border rounded" />
                       </label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-700">Hủy</button>
                      <button onClick={saveEdit} className="px-6 py-2 bg-pink-500 text-white font-bold rounded-lg shadow-md hover:bg-pink-600">Xong</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl bg-white w-14 h-14 flex items-center justify-center rounded-full border shadow-sm">{q.image}</span>
                    <div>
                      <h4 className="font-bold text-cyan-900 text-lg leading-tight">{q.text}</h4>
                      <p className="text-xs text-cyan-600 font-semibold mt-1">
                        Mức: {q.level} | {q.points}đ | Đáp án: {String.fromCharCode(65 + q.answer)} ({q.options[q.answer]})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(q)} className="p-2 text-cyan-500 hover:bg-cyan-100 rounded-lg transition"><Plus size={20}/></button>
                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={20}/></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {localQuestions.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-bold">Chưa có câu hỏi nào. Hãy thêm mới!</div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400 font-medium">
          Dữ liệu sẽ được lưu tạm thời trên trình duyệt máy tính này (LocalStorage).
        </div>
      </div>
    </motion.div>
  );
}
