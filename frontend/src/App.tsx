import Sidebar from './components/Sidebar'
import Input from './components/Input'
import './App.css'

function App() {

  return (
    <section id="root">
      <Sidebar />
      <section id="main">
        <Input />
      </section>
    </section>
  )
}

export default App
