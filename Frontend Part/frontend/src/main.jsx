import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import "./index.css";
import App              from "./Routes/App";
import Home             from "./pages/Home.jsx";
import Login            from "./pages/Login.jsx";
import Services         from "./pages/Services.jsx";
import SignUp           from "./pages/SignUp.jsx";
import About            from "./pages/About.jsx";
import Profile          from "./pages/Profile.jsx";
import Orders           from "./pages/Orders.jsx";
import ChefOrders       from "./pages/ChefOrders.jsx";
import Payments         from "./pages/Payments.jsx";
import RecommendedChefs from "./pages/RecommendedChefs.jsx"; 
import ContactUs from "./pages/ContactUs.jsx"; 
import Privacy from "./pages/Privacy.jsx";
import Terms from "./pages/Terms.jsx";
import NotFound from "./pages/NotFound.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/"              element={<Home />} />
      <Route path="/services"      element={<Services />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/signup"        element={<SignUp />} />
      <Route path="/about"         element={<About />} />
      <Route path="/orders"        element={<Orders />} />
      <Route path="/contactus"     element={<ContactUs />} />
      <Route path="/chef-orders"   element={<ChefOrders />} />
      <Route path="/profile"       element={<Profile />} />
      <Route path="/payments"      element={<Payments />} />
      <Route path="/recommended"   element={<RecommendedChefs />} /> 
      <Route path="/privacy"       element ={<Privacy/>} />
      <Route path="/terms"         element ={<Terms/>} />
      <Route path="*"              element={ <NotFound/>}/>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);