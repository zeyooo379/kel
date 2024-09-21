import React, { useState } from 'react';
import './App.css'; // CSS dosyasını bağlayalım.
import wordsData from './words.json'; // JSON dosyasını içe aktar

function App() {
  const [gameStarted, setGameStarted] = useState(false); // Oyun başlatıldı mı kontrolü
  const [wordCount, setWordCount] = useState(0); // Kaç kelime ile oynanacağını sakla
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [remainingWords, setRemainingWords] = useState([]); // Kalan kelimeler
  const [wrongAnswers, setWrongAnswers] = useState([]); // Yanlış cevaplar
  const [gameOver, setGameOver] = useState(false); // Oyun bitti mi?

  // Kullanıcı kelime sayısını seçtikten sonra oyunu başlat
  const startGame = (count) => {
    setWordCount(count);
    setGameStarted(true);
    setGameOver(false); // Oyun bitmedi
    setWrongAnswers([]); // Yanlış cevaplar temizlendi

    // Seçilen sayıda kelimeyi rastgele seçip oyunu başlat
    const selectedWords = wordsData.sort(() => 0.5 - Math.random()).slice(0, count);
    setRemainingWords(selectedWords);
    getNextWord(selectedWords);
  };

  // Bir sonraki kelimeyi al
  const getNextWord = (wordsList) => {
    if (wordsList.length === 0) {
      setGameOver(true); // Kelimeler bitti, oyun bitti
      setGameStarted(false);
      return;
    }

    const selectedWord = wordsList[0]; // İlk kelimeyi al
    const wrongOptions = [];

    // Rastgele yanlış seçenekler al
    while (wrongOptions.length < 3) {
      const wrongIndex = Math.floor(Math.random() * wordsData.length);
      const wrongWord = wordsData[wrongIndex];

      // Aynı kelimeyi tekrar eklememek için kontrol
      if (wrongWord.id !== selectedWord.id && !wrongOptions.includes(wrongWord.tr)) {
        wrongOptions.push(wrongWord.tr);
      }
    }

    // Doğru cevabı ve yanlış cevapları karıştır
    const allOptions = [...wrongOptions, selectedWord.tr].sort(() => Math.random() - 0.5);

    setCurrentWord(selectedWord);
    setOptions(allOptions);
    setFeedback(""); // Önceki geri bildirimi temizle

    // Kalan kelimeler listesini güncelle
    setRemainingWords(wordsList.slice(1));
  };

  // Buton tıklandığında sonucu kontrol etme
  const handleOptionClick = (option) => {
    if (option === currentWord.tr) {
      setFeedback("Doğru!");
    } else {
      setFeedback("Yanlış, doğru cevap: " + currentWord.tr);
      setWrongAnswers((prev) => [...prev, { question: currentWord.en, correct: currentWord.tr }]);
    }
  };

  // Oyun bittikten sonra yanlış cevapları göster
  const renderWrongAnswers = () => {
    return (
      <div className="wrong-answers">
        <h3>Yanlış Cevaplarınız:</h3>
        <ul>
          {wrongAnswers.map((answer, index) => (
            <li key={index} className="answer-item">
              <span className="question">{answer.question}:</span>
              <span className="correct-answer">{answer.correct}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => window.location.reload()}>Tekrar Oyna</button>
      </div>
    );
  };

  return (
    <div className="App">
      {!gameStarted && !gameOver ? (
        // Oyun başlamadıysa kullanıcıya kelime sayısını seçtir
        <div className="word-selection">
          <h2>Kaç kelime ile oynamak istersiniz?</h2>
          <button onClick={() => startGame(5)}>5</button>
          <button onClick={() => startGame(30)}>30</button>
          <button onClick={() => startGame(50)}>50</button>
          <button onClick={() => startGame(100)}>100</button>
        </div>
      ) : gameOver ? (
        // Oyun bittiyse yanlış cevapları göster
        renderWrongAnswers()
      ) : (
        // Oyun başladıysa kelime ve seçenekleri göster
        currentWord && (
          <div className="word-container">
            <p><strong>İngilizce:</strong> {currentWord.en}</p>

            <div className="options">
              {options.map((option, index) => (
                <button key={index} onClick={() => handleOptionClick(option)}>
                  {option}
                </button>
              ))}
            </div>

            {feedback && <p className="feedback">{feedback}</p>}

            {/* Yeni kelimeye geçmek için buton */}
            <button onClick={() => getNextWord(remainingWords)}>Sonraki Kelime</button>
          </div>
        )
      )}
    </div>
  );
}

export default App;
