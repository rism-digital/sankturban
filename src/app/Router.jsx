import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import JsonSearch from './pages/JsonSearch.jsx';
import JsonBrowse from './pages/JsonBrowse.jsx';
import Book from './pages/Book.jsx';
import StaticHtml from './pages/StaticHtml.jsx';
import Index from './pages/Index.jsx';

import AnalysisState from './context/AnalysisState.jsx';
import CustomState from './context/CustomState.jsx';


const Router = () => (
    <BrowserRouter>
        <AnalysisState>
            <CustomState>
                <Routes>
                    <Route path="/page/:filename" element={<StaticHtml />} />
                    <Route path="/" exact element={<Index />} />
                    <Route path="/search" exact element={<JsonSearch />} />
                    <Route path="/browse" exact element={<JsonBrowse />} />
                    <Route path="/book" exact element={<Book />} />
                </Routes>
            </CustomState>
        </AnalysisState>
    </BrowserRouter>
);

export default Router;