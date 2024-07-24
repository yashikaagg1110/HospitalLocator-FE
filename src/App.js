import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LocateNearestHospitalMyLoc from './pages/LocateNearestHospitalMyLoc.js';

function App() {
 
  return (
    <div className="App">
      
        <BrowserRouter>
        <Routes>
        <Route index element={<LocateNearestHospitalMyLoc/>}/>
        </Routes>
        </BrowserRouter>
    </div>
  );
}

export default App;
