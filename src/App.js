import React from 'react';
import './App.css';
import TextDisplay from './TextDisplay';
// import ChattyApp from './ChatComplete';

const mapList = {
  "ventricular tachycardia": "fast heartbeat",
  "EKG": "electrocardiogram (ECG/EKG)",
  "Lasix": "medicine to slow down the heart rate",
  "Ativan": "help them relax",
  "ED": "Emergency Department",
  "metoprolol": "help with fluid build-up",
  "pacer": "the device used to regulate their heart rhythm"
};

function App() {
  return (
    <div className="App">

      <h1 className='body'> 
      <TextDisplay mapList={mapList} />
      {/* <ChattyApp mapList={mapList} /> */}
      </h1>
    </div>
  );
}

export default App;
