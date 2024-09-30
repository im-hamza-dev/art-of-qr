import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TextToGraphics from './pages/text-to-graphics/text-to-graphics';
import NoMatch from './pages/no-match/no-match';
import Configuration from './pages/configuration/configuration';
import UploadFont from './pages/uploadFont/uploadFont';

function App() {
  return (
    <div className="App">
    <header className="App-header">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TextToGraphics />} />
          <Route path="/config" element={<Configuration />} />
          <Route path="/uploadFont" element={<UploadFont/>} />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </BrowserRouter>
    </header>
  </div>
  );
}

export default App;
