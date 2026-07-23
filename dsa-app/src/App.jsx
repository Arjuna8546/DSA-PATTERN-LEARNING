import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './lib/ThemeContext'
import Home from './pages/Home.jsx'
import PatternDetail from './pages/PatternDetail.jsx'
import Solve from './pages/Solve.jsx'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pattern/:dsId/:categoryId/:patternId" element={<PatternDetail />} />
        <Route path="/solve/:questionId" element={<Solve />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
