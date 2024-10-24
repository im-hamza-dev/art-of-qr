import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TextToGraphics from './pages/text-to-graphics/text-to-graphics';
import NoMatch from './pages/no-match/no-match';
import UploadFont from './pages/uploadFont/uploadFont';
import { useState } from 'react';

function App() {
  const [config, setConfig] = useState({
    format: 'left'
  })
  const [text, setText] = useState("")
  const [textInput, setTextInput] = useState(""); // Default text

  return (
    <div className="App">
    <header className="App-header">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TextToGraphics config={config} text={text} setText={setText} textInput={textInput} setTextInput={setTextInput}  />} />
          <Route path="/config" element={<UploadFont setConfig = {setConfig} config={config}/>} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </BrowserRouter>
    </header>
  </div>
  );
}

export default App;
