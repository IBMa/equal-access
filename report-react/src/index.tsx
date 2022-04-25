import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { SavedReport } from './SavedReport';
import { ISavedReportData } from './IReport';
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <ACEReport />
//   </React.StrictMode>
// , document.getElementById('root') as HTMLElement);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
export const ACEREPORT: ISavedReportData | null = (window as any).ACEREPORT;

window.addEventListener("DOMContentLoaded", (evt) => {
    const domContainer = document.querySelector('#ace-report');

    ReactDOM.render(<SavedReport reportData={ACEREPORT} />, domContainer);
})