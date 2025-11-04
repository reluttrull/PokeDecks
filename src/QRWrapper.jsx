import React from 'react';
import QRCode from "react-qr-code";
import './App.css';

const QRWrapper = ({url}) => {

  return (
    <>
    <div style={{ background: '#eee', padding: '8px' }}>
        <QRCode value={url} className="qr" />
    </div>
    <small>{url}</small>
    </>
  );
};

export default QRWrapper;
