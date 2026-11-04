import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import PublicWebsiteApp from './components/modules/website/site/PublicWebsiteApp.tsx';
import './index.css';

const JALUR_SITUS_PUBLIK = /^\/web\/?/;

const adalahSitusPublik = JALUR_SITUS_PUBLIK.test(window.location.pathname);

createRoot(document.getElementById('root')!).render(adalahSitusPublik ? <PublicWebsiteApp /> : <App />);
