import React, { useState, useEffect, useRef } from "react";

const App = () => {
  const [transcript, setTranscript] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editWord, setEditWord] = useState({ text: "", sentenceIndex: null, wordIndex: null, originalText: "" });

  const intervalRef = useRef(null);

  // Handle file input
  const handleFileUpload = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      const jsonData = JSON.parse(e.target.result);
      setTranscript(jsonData);
    };
  };

  // Play transcript by highlighting words based on their timings
  const handlePlay = () => {
    setIsPlaying(true);
    const { startTime, endTime } = transcript[currentSentenceIndex].words[currentWordIndex];
    intervalRef.current = setTimeout(() => {
      setCurrentWordIndex((prevIndex) => {
        const currentSentence = transcript[currentSentenceIndex];
        const nextIndex = prevIndex + 1;
        if (nextIndex < currentSentence.words.length) {
          return nextIndex;
        } else {
          setCurrentSentenceIndex((prevSentenceIndex) => prevSentenceIndex + 1);
          return 0;
        }
      });
    }, (endTime - startTime) * 1000);
  };

  // Pause transcript
  const handlePause = () => {
    setIsPlaying(false);
    clearTimeout(intervalRef.current);
  };

  // Reset playback
  const handleReset = () => {
    setIsPlaying(false);
    clearTimeout(intervalRef.current);
    setCurrentWordIndex(0);
    setCurrentSentenceIndex(0);
  };

  // Handle editing of the word
  const handleEditChange = (e) => {
    setEditWord((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleEditApply = () => {
    if (editWord.sentenceIndex !== null && editWord.wordIndex !== null) {
      const { sentenceIndex, wordIndex, text, originalText } = editWord;
      const updatedTranscript = transcript.map((sentence, i) => {
        if (i === sentenceIndex) {
          const updatedWords = sentence.words.map((word, wIndex) => {
            return wIndex === wordIndex ? { ...word, text: text.trim() || originalText } : word;
          });
          return { ...sentence, words: updatedWords };
        }
        return sentence;
      });
      setTranscript(updatedTranscript);
      setEditWord({ text: "", sentenceIndex: null, wordIndex: null, originalText: "" });
    }
  };

  useEffect(() => {
    if (isPlaying) {
      if (
        currentSentenceIndex < transcript.length &&
        currentWordIndex < transcript[currentSentenceIndex].words.length
      ) {
        handlePlay();
      } else {
        handlePause(); // End playback when all words are highlighted
      }
    }
  }, [currentWordIndex, currentSentenceIndex, isPlaying]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">Transcript Editor</h1>
        <input
          type="file"
          accept="application/json"
          onChange={handleFileUpload}
          className="mb-6 p-2 bg-gray-200 border border-gray-300 rounded-lg w-full"
        />

        <div className="mb-6 flex space-x-4">
          <button 
            onClick={handlePlay} 
            className={`px-6 py-2 rounded-lg font-semibold text-white transition duration-300 ${isPlaying ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
            disabled={isPlaying}
          >
            Play
          </button>
          <button 
            onClick={handlePause} 
            className={`px-6 py-2 rounded-lg font-semibold text-white transition duration-300 ${isPlaying ? "bg-gray-400" : "bg-gray-600 hover:bg-gray-700"}`}
            disabled={!isPlaying}
          >
            Pause
          </button>
          <button 
            onClick={handleReset} 
            className="px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition duration-300"
          >
            Reset
          </button>
        </div>

        <div className="transcript bg-gray-100 p-4 rounded-lg shadow-inner">
          {transcript.map((sentence, sentenceIndex) => (
            <div key={sentenceIndex} className="mb-4">
              <span className="text-gray-600 text-sm font-semibold mr-2">
                [{sentence.words[0]?.startTime.toFixed(2)}s]
              </span>
              {sentence.words.map((word, wordIndex) => (
                <React.Fragment key={wordIndex}>
                  <span
                    className={`inline ${sentenceIndex === currentSentenceIndex && wordIndex === currentWordIndex
                      ? "bg-yellow-300 text-black font-semibold"
                      : " text-gray-700"
                    }`}
                    onClick={() => setEditWord({ text: word.text, sentenceIndex, wordIndex, originalText: word.text })}
                  >
                    {editWord.sentenceIndex === sentenceIndex && editWord.wordIndex === wordIndex ? (
                      <input
                        type="text"
                        value={editWord.text}
                        onChange={handleEditChange}
                        onBlur={handleEditApply}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditApply();
                          }
                        }}
                        className=" p-1 rounded-lg outline-none"
                        autoFocus
                      />
                    ) : (
                      word.text
                    )}
                  </span>{" "}
                  {/* Ensure spaces between words */}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
