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

// const mapRef = {}
const mapRef = {
    "decreased range of motion in his neck": `From <a href="https://www.mayoclinic.org/diseases-conditions/cervical-spondylosis/symptoms-causes/syc-20370787#:~:text=pain%20and%20stiffness" target="_blank">https://www.mayoclinic.org/diseases-conditions/cervical-spondylosis/symptoms-causes/syc-20370787#:~:text=pain%20and%20stiffness</a>:\n\n When symptoms do occur, they typically include pain and stiffness in the neck.`,
    "indicating possible nerve impact in the cervix": `From <a href="https://www.mayoclinic.org/diseases-conditions/cervical-spondylosis/symptoms-causes/syc-20370787#:~:text=tingling" target="_blank">https://www.mayoclinic.org/diseases-conditions/cervical-spondylosis/symptoms-causes/syc-20370787#:~:text=tingling</a>: \n\n You might experience tingling, numbness and weakness in the arms`,
    "locations of the C4-5 and C5-6 vertebrae": `From <a href="https://www.spine-health.com/conditions/degenerative-disc-disease/cervical-degenerative-disc-disease" target="_blank">https://www.spine-health.com/conditions/degenerative-disc-disease/cervical-degenerative-disc-disease</a>:\n\n It can occur in any of the cervical discs but is slightly more likely to occur at the C5-C6 level`
  }

//   ,
//   "sensitivity": "https://connect.mayoclinic.org/discussion/upper-limit-of-rom-after-knee-replacement/",
//   "extension": "https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/triceps-extension/vid-20084676",
//   "interossei": "https://www.mayoclinic.org/biographies/hagedorn-jonathan-jon-m-m-d/publications/pbc-20464824",
//   "degenerative disease": "https://www.mayoclinic.org/diseases-conditions/osteoarthritis/expert-answers/arthritis/faq-20058457"
// };


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
  };
  

  const handleMouseOut = () => {
    setHoveredWord('');
  };

  

  return (
    <div style={textStyle}>
      <div
        style={textStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        dangerouslySetInnerHTML={{ __html: getHighlightedText(text, mapList, mapRef, hoveredWord, phraseMapping, clickedIndex) }}
        onClick={handleClick}
      />
      <div
        style={textStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        dangerouslySetInnerHTML={{ __html: getHighlightedText(summarized, mapList, mapRef, hoveredWord, phraseMapping, clickedIndex) }}
        onClick={handleClick}
      />

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