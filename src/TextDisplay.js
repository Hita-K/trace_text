import React, { useState, useEffect } from 'react';
import './TextDisplay.css';
import mapList from './ehr1-dict.json';
import phraseMapping from './ehr2.json';

const textStyle = {
  color: 'black',
  fontFamily: "'Source Code Pro', monospace",
  fontSize: '26px',
  font: 'Courier',
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  maxWidth: '100cm',
  margin: '0 auto',
  padding: '1rem',
  textAlign: 'left',
};

const interpTextStyle = {
    ...textStyle, // Inherits properties from textStyle
    fontFamily: "'Georgia', serif", // More readable font
    lineHeight: '1.75', // Increased line spacing for better readability
  };

const containerStyle = {
    display: 'flex', // Use flexbox layout
    justifyContent: 'space-around', // Space out children evenly
    padding: '1rem',
    flexDirection: 'row', // Aligns children side by side in a row
  height: '100vh' // Takes full viewport height
  };

// Style for the labels
const labelStyle = {
    fontWeight: 'bold', // Makes the label text bold
    padding: '0 1rem', // Aligns with the text padding
    marginBottom: '0.5rem', // Spacing between the label and the text
  };


function TextDisplay() {
  const [text, setText] = useState('');
  const [hoveredWord, setHoveredWord] = useState('');
  const [summarized, setSummarized] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [clickedWord, setClickedWord] = useState('');
  const [clickedIndex, setClickedIndex] = useState(null);
  const pinkHighlightPhrases = ['bend and turn his head', 'cervical range of motion'];
  const [highlightedWords, setHighlightedWords] = useState([]);




  useEffect(() => {
    fetch('/ehr1.txt')
      .then((response) => response.text())
      .then((data) => setText(data))
      .catch((error) => console.error('Error:', error));

    fetch('/ehr1-interp.txt')
      .then((response) => response.text())
      .then((data) => setSummarized(data))
      .catch((error) => console.error("SKRT", error));

    
  }, []);


  
  const handleClick = (event) => {
    const word = event.target.getAttribute('data-word');
    const refKey = event.target.getAttribute('data-refkey');
  
    // Handle clicks on phrases from mapRef (underlined phrases)
    if (refKey && mapRef.hasOwnProperty(refKey)) {
      console.log(mapRef[refKey]);
      const rect = event.target.getBoundingClientRect();
      setPopupContent(mapRef[refKey]);
      setShowPopup(true);
      setPopupPosition({ 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY - 60 
      });
    
    } 
    // Handle clicks on words that are in mapRef but may not be underlined
    else if (word && mapRef.hasOwnProperty(word)) {
      const rect = event.target.getBoundingClientRect();
      setPopupContent(mapRef[word]);
      setShowPopup(true);
      setPopupPosition({ 
        x: rect.left + window.scrollX, 
        y: rect.top + window.scrollY - 60 
      });
    }
  
    // Handle clicks for updating clickedIndex for mapList
    if (word) {
      const index = Object.keys(mapList).indexOf(word);
      setClickedIndex(index);
    }
  };
  

  // const handleClosePopup = () => {
  //   setShowPopup(false);
  // };

  const getHighlightedText = (inputText, map, mapRef, hoveredWord) => {
    let highlightedText = inputText;
    let processedText = {};
  
    highlightedWords.forEach(phrase => {
      const escapedPhrase = phrase.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
      const phraseRegex = new RegExp(`(\\b${escapedPhrase}\\b)`, 'gi');
      highlightedText = highlightedText.replace(phraseRegex, `<span class="highlight-pink">$&</span>`);
    });

    Object.entries(map).forEach(([key, value]) => {
      const escapedKey = key.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
      const escapedValue = value.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
      const keyRegex = new RegExp(`(\\b${escapedKey}\\b)`, 'gi');
      const valueRegex = new RegExp(`(\\b${escapedValue}\\b)`, 'gi');  

      highlightedText = highlightedText.replace(keyRegex, (_, match) => 
        `<span class="${hoveredWord === key ? 'highlight highlight-active' : 'highlight'}" data-word="${key}">${match}</span>`
      );
      highlightedText = highlightedText.replace(valueRegex, (_, match) => 
        `<span class="${hoveredWord === key ? 'highlight-value highlight-active' : 'highlight-value'}" data-word="${key}">${match}</span>`
      );
  
    });

    Object.keys(mapRef).forEach((key) => {
      const escapedKey = key.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
      const keyRegex = new RegExp(`(\\b${escapedKey}\\b)`, 'gi');
  
      highlightedText = highlightedText.replace(keyRegex, `<span class="underline" data-refkey="${key}">${key}</span>`);
    });

  
    
    return highlightedText;
  };

  const handleMouseOver = event => {
    const word = event.target.getAttribute('data-word');
    setHoveredWord(word || '');
    
    if (word && phraseMapping.hasOwnProperty(word)) {
      setHighlightedWords(phraseMapping[word]);
    } else {
      setHighlightedWords([]);
    }
  
    // Capture the mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    // Capture the current time
    const currentTime = new Date().toLocaleTimeString();
  
    // Log the coordinates and time
    console.log(`Hovered over '${word}': X=${mouseX}, Y=${mouseY}, Time=${currentTime}`);
  };
  
  

  const handleMouseOut = () => {
    setHoveredWord('');
  };

  

  return (
    <div style={containerStyle}> {/* Flex container for both text displays */}
    {/* Container for After-Visit Summary (Now on the left) */}
    <div style={{width: '50%'}}>
      <div style={labelStyle}>Summary</div> {/* Label for After-Visit Summary */}
      <div
        style={interpTextStyle} // Apply the adjusted style here
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        dangerouslySetInnerHTML={{ __html: getHighlightedText(summarized, mapList, mapRef, hoveredWord) }}
        onClick={handleClick}
      />
    </div>
    {/* Container for Progress Note (Now on the right) */}
    <div style={{width: '50%'}}>
      <div style={labelStyle}>Progress Note</div> {/* Label for Progress Note */}
      <div
        style={textStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        dangerouslySetInnerHTML={{ __html: getHighlightedText(text, mapList, mapRef, hoveredWord) }}
        onClick={handleClick}
      />
    </div>

    {showPopup && (
      <div
        className="popup"
        style={{
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: popupContent }}></div>
        <button onClick={() => setShowPopup(false)}>Close</button>
      </div>
    )}


    </div>
  );
}

export default TextDisplay;