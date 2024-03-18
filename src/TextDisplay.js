import React, { useState, useEffect } from 'react';
import './TextDisplay.css';

const mapRef = {}
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
  const [logMessages, setLogMessages] = useState([]);
  const [clickTimes, setClickTimes] = useState([]);
  const [mapList, setMapList] = useState({}); // Now this will be set dynamically
  const [phraseMapping, setPhraseMapping] = useState({}); // Now this will be set dynamically
  const [evidenceText, setEvidenceText] = useState([]);
  const [highlightEvidence, setHighlightEvidence] = useState(false);


  useEffect(() => {
    const toggleHighlight = (event) => {
      // Check both the key and code to cover various browsers and OS
      if (event.key === "Alt" || event.code === "AltLeft" || event.code === "AltRight") {
        setHighlightEvidence(event.type === 'keydown'); // true for keydown, false for keyup
      }
    };
  
    // Add event listeners for both keydown and keyup
    window.addEventListener('keydown', toggleHighlight);
    window.addEventListener('keyup', toggleHighlight);
  
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('keydown', toggleHighlight);
      window.removeEventListener('keyup', toggleHighlight);
    };
  }, []);
  

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const fileNumber = queryParams.get('file') || '1'; // Default to 1 if not specified
    const type = queryParams.get('type') || 'c'; // 'e' for experimental, 'c' for control

    import(`/ehr${fileNumber}-dict${type}.json`)
      .then(data => {
        setMapList(data.default); // Make sure to use data.default with dynamic imports
      })
      .catch(error => console.error('Failed to load map list:', error));

    fetch(`/ehr${fileNumber}.txt`)
      .then(response => response.text())
      .then(data => setText(data))
      .catch(error => console.error('Error loading text:', error));

    fetch(`/ehr${fileNumber}-interp.txt`)
      .then(response => response.text())
      .then(data => setSummarized(data))
      .catch(error => console.error('Error loading summarized text:', error));


    
  }, [window.location.search]);

  
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


  const logAndDownloadUtcTime = () => {
    const utcTime = new Date().toUTCString(); // Get current UTC time
    // Prepare log message for download
    const logMessage = `Button clicked at UTC time: ${utcTime}`;
    // Optionally, log to console or another logging mechanism
    console.log(logMessage);

    // Prepare and download the log file
    const blob = new Blob([logMessage], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'utc-time-log.txt';
    document.body.appendChild(link);
    link.click();

    // Clean-up
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  

  const getHighlightedText = (inputText, map, mapRef, evidenceText, highlightEvidence) => {
    let highlightedText = inputText;
  
    // Function to escape regex special characters
    const escapeRegExp = (text) => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  
    // Highlight phrases with potential punctuation
    highlightedWords.forEach(phrase => {
      const escapedPhrase = escapeRegExp(phrase);
      // Adjusted to match phrase potentially followed by punctuation
      const phraseRegex = new RegExp(`(${escapedPhrase})(?=[\\s.,;!?]|$)`, 'gi');
      highlightedText = highlightedText.replace(phraseRegex, `<span class="highlight-pink">$&</span>`);
    });
  
    Object.entries(map).forEach(([key, value]) => {
      const escapedKey = escapeRegExp(key);
      const escapedValue = escapeRegExp(value);
      // Adjusted regex to handle punctuation
      const keyRegex = new RegExp(`(${escapedKey})(?=[\\s.,;!?]|$)`, 'gi');
      const valueRegex = new RegExp(`(${escapedValue})(?=[\\s.,;!?]|$)`, 'gi');
  
      highlightedText = highlightedText.replace(keyRegex, (_, match) => 
        `<span class="${hoveredWord === key ? 'highlight highlight-active' : 'highlight'}" data-word="${key}">${match}</span>`
      );

      highlightedText = highlightedText.replace(valueRegex, (_, match) => 
      `<span class="${hoveredWord === key ? 'highlight-value highlight-active' : 'highlight-value'}" data-word="${key}">${match}</span>`
    );

      
      // Highlighting key when the value is hovered
    if (hoveredWord === value) {

      highlightedText = highlightedText.replace(keyRegex, `<span class="highlight highlight-active" data-word="${value}">${key}</span>`);
    } else {
      highlightedText = highlightedText.replace(keyRegex, `<span class="${hoveredWord === key ? 'highlight highlight-active' : 'highlight'}" data-word="${key}">${key}</span>`);
    }
    // Highlighting value when the key is hovered
    if (hoveredWord === key) {
      highlightedText = highlightedText.replace(valueRegex, `<span class="highlight-value highlight-active" data-word="${key}">${value}</span>`);
    }
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
        dangerouslySetInnerHTML={{ __html: getHighlightedText(summarized, mapList, mapRef, hoveredWord, evidenceText, highlightEvidence) }}
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
        dangerouslySetInnerHTML={{ __html: getHighlightedText(text, mapList, mapRef, hoveredWord, evidenceText, highlightEvidence) }}
        onClick={handleClick}
      />
    </div>
    <button
    style={{opacity: 10, position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}
    onClick={logAndDownloadUtcTime}
    aria-hidden="true"
>
    Log and Download UTC
</button>



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