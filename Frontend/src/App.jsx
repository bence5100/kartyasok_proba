import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import MovieDetails from "./components/MovieDetails";
import Booking from "./components/Booking";
import UserBookings from "./components/UserBookings";
import Admin from "./components/Admin";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<UserBookings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;