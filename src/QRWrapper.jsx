import React from 'react';
import QRCode from "react-qr-code";
import './App.css';

const QRWrapper = ({url}) => {

  return (
    <>
    <div style={{ background: '#eee', padding: '8px' }}>
        <QRCode value={url} className="qr" />
    </div>
    <button id="copy-url-button" className="button" onClick={() => navigator.clipboard.writeText(url)}>Copy hand URL</button>
    </>
  );
};

export default QRWrapper;
