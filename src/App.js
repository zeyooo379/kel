import React, { useState } from 'react';
import './App.css';
import originalWordsData from './words.json';
import newWordsData from './new_words.json';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('new'); // 'new', 'original', 'all'
  const [quizDirection, setQuizDirection] = useState('en-tr'); // 'en-tr', 'tr-en', 'mix'
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentWord, setCurrentWord] = useState(null);
  const [currentQuestionData, setCurrentQuestionData] = useState({ prompt: '', promptLabel: '', correctAnswer: '' });
  const [options, setOptions] = useState([]);

  const [quizList, setQuizList] = useState([]);
  const [activePool, setActivePool] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Helper: Get active dataset
  const getCategoryPool = (categoryKey) => {
    if (categoryKey === 'original') return originalWordsData;
    if (categoryKey === 'new') return newWordsData;
    return [...originalWordsData, ...newWordsData];
  };

  // Start game with chosen count or 'unlimited'
  const startGame = (countOption) => {
    const pool = getCategoryPool(selectedCategory);
    const unlimited = countOption === 'unlimited';
    const count = unlimited ? pool.length : Math.min(countOption, pool.length);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const initialList = unlimited ? shuffled : shuffled.slice(0, count);

    setIsUnlimitedMode(unlimited);
    setActivePool(pool);
    setTotalWords(unlimited ? 0 : count);
    setQuizList(initialList);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setWrongAnswers([]);
    setGameStarted(true);
    setGameOver(false);

    loadQuestion(0, initialList, pool);
  };

  // Load question by index
  const loadQuestion = (index, list, pool) => {
    const poolToUse = pool || activePool;
    let listToUse = list || quizList;

    // If unlimited mode and list reached end, reshuffle pool
    if (isUnlimitedMode && index >= listToUse.length) {
      listToUse = [...poolToUse].sort(() => 0.5 - Math.random());
      setQuizList(listToUse);
      index = 0;
      setCurrentIndex(0);
    } else if (!isUnlimitedMode && index >= listToUse.length) {
      setGameOver(true);
      setGameStarted(false);
      return;
    }

    const targetWord = listToUse[index];
    if (!targetWord) return;

    // Determine direction for this question
    let currentDir = quizDirection;
    if (quizDirection === 'mix') {
      currentDir = Math.random() > 0.5 ? 'en-tr' : 'tr-en';
    }

    let prompt = '';
    let promptLabel = '';
    let correctAnswer = '';
    const wrongOptions = [];

    if (currentDir === 'en-tr') {
      prompt = targetWord.en;
      promptLabel = 'İngilizce ➔ Türkçe Anlamı';
      correctAnswer = targetWord.tr;

      while (wrongOptions.length < 3) {
        const wrongIndex = Math.floor(Math.random() * poolToUse.length);
        const wrongWord = poolToUse[wrongIndex];

        if (wrongWord.id !== targetWord.id && !wrongOptions.includes(wrongWord.tr) && wrongWord.tr !== targetWord.tr) {
          wrongOptions.push(wrongWord.tr);
        }
      }
    } else {
      // tr-en
      prompt = targetWord.tr;
      promptLabel = 'Türkçe ➔ İngilizce Kelime';
      correctAnswer = targetWord.en;

      while (wrongOptions.length < 3) {
        const wrongIndex = Math.floor(Math.random() * poolToUse.length);
        const wrongWord = poolToUse[wrongIndex];

        if (wrongWord.id !== targetWord.id && !wrongOptions.includes(wrongWord.en) && wrongWord.en !== targetWord.en) {
          wrongOptions.push(wrongWord.en);
        }
      }
    }

    const allOptions = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

    setCurrentWord(targetWord);
    setCurrentQuestionData({ prompt, promptLabel, correctAnswer });
    setOptions(allOptions);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // Option selection
  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestionData.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
      setWrongAnswers((prev) => [
        ...prev,
        {
          question: currentQuestionData.prompt,
          correct: currentQuestionData.correctAnswer,
          userChoice: option
        }
      ]);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    loadQuestion(nextIdx, quizList, activePool);
  };

  // End quiz manually
  const handleEndQuiz = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  // Restart Quiz
  const handleRestart = () => {
    setGameStarted(false);
    setGameOver(false);
  };

  // Helper names
  const getCategoryName = (key) => {
    if (key === 'original') return 'Genel Kelimeler';
    if (key === 'new') return 'Sonradan Eklenenler';
    return 'Tüm Kelimeler';
  };

  const getDirectionName = (key) => {
    if (key === 'en-tr') return 'İngilizce ➔ Türkçe';
    if (key === 'tr-en') return 'Türkçe ➔ İngilizce';
    return 'Karışık Yön';
  };

  // Calculate Accuracy
  const totalAnswered = currentIndex + (isAnswered ? 1 : 0);
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const progressPercent = isUnlimitedMode ? 100 : totalWords > 0 ? (totalAnswered / totalWords) * 100 : 0;

  return (
    <div className="App">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className="quiz-card">
        <header className="app-header">
          <h1 className="app-title">Kelime Öğren</h1>
          <p className="app-subtitle">İngilizce kelime bilginizi eğlenceli şekilde geliştirin</p>
        </header>

        {!gameStarted && !gameOver && (
          <div className="start-selection-container">
            {/* Step 1: Category Selection */}
            <div className="step-title">1. Kelime Setini Seçin:</div>
            <div className="category-grid">
              <div
                className={`category-card ${selectedCategory === 'new' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('new')}
              >
                <div className="cat-header">
                  <span className="cat-icon">🌟</span>
                  <span className="cat-badge">{newWordsData.length} Kelime</span>
                </div>
                <div className="cat-title">Sonradan Eklenenler</div>
                <div className="cat-desc">531 adet yeni kelime seti</div>
              </div>

              <div
                className={`category-card ${selectedCategory === 'original' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('original')}
              >
                <div className="cat-header">
                  <span className="cat-icon">📚</span>
                  <span className="cat-badge">{originalWordsData.length} Kelime</span>
                </div>
                <div className="cat-title">Genel Kelimeler</div>
                <div className="cat-desc">Başlangıç temel seti</div>
              </div>

              <div
                className={`category-card ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <div className="cat-header">
                  <span className="cat-icon">🔀</span>
                  <span className="cat-badge">{originalWordsData.length + newWordsData.length} Kelime</span>
                </div>
                <div className="cat-title">Tüm Kelimeler</div>
                <div className="cat-desc">Tüm kelimelerden karma</div>
              </div>
            </div>

            {/* Step 2: Direction Selection */}
            <div className="step-title">2. Soru Yönünü Seçin:</div>
            <div className="direction-grid">
              <div
                className={`direction-card ${quizDirection === 'en-tr' ? 'active' : ''}`}
                onClick={() => setQuizDirection('en-tr')}
              >
                <div className="dir-header">
                  <span className="dir-icon">🇬🇧 ➔ 🇹🇷</span>
                </div>
                <div className="dir-title">İngilizce ➔ Türkçe</div>
                <div className="dir-desc">Soru İngilizce, şıklar Türkçe</div>
              </div>

              <div
                className={`direction-card ${quizDirection === 'tr-en' ? 'active' : ''}`}
                onClick={() => setQuizDirection('tr-en')}
              >
                <div className="dir-header">
                  <span className="dir-icon">🇹🇷 ➔ 🇬🇧</span>
                </div>
                <div className="dir-title">Türkçe ➔ İngilizce</div>
                <div className="dir-desc">Soru Türkçe, şıklar İngilizce</div>
              </div>

              <div
                className={`direction-card ${quizDirection === 'mix' ? 'active' : ''}`}
                onClick={() => setQuizDirection('mix')}
              >
                <div className="dir-header">
                  <span className="dir-icon">🔀</span>
                </div>
                <div className="dir-title">Karışık Yön</div>
                <div className="dir-desc">Rasgele çift yönlü sorular</div>
              </div>
            </div>

            {/* Step 3: Question Count */}
            <div className="step-title">3. Kelime Sayısını Seçin:</div>
            <div className="word-selection-grid">
              {[5, 15, 30, 50, 100].map((count) => (
                <div key={count} className="select-card" onClick={() => startGame(count)}>
                  <span className="count-num">{count}</span>
                  <span className="count-label">
                    {count === 5 ? 'Hızlı' : count === 15 ? 'Standart' : count === 30 ? 'Orta' : count === 50 ? 'Gelişmiş' : 'Maraton'}
                  </span>
                </div>
              ))}
              <div className="select-card" onClick={() => startGame('unlimited')}>
                <span className="count-num">♾️</span>
                <span className="count-label">Sınırsız</span>
              </div>
            </div>
          </div>
        )}

        {gameStarted && currentWord && (
          <div className="quiz-view">
            {/* Header info */}
            <div className="quiz-top-bar">
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge cat-info-badge">
                  {getCategoryName(selectedCategory)}
                </span>
                <span className="badge">
                  {getDirectionName(quizDirection)}
                </span>
                <span className="badge">
                  Soru: <strong>{currentIndex + 1} {isUnlimitedMode ? '/ ♾️' : `/ ${totalWords}`}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge score-badge">
                  ✓ {score}
                </span>
                <span className="badge streak-badge">
                  🔥 {streak}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>

            {/* Question Banner */}
            <div className="question-box">
              <div className="question-label">{currentQuestionData.promptLabel}</div>
              <h2 className="question-word">{currentQuestionData.prompt}</h2>
            </div>

            {/* Options */}
            <div className="options-grid">
              {options.map((option, idx) => {
                let btnStateClass = '';
                if (isAnswered) {
                  if (option === currentQuestionData.correctAnswer) {
                    btnStateClass = 'correct';
                  } else if (option === selectedOption) {
                    btnStateClass = 'wrong';
                  } else {
                    btnStateClass = 'dimmed';
                  }
                }

                return (
                  <button
                    key={idx}
                    className={`option-btn ${btnStateClass}`}
                    onClick={() => handleOptionClick(option)}
                    disabled={isAnswered}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="action-controls">
              <button className="secondary-btn" onClick={handleEndQuiz}>
                Quizi Bitir 🏁
              </button>
              {isAnswered && (
                <button className="primary-btn" onClick={handleNextQuestion}>
                  {!isUnlimitedMode && currentIndex + 1 >= totalWords ? 'Sonuçları Gör 🎉' : 'Sonraki Kelime →'}
                </button>
              )}
            </div>
          </div>
        )}

        {gameOver && (
          <div className="results-container">
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px' }}>Tebrikler! Quiz Tamamlandı</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Set: <strong>{getCategoryName(selectedCategory)}</strong> • Mod: <strong>{getDirectionName(quizDirection)}</strong>
            </p>

            <div className="score-circle">
              <span className="score-percent">%{accuracy}</span>
              <span className="score-subtitle">Başarı Oranı</span>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-val correct">{score}</div>
                <div className="stat-lbl">Doğru Cevap</div>
              </div>
              <div className="stat-box">
                <div className="stat-val wrong">{wrongAnswers.length}</div>
                <div className="stat-lbl">Yanlış Cevap</div>
              </div>
            </div>

            {wrongAnswers.length > 0 && (
              <div className="wrong-review-section">
                <div className="wrong-review-title">
                  <span>Tekrar Etmeniz Gereken Kelimeler ({wrongAnswers.length})</span>
                </div>
                <div className="review-list">
                  {wrongAnswers.map((item, i) => (
                    <div key={i} className="review-item">
                      <span className="review-en">{item.question}</span>
                      <span className="review-tr">{item.correct}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={handleRestart}>
              Yeni Quiz Başlat 🔄
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
