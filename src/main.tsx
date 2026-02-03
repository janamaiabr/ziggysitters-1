import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import "react-day-picker/dist/style.css";

// GA4 setup — expose gtag globally for conversion tracking
const GA_ID = 'G-H9K8JN5BB9';
const gtagScript = document.createElement('script');
gtagScript.async = true;
gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
document.head.appendChild(gtagScript);

window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(...args: any[]) { window.dataLayer.push(args); };
window.gtag('js', new Date());
window.gtag('config', GA_ID);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
