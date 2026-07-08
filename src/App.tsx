import './App.css'
import { DateTime } from 'luxon'
import { getSunPositionSeries } from './domain/sunTimes'

function App() {
  const sunTimes = getSunPositionSeries(DateTime.now(), 44.816245, 20.460469, 5);
  console.log(sunTimes)

  return (
    <>
      Hello, World!
    </>
  )
}

export default App
