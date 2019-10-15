import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageBatchLoader from './components/ImageBatchLoader'

function App() {
  return (
    <div className="App">
      <h2>Image Cropping Service</h2>
      <ImageBatchLoader />
    </div>
  );
}

export default App;
